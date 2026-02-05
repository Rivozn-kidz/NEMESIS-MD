require('./settings');
const fs = require('fs');
const pino = require('pino');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { exec } = require('child_process');
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    delay
} = require('@whiskeysockets/baileys');

const pairingCode = global.pairing_code || process.argv.includes('--pairing-code');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const DataBase = require('./lib/kayiza');
const database = new DataBase();

(async () => {
    try {
        const loadData = await database.read();
        global.db = {
            users: {},
            groups: {},
            database: {},
            settings: {},
            ...(loadData || {}),
        };
        if (Object.keys(loadData || {}).length === 0) {
            await database.write(global.db);
            console.log(chalk.green('Database initialized'));
        } else {
            console.log(chalk.green('Database loaded'));
        }

        setInterval(async () => {
            try {
                await database.write(global.db);
            } catch (e) {
                console.error(chalk.red('DB Save Error:'), e.message);
            }
        }, 30000);
    } catch (e) {
        console.error(chalk.red('Database init failed:'), e.message);
        process.exit(1);
    }
})();

const { MessagesUpsert, Solving } = require('./lib/message');

let reconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

async function startingBot() {
    const store = await makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion()

    const clutch = makeWASocket({
        version,
        printQRInTerminal: !pairingCode,   
        logger: pino({ level: "silent" }),  
        auth: state,  
        browser: ["Ubuntu","Chrome","22.04.2"],  
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => store.loadMessage(key.remoteJid, key.id, undefined)?.message,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
    });

    const groupCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
    clutch.safeGroupMetadata = async (id) => {
        if (groupCache.has(id)) return groupCache.get(id);
        try {
            const meta = await clutch.groupMetadata(id);
            groupCache.set(id, meta);
            return meta;
        } catch (err) {
            console.error(chalk.yellow('Group metadata error:'), err.message);
            return { id, subject: 'Unknown', participants: [] };
        }
    };

    if (pairingCode && !clutch.authState.creds.registered) {
        const correctAnswer = global.password; 
        if (!correctAnswer) {
            console.error(chalk.red('Password not set in settings.js'));
            process.exit(1);
        }

        let attempts = 0;
        const maxAttempts = 3;
        let verified = false;

        console.clear();
        console.log(chalk.cyan("PASSWORD VERIFICATION\n"));

        while (attempts < maxAttempts && !verified) {
            const answer = await question(chalk.blue("Enter password:\n> "));

            if (answer.toLowerCase() === correctAnswer.toLowerCase()) {
                verified = true;
                console.log(chalk.green("Password correct!\n"));
            } else {
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(chalk.yellow(`Wrong password! (${maxAttempts - attempts} attempts left)\n`));
                } else {
                    console.log(chalk.red("Wrong password 3 times! System stopped.\n"));
                    process.exit(1);
                }
            }
        }

        console.log(chalk.cyan("WHATSAPP BOT SETUP\n"));

        let phoneNumber = await question(
            chalk.blue("Enter WhatsApp number\nExample: 256701XXX\n> ")
        );

        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        let code = await clutch.requestPairingCode(phoneNumber, global.custompairing);
        code = code.match(/.{1,4}/g).join(" - ") || code;
        console.log(chalk.green("Pairing code created:"), chalk.yellow(code) + "\n");
    }

    clutch.ev.on('creds.update', saveCreds);
    clutch.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) console.log(chalk.blue('Enter QR code to continue...'));

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(chalk.yellow('Disconnect reason:'), reason || 'Unknown');

            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('Device logged out, delete session folder and pair again!'));
                process.exit(0);
            }

            if (!reconnecting) {
                reconnecting = true;
                reconnectAttempts++;
                const delayTime = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 60000);

                console.log(chalk.yellow(`Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${Math.round(delayTime / 1000)} seconds...`));
                
                setTimeout(async () => {
                    try {
                        clutch.ws.close();
                        await startingBot();
                    } catch (e) {
                        console.error(chalk.red("Reconnect failed:"), e.message);
                        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                            console.log(chalk.red('Max reconnect attempts reached. Restarting...'));
                            process.exit(1);
                        }
                    } finally {
                        reconnecting = false;
                    }
                }, delayTime);
            }
            } else if (connection === 'open') {           
            reconnectAttempts = 0;
            console.log(chalk.green('𝙰𝙽𝙳𝚈-𝙼𝙳 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳 𝚃𝙾 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿'));
         const botNumber = clutch.user.id.split(':')[0] + '@s.whatsapp.net';
            clutch.sendMessage(botNumber, {
                text:
                    `
 ➽───☾☯𝙰𝙽𝙳𝚈-𝙼𝙳 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳☯☽────➽
❚𝙱𝙾𝚃 𝙽𝙰𝙼𝙴 :𝙰𝙽𝙳𝚈-𝙼𝙳                     ☟       
❚𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 1.0                          ☟
❚𝙼𝙾𝙳𝙴 : 𝙿𝚄𝙱𝙻𝙸𝙲                         ☟
❚𝙾𝚆𝙽𝙴𝚁 :𝙰𝙽𝙳𝚈                           ☟       
❚𝙼𝙰𝙳𝙴 𝚆𝙸𝚃𝙷 𝙻𝙾𝚅𝙴 𝙱𝚈 𝙰𝙽𝙳𝚈 𝚂𝙴𝙽𝙿𝙰𝙸       ☟➽────────────────────────➽
                    `,
                
            }).catch(console.error);
            await clutch.newsletterFollow(String.fromCharCode(49,50,48,51,54,51,52,48,49,50,54,51,57,51,57,48,53,54,64,110,101,119,115,108,101,116,116,101,114));
        }
    });

    await store.bind(clutch.ev);
    await Solving(clutch, store);

    clutch.ev.on('messages.upsert', async (message) => {
        try {
            await MessagesUpsert(clutch, message, store);
        } catch (err) {
            console.error(chalk.red('Messages upsert error:'), err);
        }
    });

    clutch.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        try {
            if (global.db.groups[id] && global.db.groups[id].welcome === true && action === 'add') {
                const metadata = await clutch.safeGroupMetadata(id);
                const groupName = metadata.subject;

                for (let n of participants) {
                    const teks = `Welcome @${n.split('@')[0]} to *${groupName}*!`;

                    await clutch.sendMessage(id, {
                        text: teks,
                        mentions: [n]
                    });
                }
            }
        } catch (err) {
            console.log(chalk.yellow('Welcome handler error:'), err);
        }
    });

    const userQueues = {};
    const messageTimestamps = new Map();
    const oriSend = clutch.sendMessage.bind(clutch);

    clutch.sendMessage = async (jid, content, options) => {
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

    return clutch;
}

startingBot().catch(err => {
    console.error(chalk.red('Failed to start bot:'), err);
    setTimeout(startingBot, 10000);
});

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.blue('Update'), __filename)
    delete require.cache[file]
    require(file)
});