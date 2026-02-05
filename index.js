/*
  NEMESIS MD
  Owners: Kevin Tech x Ridz Coder
*/

require('./settings')

const fs = require('fs')
const pino = require('pino')
const path = require('path')
const chalk = require('chalk')
const readline = require('readline')
const { exec } = require('child_process')
const { Boom } = require('@hapi/boom')
const NodeCache = require('node-cache')

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    delay
} = require('@whiskeysockets/baileys')

const pairingCode = global.pairing_code || process.argv.includes('--pairing-code')

const DataBase = require('./lib/kayiza')
const database = new DataBase()

/* ================= DATABASE ================= */

;(async () => {
    try {
        const loadData = await database.read()
        global.db = {
            users: {},
            groups: {},
            database: {},
            settings: {},
            ...(loadData || {})
        }

        if (!loadData || Object.keys(loadData).length === 0) {
            await database.write(global.db)
            console.log(chalk.green('Database initialized'))
        } else {
            console.log(chalk.green('Database loaded'))
        }

        setInterval(async () => {
            try {
                await database.write(global.db)
            } catch (e) {
                console.error(chalk.red('DB Save Error:'), e.message)
            }
        }, 30000)
    } catch (e) {
        console.error(chalk.red('Database init failed:'), e.message)
        process.exit(1)
    }
})()

/* ================= BOT ================= */

const { MessagesUpsert, Solving } = require('./lib/message')

let reconnecting = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

async function startingBot () {
    const store = makeInMemoryStore({
        logger: pino().child({ level: 'silent', stream: 'store' })
    })

    const { state, saveCreds } = await useMultiFileAuthState('session')
    const { version } = await fetchLatestBaileysVersion()

    const ridzcoder = makeWASocket({
        version,
        printQRInTerminal: !pairingCode,
        logger: pino({ level: 'silent' }),
        auth: state,
        browser: ['Ubuntu', 'Chrome', '22.04.2'],
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        getMessage: async (key) =>
            store.loadMessage(key.remoteJid, key.id)?.message
    })

    store.bind(ridzcoder.ev)

    /* ========== GROUP CACHE ========== */

    const groupCache = new NodeCache({ stdTTL: 300, checkperiod: 120 })

    ridzcoder.safeGroupMetadata = async (id) => {
        if (groupCache.has(id)) return groupCache.get(id)
        try {
            const meta = await ridzcoder.groupMetadata(id)
            groupCache.set(id, meta)
            return meta
        } catch {
            return { id, subject: 'Unknown', participants: [] }
        }
    }

    console.log(chalk.cyan('\nNEMESIS MD WHATSAPP BOT STARTING...\n'))

    /* ========== PAIRING CODE ========== */

    if (pairingCode && !ridzcoder.authState.creds.registered) {
        let code = await ridzcoder.requestPairingCode(
            global.botNumber.split('@')[0],
            global.custompairing
        )
        code = code.match(/.{1,4}/g).join(' - ')
        console.log(chalk.green('Pairing Code:'), chalk.yellow(code), '\n')
    }

    /* ========== EVENTS ========== */

    ridzcoder.ev.on('creds.update', saveCreds)

    ridzcoder.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) console.log(chalk.blue('Scan QR Code...'))

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode

            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('Logged out. Delete session and re-pair.'))
                process.exit(0)
            }

            if (!reconnecting) {
                reconnecting = true
                reconnectAttempts++

                const delayTime = Math.min(
                    5000 * Math.pow(1.5, reconnectAttempts),
                    60000
                )

                console.log(
                    chalk.yellow(
                        `Reconnect ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${Math.round(
                            delayTime / 1000
                        )}s`
                    )
                )

                setTimeout(async () => {
                    try {
                        await startingBot()
                    } catch (e) {
                        console.error(chalk.red('Reconnect failed:'), e.message)
                        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS)
                            process.exit(1)
                    } finally {
                        reconnecting = false
                    }
                }, delayTime)
            }
        }

        if (connection === 'open') {
            reconnectAttempts = 0
            console.log(chalk.green('NEMESIS MD CONNECTED'))

            const botJid =
                ridzcoder.user.id.split(':')[0] + '@s.whatsapp.net'

            await ridzcoder.sendMessage(botJid, {
                text: `
╭───𓊈🏔️ NEMESIS MD CONNECTED 🏔️𓊉───
│ Bot: Nemesis MD
│ Owners: Kevin Tech x Ridz Coder
│ Mode: Public
│ Version: 1.0.0
╰────────────────────────────`
            })
        }
    })

    /* ========== MESSAGE HANDLERS ========== */

    await Solving(ridzcoder, store)

    ridzcoder.ev.on('messages.upsert', async (m) => {
        try {
            await MessagesUpsert(ridzcoder, m, store)
        } catch (e) {
            console.error(chalk.red('Message Error:'), e)
        }
    })

    ridzcoder.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update
        if (action !== 'add') return
        if (!global.db.groups[id]?.welcome) return

        const meta = await ridzcoder.safeGroupMetadata(id)

        for (const user of participants) {
            await ridzcoder.sendMessage(id, {
                text: `Welcome @${user.split('@')[0]} to *${meta.subject}*`,
                mentions: [user]
            })
        }
    })

    /* ========== RATE LIMIT ========== */

    const queues = {}
    const lastSend = new Map()
    const send = ridzcoder.sendMessage.bind(ridzcoder)

    ridzcoder.sendMessage = async (jid, content, options) => {
        const now = Date.now()
        const last = lastSend.get(jid) || 0

        if (now - last < 50) await delay(50 - (now - last))

        queues[jid] ??= Promise.resolve()

        queues[jid] = queues[jid].then(async () => {
            try {
                const res = await send(jid, content, options)
                lastSend.set(jid, Date.now())
                return res
            } catch {}
        })

        return queues[jid]
    }

    return ridzcoder
}

/* ================= START ================= */

startingBot().catch((e) => {
    console.error(chalk.red('Failed to start bot:'), e)
    setTimeout(startingBot, 10000)
})

/* ================= HOT RELOAD ================= */

const file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.blue('Updated:'), __filename)
    delete require.cache[file]
    require(file)
})