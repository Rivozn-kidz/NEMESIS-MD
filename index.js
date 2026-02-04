require('./settings');
const fs = require('fs');
const pino = require('pino');
const chalk = require('chalk');
const NodeCache = require('node-cache');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore, fetchLatestBaileysVersion, delay } = require('@whiskeysockets/baileys');

const DataBase = require('./lib/kayiza');
const database = new DataBase();
const { MessagesUpsert, Solving } = require('./lib/message');

let reconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const pairingCode = global.pairing_code || process.argv.includes('--pairing-code');

(async () => {
    try {
        const loadData = await database.read();
        global.db = { users: {}, groups: {}, database: {}, settings: {}, ...(loadData || {}) };
        if (!Object.keys(loadData || {}).length) {
            await database.write(global.db);
            console.log(chalk.green('Database initialized'));
        } else console.log(chalk.green('Database loaded'));

        setInterval(async () => {
            try { await database.write(global.db); } 
            catch (e) { console.error(chalk.red('DB Save Error:'), e.message); }
        }, 30000);
    } catch (e) {
        console.error(chalk.red('Database init failed:'), e.message);
        process.exit(1);
    }
})();

async function startingBot() {
    const store = await makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const ridzcoder = makeWASocket({
        version,
        printQRInTerminal: !pairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "22.04.2"],
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => store.loadMessage(key.remoteJid, key.id, undefined)?.message,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
    });

    // ========== SAFE GROUP METADATA ==========
    const groupCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
    ridzcoder.safeGroupMetadata = async (id) => {
        if (groupCache.has(id)) return groupCache.get(id);
        try {
            const meta = await ridzcoder.groupMetadata(id);
            groupCache.set(id, meta);
            return meta;
        } catch {
            return { id, subject: 'Unknown', participants: [] };
        }
    };

    // ========== PAIRING ==========
    console.log(chalk.cyan("NEMESIS MD WHATSAPP BOT SETUP\n"));
    if (pairingCode && !ridzcoder.authState.creds.registered) {
        const code = await ridzcoder.requestPairingCode(global.botNumber.split('@')[0], global.custompairing);
        console.log(chalk.green("Pairing code created:"), chalk.yellow(code.match(/.{1,4}/g).join(" - ")) + "\n");
    }

    ridzcoder.ev.on('creds.update', saveCreds);

    // ========== CONNECTION HANDLER ==========
    ridzcoder.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) console.log(chalk.blue('Scan QR code to continue...'));

        if (connection === 'close') {
            const reason = lastDisconnect?.error ? require('@hapi/boom').Boom(lastDisconnect.error).output?.statusCode : null;
            console.log(chalk.yellow('Disconnect reason:'), reason || 'Unknown');

            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('Device logged out, delete session folder and pair again!'));
                process.exit(0);
            }

            if (!reconnecting) {
                reconnecting = true;
                reconnectAttempts++;
                const delayTime = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 60000);
                console.log(chalk.yellow(`Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${Math.round(delayTime/1000)}s...`));

                setTimeout(async () => {
                    try {
                        ridzcoder.ws.close();
                        await startingBot();
                    } catch (e) {
                        console.error(chalk.red("Reconnect failed:"), e.message);
                        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) process.exit(1);
                    } finally { reconnecting = false; }
                }, delayTime);
            }

        } else if (connection === 'open') {
            reconnectAttempts = 0;
            console.log(chalk.green('Nᴇᴍᴇsɪs ᴍᴅ connected to WhatsApp'));

            // set global bot number
            global.botNumber = ridzcoder.user.id.split(':')[0] + '@s.whatsapp.net';

            // send startup message to bot itself
            ridzcoder.sendMessage(global.botNumber, {
                text: `
╭───𓊈🏔️ *NEMESIS MD CONNECTED* 🏔️𓊉───▢
│┃➪ Bot Name : ɴᴇᴍᴇsɪs ᴍᴅ
│┃➪ Owner    : ${global.namaOwner}
│┃➪ Mode     : Public
│┃➪ Version  : ${global.versi}
╰───────Rɪᴅᴢ Cᴏᴅᴇʀ❦────────▢
> Brought to you by ${global.namaOwner}
                `
            }).catch(console.error);
        }
    });

    await store.bind(ridzcoder.ev);
    await Solving(ridzcoder, store);

    // ========== MESSAGES HANDLER ==========
    ridzcoder.ev.on('messages.upsert', async (message) => {
        try { await MessagesUpsert(ridzcoder, message, store); } 
        catch (err) { console.error(chalk.red('Messages upsert error:'), err); }
    });

    // ========== GROUP WELCOME ==========
    ridzcoder.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        try {
            if (global.db.groups[id]?.welcome && action === 'add') {
                const metadata = await ridzcoder.safeGroupMetadata(id);
                const groupName = metadata.subject;
                for (let n of participants) {
                    await ridzcoder.sendMessage(id, { text: `Welcome @${n.split('@')[0]} to *${groupName}*!`, mentions: [n] });
                }
            }
        } catch (err) { console.log(chalk.yellow('Welcome handler error:'), err); }
    });

    // ========== RATE LIMIT HANDLER ==========
    const userQueues = {};
    const messageTimestamps = new Map();
    const oriSend = ridzcoder.sendMessage.bind(ridzcoder);

    ridzcoder.sendMessage = async (jid, content, options) => {
        const now = Date.now();
        const lastSent = messageTimestamps.get(jid) || 0;
        if (now - lastSent < 50) await delay(50 - (now - lastSent));
        if (!userQueues[jid]) userQueues[jid] = Promise.resolve();

        userQueues[jid] = userQueues[jid].then(() => new Promise(async (resolve) => {
            try {
                const result = await oriSend(jid, content, options);
                messageTimestamps.set(jid, Date.now());
                resolve(result);
            } catch (err) {
                console.error(chalk.red('Send message error:'), err.message);
                resolve();
            }
        }));
        return userQueues[jid];
    };

    return ridzcoder;
}

startingBot().catch(err => {
    console.error(chalk.red('Failed to start nemesis md:'), err);
    setTimeout(startingBot, 10000);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.blue('Update'), __filename);
    delete require.cache[file];
    require(file);
});