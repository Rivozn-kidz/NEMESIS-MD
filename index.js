require('./settings');
const fs = require('fs');
const pino = require('pino');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');
const { exec } = require('child_process');
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');
const timezones = global.timezones || "Africa/Kampala";
const moment = require('moment-timezone');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    browser,
    fetchLatestBaileysVersion,
    delay
} = require('@whiskeysockets/baileys');
const msgRetryCounterCache = new NodeCache();

// Import makeInMemoryStore separately
const { makeInMemoryStore } = require('./lib/store');
const db = require('./lib/databaseManager');

const pairingCode = true;

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
            console.log(chalk.green('NEMESIS MD DATABASE INITIALIZED'));
        } else {
            console.log(chalk.green('NEMESIS MD DATABASE LOADED'));
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
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
    const { state, saveCreds } = await useMultiFileAuthState('session');
    let waVersion;
    try {
        const { version } = await fetchLatestBaileysVersion();
        waVersion = version;
        console.log("[ NEMESIS] Connecting to WhatsApp ⏳️...");
    } catch (error) {
        console.log(chalk.yellow(`[⚠️] Using stable fallback version`));
        waVersion = [2, 3000, 1017546695]; 
    }
      
    const clutch = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !pairingCode,
    auth: state,
    version: waVersion,
    browser: ["Ubuntu", "Chrome", "120.0.0.0"],
    msgRetryCounterCache: msgRetryCounterCache
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
        console.clear();
        console.log(chalk.cyan("NEMESIS MD SETUP WIZARD\n"));

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const question = (q) => new Promise(res => rl.question(q, res));

        let phoneNumber = await question(
            chalk.blue("Enter WhatsApp number\nExample: 256701XXXXXX\n> ")
        );
        rl.close();

        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        let code = await clutch.requestPairingCode(phoneNumber, global.custompairing);
        code = code.match(/.{1,4}/g).join(" - ") || code;
        console.log(chalk.green("Pairing code:"), chalk.yellow(code), "\n");
    }

    clutch.ev.on('creds.update', saveCreds);

    clutch.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) console.log(chalk.blue('Scan the QR code to continue'));

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(chalk.yellow('Disconnected:'), reason || 'Unknown');

            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('Logged out. Delete session and reconnect.'));
                process.exit(0);
            }

            if (!reconnecting) {
                reconnecting = true;
                reconnectAttempts++;
                const delayTime = Math.min(5000 * Math.pow(1.5, reconnectAttempts), 60000);

                setTimeout(async () => {
                    try {
                        clutch.ws.close();
                        await startingBot();
                    } catch (e) {
                        console.error(chalk.red("Reconnect failed:"), e.message);
                        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                            process.exit(1);
                        }
                    } finally {
                        reconnecting = false;
                    }
                }, delayTime);
            }
        } else if (connection === 'open') {
            reconnectAttempts = 0;
            console.log(chalk.green('NEMESIS MD WA BOT CONNECTED SUCCESSFULLY'));

            const botNumber = clutch.user.id.split(':')[0] + '@s.whatsapp.net';
            clutch.sendMessage(botNumber, {
                text: ` 


╭──⧼♛ *NEMESIS MD CONNECTED* ♛⧽──≽
│┃ ♛ Bᴏᴛ ɴᴀᴍᴇ : ɴᴇᴍᴇsɪs ᴍᴅ
│┃ ♛ Oᴡɴᴇʀs    : Kᴇᴠɪɴ ᴛᴇᴄʜ x Rɪᴅᴢ Cᴏᴅᴇʀ
│┃ ♛ ᴍᴏᴅᴇ      : Pᴜʙʟɪᴄ 
│┃ ♛ Vᴇʀsɪᴏɴ   : 1.0.0
╰───────────────────────≽

> ʙʀᴏᴜɢʜᴛ ᴛᴏ ʏᴏᴜ ʙʏ Kᴇᴠɪɴ ᴛᴇᴄʜ x Rɪᴅᴢ Cᴏᴅᴇʀ
                    
                `
            }).catch(console.error);

            await clutch.newsletterFollow(
                String.fromCharCode(
                    49,50,48,51,54,51,52,48,49,50,54,51,57,51,57,48,53,54,64,110,
                    101,119,115,108,101,116,116,101,114
                )
            );
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
            if (global.db.groups[id]?.welcome && action === 'add') {
                const metadata = await clutch.safeGroupMetadata(id);
                for (let n of participants) {
                    await clutch.sendMessage(id, {
                        text: `Welcome @${n.split('@')[0]} to *${metadata.subject}*!`,
                        mentions: [n]
                    });
                }
            }
        } catch (err) {
            console.log(chalk.yellow('Welcome error:'), err);
        }
    });
    
    clutch.ev.on('call', async (callData) => {
    try {
        const botNumber = await clutch.decodeJid(clutch.user.id);
        
        // GET ANTICALL SETTING FROM SQLITE
        const anticallSetting = await db.get(botNumber, 'anticall', 'off');
        
        if (!anticallSetting || anticallSetting === 'off') {
            console.log(chalk.gray('[ANTICALL] Disabled'));
            return;
        }
        
        for (let call of callData) {
            const from = call.from;
            const callId = call.id;
            
            // Get owners from database
            const owners = await db.get(botNumber, 'owners', []);
            const isOwner = owners.some(num => from.includes(num.replace('+', '').replace(/[^0-9]/g, '')));
            
            if (isOwner) {
                console.log(chalk.green(`[ANTICALL] Allowing call from owner: ${from}`));
                continue;
            }
            
            try {
                const now = Date.now();
                const lastWarn = global.recentCallers?.get(from) || 0;
                const COOLDOWN = 30 * 1000;
                
                if (now - lastWarn < COOLDOWN) {
                    console.log(chalk.yellow(`[ANTICALL] Suppressing repeated warning to ${from}`));
                    try {
                        if (typeof clutch.rejectCall === 'function') {
                            await clutch.rejectCall(callId, from);
                        }
                    } catch (e) {}
                    continue;
                }
                
                if (!global.recentCallers) global.recentCallers = new Map();
                global.recentCallers.set(from, now);
                
                setTimeout(() => {
                    if (global.recentCallers?.has(from)) {
                        global.recentCallers.delete(from);
                    }
                }, COOLDOWN);
                
            } catch (e) {
                console.error(chalk.red('[ANTICALL] recentCallers check failed:'), e);
                if (!global.recentCallers) global.recentCallers = new Map();
            }
            
            console.log(chalk.yellow(`[ANTICALL] ${anticallSetting} call from: ${from}`));
            
            try {
                const callerName = await clutch.getName(from) || from.split('@')[0];
                let warningMessage = '';
                
                if (anticallSetting === 'block') {
                    warningMessage = `🚫 *CALL BLOCKED*\n\n` +
                        `*Caller:* @${from.split('@')[0]}\n` +
                        `*Time:* ${moment().tz(timezones).format('HH:mm:ss')}\n` +
                        `*Date:* ${moment().tz(timezones).format('DD/MM/YYYY')}\n\n` +
                        `*🌹 Hi, I am ${global.botname}, a friendly WhatsApp bot from Uganda 🇺🇬, created by Ridz coder X Kelvin Tech.*\n\n` +
                        `*My owner cannot receive calls at this moment. Calls are automatically blocked.*\n\n` +
                        `> ${global.wm}`;
                } else {
                    warningMessage = `🚫 *CALL DECLINED*\n\n` +
                        `*Caller:* @${from.split('@')[0]}\n` +
                        `*Time:* ${moment().tz(timezones).format('HH:mm:ss')}\n` +
                        `*Date:* ${moment().tz(timezones).format('DD/MM/YYYY')}\n\n` +
                        `*🌹 Hi, I am ${global.botname}, a friendly WhatsApp bot from Uganda 🇺🇬.*\n\n` +
                        `*My owner cannot receive calls at this moment. Please avoid unnecessary calling.*\n\n` +
                        `> ${global.wm}`;
                }

                await clutch.sendMessage(from, { 
                    text: warningMessage,
                    mentions: [from]
                });
                
                console.log(chalk.green(`[ANTICALL] Warning message sent to chat: ${from}`));
                
            } catch (msgError) {
                console.error(chalk.red('[ANTICALL] Failed to send message to chat:'), msgError);
            }
            
            try {
                if (typeof clutch.rejectCall === 'function') {
                    await clutch.rejectCall(callId, from);
                    console.log(chalk.green(`[ANTICALL] Successfully ${anticallSetting === 'block' ? 'blocked' : 'declined'} call from: ${from}`));
                    
                    if (anticallSetting === 'block') {
                        try {
                            await clutch.updateBlockStatus(from, 'block');
                            console.log(chalk.red(`[ANTICALL] Blocked user: ${from}`));
                        } catch (blockError) {
                            console.error(chalk.red('[ANTICALL] Failed to block user:'), blockError);
                        }
                    }
                } else {
                    console.log(chalk.yellow('[ANTICALL] conn.rejectCall not available'));
                }
            } catch (rejectError) {
                console.error(chalk.red('[ANTICALL] Failed to decline/block call:'), rejectError);
            }
        }
    } catch (error) {
        console.error(chalk.red('[ANTICALL ERROR]'), error);
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

        userQueues[jid] = userQueues[jid].then(() =>
            oriSend(jid, content, options).then(res => {
                messageTimestamps.set(jid, Date.now());
                return res;
            }).catch(err => {
                console.error(chalk.red('Send error:'), err.message);
            })
        );

        return userQueues[jid];
    };

    return clutch;
}

startingBot().catch(err => {
    console.error(chalk.red('Failed to start bot:'), err);
    setTimeout(startingBot, 10000);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.blue('Updated'), __filename);
    delete require.cache[file];
    require(file);
});