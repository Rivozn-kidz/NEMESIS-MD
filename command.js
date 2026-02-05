process.on('uncaughtException', console.error)
process.on('unhandledRejection', console.error)

require('./settings');
const fs = require('fs');
const path = require('path');
const util = require('util');
const jimp = require('jimp');
const axios = require('axios');
const chalk = require('chalk');
const yts = require('yt-search');
const ytdl = require('@vreden/youtube_scraper');
const speed = require('performance-now');
const moment = require("moment-timezone");
const nou = require("node-os-utils");
const cheerio = require('cheerio');
const os = require('os');
const { say } = require("cfonts")
const pino = require('pino');
const { Client } = require('ssh2');
const googleTTS = require('google-tts-api');
const fetch = require('node-fetch');
const crypto = require('crypto');
const { exec, spawn, execSync } = require('child_process');
const { default: WAConnection, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, getBinaryNodeChildren, useMultiFileAuthState, generateWAMessageContent, downloadContentFromMessage, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@whiskeysockets/baileys');

const { LoadDataBase } = require('./lib/message');
const contacts = JSON.parse(fs.readFileSync("./lib/database/contacts.json"))
const owners = JSON.parse(fs.readFileSync("./lib/database/owner.json"))
const premium = JSON.parse(fs.readFileSync("./lib/database/premium.json"))
const list = JSON.parse(fs.readFileSync("./lib/database/list.json"))
const { pinterest, pinterest2, remini, mediafire, tiktokDl } = require('./lib/scraper');
const { unixTimestampSeconds, generateMessageTag, processTime, webApi, getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, getTime, formatDate, tanggal, formatp, jsonformat, reSize, toHD, logic, generateProfilePicture, bytesToSize, checkBandwidth, getSizeMedia, parseMention, getGroupAdmins, readFileTxt, readFileJson, getHashedPassword, generateAuthToken, cekMenfes, generateToken, batasiTeks, randomText, isEmoji, getTypeUrlMedia, pickRandom, toIDR, capital } = require('./lib/function');

module.exports = kayiza = async (kayiza, m, chatUpdate, store) => {
        try {
                await LoadDataBase(kayiza, m)
                const botNumber = await kayiza.decodeJid(kayiza.user.id)
                const body = (m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
                const budy = (typeof m.text == 'string' ? m.text : '')
                const prefix = "."
                const isCmd = body.startsWith(prefix) ? true : false
                const args = body.trim().split(/ +/).slice(1)
                const getQuoted = (m.quoted || m)
                const quoted = (getQuoted.type == 'buttonsMessage') ? getQuoted[Object.keys(getQuoted)[1]] : (getQuoted.type == 'templateMessage') ? getQuoted.hydratedTemplate[Object.keys(getQuoted.hydratedTemplate)[1]] : (getQuoted.type == 'product') ? getQuoted[Object.keys(getQuoted)[0]] : m.quoted ? m.quoted : m
                const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ""
                const isPremium = premium.includes(m.sender)
                const isCreator = isOwner = [botNumber, owner+"@s.whatsapp.net", ...owners].includes(m.sender) ? true : m.isDeveloper ? true : false
                const text = q = args.join(' ')
                const mime = (quoted.msg || quoted).mimetype || ''
                const qmsg = (quoted.msg || quoted)

                //============== [ MESSAGE ] ================================================

                if (m.isGroup && global.db.groups[m.chat] && global.db.groups[m.chat].mute == true && !isCreator) return

                if (isCmd) {
                        console.log(chalk.cyan.bold(` ╭─────[ COMMAND NOTIFICATION ]`), chalk.blue.bold(`\n  Command :`), chalk.white.bold(`${prefix+command}`), chalk.blue.bold(`\n  From :`), chalk.white.bold(m.isGroup ? `Group - ${m.sender.split("@")[0]}\n` : m.sender.split("@")[0] +`\n`), chalk.cyan.bold(`╰────────────────────────────\n`))
                }

                //============= [ FAKEQUOTED ] ===============================================

                const qtext = {key: {remoteJid: "status@broadcast", participant: "0@s.whatsapp.net"}, message: {"extendedTextMessage": {"text": `${prefix+command}`}}}

                const qlocJpm = {key: {participant: '0@s.whatsapp.net', ...(m.chat ? {remoteJid: `status@broadcast`} : {})}, message: {locationMessage: {name: `Kᴇᴠɪɴ ᴛᴇᴄʜ x Rɪᴅᴢ Cᴏᴅᴇʀ`,jpegThumbnail: ""}}}

                //============= [ EVENT GROUP ] ===============================================

                if (m.isGroup && db.groups[m.chat] && db.groups[m.chat].mute == true && !isCreator) return

                if (m.isGroup && db.groups[m.chat] && db.groups[m.chat].antilink == true) {
                        var link = /chat.whatsapp.com|buka tautaniniuntukbergabungkegrupwhatsapp/gi
                        if (link.test(m.text) && !isCreator && !m.isAdmin && m.isBotAdmin && !m.fromMe) {
                                var gclink = (`https://chat.whatsapp.com/` + await kayiza.groupInviteCode(m.chat))
                                var isLinkThisGc = new RegExp(gclink, 'i')
                                var isgclink = isLinkThisGc.test(m.text)
                                if (isgclink) return
                                let delet = m.key.participant
                                let bang = m.key.id
                                await kayiza.sendMessage(m.chat, {text: `*乂 [ Group Link Detected ]*

@${m.sender.split("@")[0]} Sorry, I will kick you, because the admin/bot owner has activated the anti-link feature for other groups.!`, mentions: [m.sender]}, {quoted: m})
                                await kayiza.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
                                await sleep(1000)
                                await kayiza.groupParticipantsUpdate(m.chat, [m.sender], "remove")
                        }}

                if (m.isGroup && db.groups[m.chat] && db.groups[m.chat].antilink2 == true) {
                        var link = /chat.whatsapp.com|buka tautaniniuntukbergabungkegrupwhatsapp/gi
                        if (link.test(m.text) && !isCreator && !m.isAdmin && m.isBotAdmin && !m.fromMe) {
                                var gclink = (`https://chat.whatsapp.com/` + await kayiza.groupInviteCode(m.chat))
                                var isLinkThisGc = new RegExp(gclink, 'i')
                                var isgclink = isLinkThisGc.test(m.text)
                                if (isgclink) return
                                let delet = m.key.participant
                                let bang = m.key.id
                                await kayiza.sendMessage(m.chat, {text: `*乂 [ Group Link Detected ]*

@${m.sender.split("@")[0]} Sorry, I deleted your message, because the admin/bot owner has activated the anti-link feature for other groups!`, mentions: [m.sender]}, {quoted: m})
                                await kayiza.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
                        }}

                //============= [ FUNCTION ] ======================================================

                const example = (teks) => {
                        return `\n *Usage examples :*\n Type *${prefix+command}* ${teks}\n`
                }

                const Reply = async (teks) => {
                        return kayiza.sendMessage(m.chat, {text: teks, mentions: [m.sender], contextInfo: {
                                isForwarded: true, 
                                forwardingScore: 9999, 
                                businessMessageForwardInfo: { businessOwnerJid: global.owner+"@s.whatsapp.net" }, 
                                forwardedNewsletterMessageInfo: { newsletterName: `${botname}`, newsletterJid: global.idSaluran }, 
                                externalAdReply: {
                                        title: botname, 
                                        body: `© Powered by Kᴇᴠɪɴ ᴛᴇᴄʜ x Rɪᴅᴢ Cᴏᴅᴇʀ`, 
                                        thumbnailUrl: global.image.reply, 
                                        sourceUrl: null, 
                                }}}, {quoted: null})
                }

                const pluginsLoader = async (directory) => {
                        let plugins = []
                        const folders = fs.readdirSync(directory)
                        folders.forEach(file => {
                                const filePath = path.join(directory, file)
                                if (filePath.endsWith(".js")) {
                                        try {
                                                const resolvedPath = require.resolve(filePath);
                                                if (require.cache[resolvedPath]) {
                                                        delete require.cache[resolvedPath]
                                                }
                                                const plugin = require(filePath)
                                                plugins.push(plugin)
                                        } catch (error) {
                                                console.log(`Error loading plugin at ${filePath}:`, error)
                                        }}
                        })
                        return plugins
                }

                //========= [ COMMANDS PLUGINS ] =================================================
                let pluginsDisable = true
                const plugins = await pluginsLoader(path.resolve(__dirname, "plugins"))
                const ridzcoder = { ridzcoder, toIDR, isCreator, Reply, command, isPremium, capital, isCmd, example, text, runtime, qtext, qlocJpm, qmsg, mime, sleep, botNumber }
                for (let plugin of plugins) {
                        if (plugin.command.find(e => e == command.toLowerCase())) {
                                pluginsDisable = false
                                if (typeof plugin !== "function") return
                                await plugin(m, ridzcoder)
                        }
                }
                if (!pluginsDisable) return

                //============= [ COMMANDS ] ====================================================

                switch (command) {

                case "ssweb": {
if (!text) return m.reply(example("https://example.com"))
if (!isUrl(text)) return m.reply(example("https://example.com"))
const {
  screenshotV1, 
  screenshotV2,
  screenshotV3 
} = require('getscreenshot.js')
const fs = require('fs')
var data = await screenshotV2(text)
await kayiza.sendMessage(m.chat, { image: data, mimetype: "image/png"}, {quoted: m})
}
break

// Auto Typing
case "autotyping": {
    if (!global.isOwner(m.sender)) return m.reply(global.mess.owner)
    if (!text) return m.reply("Usage: .autotyping on/off")
    global.autoTyping = text.toLowerCase() === "on"
    return m.reply(`Auto typing is now ${global.autoTyping ? "ENABLED" : "DISABLED"}`)
}
break

// Auto Recording
case "autorecording": {
    if (!global.isOwner(m.sender)) return m.reply(global.mess.owner)
    if (!text) return m.reply("Usage: .autorecording on/off")
    global.autoRecording = text.toLowerCase() === "on"
    return m.reply(`Auto recording is now ${global.autoRecording ? "ENABLED" : "DISABLED"}`)
}
break

// Auto Status (view + react)
case "autostatus": {
    if (!global.isOwner(m.sender)) return m.reply(global.mess.owner)
    if (!text) return m.reply("Usage: .autostatus on/off")
    global.autoStatusView = text.toLowerCase() === "on"
    global.autoStatusReact = text.toLowerCase() === "on"
    return m.reply(`Auto status features are now ${global.autoStatusView ? "ENABLED" : "DISABLED"}`)
}
break

// Auto Bio
case "autobio": {
    if (!global.isOwner(m.sender)) return m.reply(global.mess.owner)
    if (!text) return m.reply("Usage: .autobio on/off")
    global.autoBio = text.toLowerCase() === "on"
    return m.reply(`Auto bio is now ${global.autoBio ? "ENABLED" : "DISABLED"}`)
}
break

case "imagine":
case "aiimage": {
    if (!text) return m.reply("Example: .imagine cyberpunk city at night")

    let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}`

    kayiza.sendMessage(
        m.chat,
        {
            image: { url },
            caption: `🎨 AI Image\nPrompt: ${text}`
        },
        { quoted: m }
    )
}
break

case "summarize": {
    if (!text) return m.reply("Provide text to summarize")

    let res = await fetch(
        `https://api.affiliateplus.xyz/api/chatbot?message=Summarize this: ${encodeURIComponent(text)}`
    )
    let json = await res.json()
    m.reply(`📝 Summary:\n${json.message}`)
}
break

case "rewrite": {
    if (!text) return m.reply("Provide text to rewrite")

    let res = await fetch(
        `https://api.affiliateplus.xyz/api/chatbot?message=Rewrite this better: ${encodeURIComponent(text)}`
    )
    let json = await res.json()
    m.reply(`✍️ Rewritten:\n${json.message}`)
}
break

case "translate": {
    if (!text) return m.reply("Example: .translate hello to french")

    let res = await fetch(
        `https://api.affiliateplus.xyz/api/chatbot?message=Translate: ${encodeURIComponent(text)}`
    )
    let json = await res.json()
    m.reply(`🌍 Translation:\n${json.message}`)
}
break
                case "shortlink": case "shorturl": {
if (!text) return m.reply(example("https://example.com"))
if (!isUrl(text)) return m.reply(example("https://example.com"))
var res = await axios.get('https://tinyurl.com/api-create.php?url='+encodeURIComponent(text))
var link = `
* *𝙷𝚎𝚛𝚎 𝚒𝚜 𝚢𝚘𝚞𝚛 𝚜𝚑𝚘𝚛𝚢 𝚕𝚒𝚗𝚔*
${res.data.toString()}
`
return m.reply(link)
}
break
case "bible": {
    if (!text) return m.reply("Example: .bible john 3:16")
    try {
        let res = await fetch(`https://bible-api.com/${encodeURIComponent(text)}`)
        let json = await res.json()
        if (json.error) return m.reply("Verse not found")

        let verse = json.verses.map(v => 
            `${v.book_name} ${v.chapter}:${v.verse}\n${v.text}`
        ).join("\n")

        m.reply(`📖 *Bible*\n\n${verse}`)
    } catch {
        m.reply("Error fetching Bible verse")
    }
}
break
case "biblelist": {
    m.reply(`📖 *Bible Books*

Old Testament:
Genesis, Exodus, Leviticus, Numbers, Deuteronomy,
Joshua, Judges, Ruth, 1 Samuel, 2 Samuel,
1 Kings, 2 Kings, 1 Chronicles, 2 Chronicles,
Ezra, Nehemiah, Esther, Job, Psalms,
Proverbs, Ecclesiastes, Song of Solomon,
Isaiah, Jeremiah, Lamentations, Ezekiel,
Daniel, Hosea, Joel, Amos, Obadiah,
Jonah, Micah, Nahum, Habakkuk, Zephaniah,
Haggai, Zechariah, Malachi

New Testament:
Matthew, Mark, Luke, John, Acts,
Romans, 1 Corinthians, 2 Corinthians,
Galatians, Ephesians, Philippians, Colossians,
1 Thessalonians, 2 Thessalonians,
1 Timothy, 2 Timothy, Titus, Philemon,
Hebrews, James, 1 Peter, 2 Peter,
1 John, 2 John, 3 John, Jude, Revelation`)
}
break

case "quran": {
    if (!text) return m.reply("Example: .quran 1:1")
    try {
        let res = await fetch(`https://api.alquran.cloud/v1/ayah/${text}/en.asad`)
        let json = await res.json()
        if (json.status !== "OK") return m.reply("Verse not found")

        m.reply(`📜 *Quran*
Surah ${json.data.surah.englishName} (${json.data.surah.number})
Ayah ${json.data.numberInSurah}

${json.data.text}`)
    } catch {
        m.reply("Error fetching Quran verse")
    }
}
break

case "quranlist": {
    try {
        let res = await fetch("https://api.alquran.cloud/v1/surah")
        let json = await res.json()

        let list = json.data.map(s =>
            `${s.number}. ${s.englishName} (${s.name})`
        ).join("\n")

        m.reply(`📜 *Quran Surahs*\n\n${list}`)
    } catch {
        m.reply("Error fetching surah list")
    }
}
break

case "joke": {
    let res = await fetch("https://v2.jokeapi.dev/joke/Any?type=single")
    let json = await res.json()
    m.reply(`😂 ${json.joke}`)
}
break

case "quote": {
    let res = await fetch("https://api.quotable.io/random")
    let json = await res.json()
    m.reply(`💬 "${json.content}"\n— ${json.author}`)
}
break

case "fact": {
    let res = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random")
    let json = await res.json()
    m.reply(`🧠 ${json.text}`)
}
break

case "roast": {
    let res = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json")
    let json = await res.json()
    m.reply(`🔥 ${json.insult}`)
}
break

case "compliment": {
    let res = await fetch("https://complimentr.com/api")
    let json = await res.json()
    m.reply(`💖 ${json.compliment}`)
}
break

case "truth": {
    let res = await fetch("https://api.truthordarebot.xyz/v1/truth")
    let json = await res.json()
    m.reply(`🎯 Truth:\n${json.question}`)
}
break

case "dare": {
    let res = await fetch("https://api.truthordarebot.xyz/v1/dare")
    let json = await res.json()
    m.reply(`🎯 Dare:\n${json.question}`)
}
break

case "riddle": {
    let res = await fetch("https://riddles-api.vercel.app/random")
    let json = await res.json()
    m.reply(`🧩 Riddle:\n${json.riddle}\n\n💡 Answer:\n${json.answer}`)
}
break

case "meme": {
    let res = await fetch("https://meme-api.com/gimme")
    let json = await res.json()
    kayiza.sendMessage(m.chat, { image: { url: json.url }, caption: "🤣 Meme" }, { quoted: m })
}
break

case "anime": {
    let res = await fetch("https://api.waifu.pics/sfw/waifu")
    let json = await res.json()
    kayiza.sendMessage(m.chat, { image: { url: json.url }, caption: "🌸 Anime" }, { quoted: m })
}
break

case "coin":
    m.reply(Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails")
break

case "dice":
    m.reply(`🎲 You rolled: ${Math.floor(Math.random() * 6) + 1}`)
break

case "8ball": {
    let answers = [
        "Yes", "No", "Maybe", "Definitely",
        "Ask again later", "I don't think so"
    ]
    m.reply(`🎱 ${answers[Math.floor(Math.random() * answers.length)]}`)
}
break

case "hug":
case "kiss":
case "cuddle":
case "pat":
case "poke":
case "slap":
case "bite":
case "kill":
case "blush":
case "cry":
case "smile": {

    let target = m.mentionedJid[0] || m.quoted?.sender
    if (!target) return m.reply("Tag or reply to someone")

    let action = command.toLowerCase()
    let res = await fetch(`https://api.waifu.pics/sfw/${action}`)
    let json = await res.json()

    kayiza.sendMessage(
        m.chat,
        {
            image: { url: json.url },
            caption: `😆 *${action.toUpperCase()}* @${target.split("@")[0]}`,
            mentions: [target]
        },
        { quoted: m }
    )
}
break

case "vv": {
        try {
            let mediaMessage;

            // Check main message
            const mainViewOnce = m.message?.viewOnceMessage?.message;
            if (mainViewOnce) {
                mediaMessage =
                    mainViewOnce.imageMessage ||
                    mainViewOnce.videoMessage ||
                    mainViewOnce.audioMessage;
            } else {
                // Check quoted message
                const quoted =
                    m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

                if (quoted?.viewOnceMessage?.message) {
                    mediaMessage =
                        quoted.viewOnceMessage.message.imageMessage ||
                        quoted.viewOnceMessage.message.videoMessage ||
                        quoted.viewOnceMessage.message.audioMessage;
                } else if (quoted) {
                    mediaMessage =
                        quoted.imageMessage ||
                        quoted.videoMessage ||
                        quoted.audioMessage;
                }
            }

            if (!mediaMessage) {
                return m.reply("❌ Reply to a view-once image, video, or audio.");
            }
               await kayiza.sendMessage(m.chat, { 
                react: { text: "☠️", key: m.key } 
            });
            const mime = mediaMessage.mimetype;
            if (!mime) return Reply("❌ Unable to detect media type.");

            if (mime.startsWith("image/")) {
                return await handleImage(kayiza, m.chat, mediaMessage);
            }

            if (mime.startsWith("video/")) {
                return await handleVideo(kayiza, m.chat, mediaMessage);
            }

            if (mime.startsWith("audio/")) {
                return await handleAudio(kayiza, m.chat, mediaMessage);
            }

            m.reply("❌ Unsupported media type.");

        } catch (err) {
            console.error("ViewOnce Error:", err);
            m.reply("❌ Failed to process view-once media.");
        }
    }

async function handleImage(kayiza, chatId, mediaMessage) {
    const stream = await downloadContentFromMessage(mediaMessage, 'image');
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    await kayiza.sendMessage(chatId, { image: buffer });
}

async function handleVideo(kayiza, chatId, mediaMessage) {
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filePath = path.join(tempDir, `viewonce_${Date.now()}.mp4`);
    const stream = await downloadContentFromMessage(mediaMessage, 'video');
    const write = fs.createWriteStream(filePath);

    for await (const chunk of stream) {
        write.write(chunk);
    }
    write.end();

    await new Promise(r => write.on("finish", r));

    await sock.sendMessage(chatId, {
        video: fs.readFileSync(filePath)
    });

    fs.unlinkSync(filePath);
}

async function handleAudio(kayiza, chatId, mediaMessage) {
    const stream = await downloadContentFromMessage(mediaMessage, 'audio');
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    await sock.sendMessage(chatId, {
        audio: buffer,
        mimetype: mediaMessage.mimetype
    });
}
break

                case "tourl": {
if (!/image/.test(mime)) return m.reply(example("𝚛𝚎𝚙𝚕𝚢 𝚙𝚑𝚘𝚝𝚘 𝚠𝚒𝚝𝚑 .𝚝𝚘𝚞𝚛𝚕"))
let media = await kayiza.downloadAndSaveMediaMessage(qmsg)
const { ImageUploadService } = require('node-upload-images')
const service = new ImageUploadService('pixhost.to');
let { directLink } = await service.uploadFromBinary(fs.readFileSync(media), 'media.png');

let teks = directLink.toString()
await kayiza.sendMessage(m.chat, {text: teks}, {quoted: m})
await fs.unlinkSync(media)
}
break

case "play2": {
if (!text) return m.reply(example("the link"))
if (!text.startsWith("https://")) return m.reply("Invalid YouTube link")

await kayiza.sendMessage(m.chat, { react: { text: "🕖", key: m.key } })

let apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(text)}`
let response = await fetch(apiUrl)
let json = await response.json()

let audioUrl = json.audio?.url
if (!audioUrl) return m.reply("Conversion failed")

await kayiza.sendMessage(
m.chat,
{
document: { url: audioUrl },
fileName: "youtube.mp3",
mimetype: "audio/mpeg"
},
{ quoted: m }
)

await kayiza.sendMessage(m.chat, { react: { text: "", key: m.key } })
}
break

//================================================================================

case "ytmp4": {
if (!text) return m.reply(example("the link"))
if (!text.startsWith("https://")) return m.reply("Invalid YouTube link")

await kayiza.sendMessage(m.chat, { react: { text: "🕖", key: m.key } })

let apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(text)}`
let response = await fetch(apiUrl)
let json = await response.json()

let videoUrl = json.video?.url
if (!videoUrl) return m.reply("Download failed")

await kayiza.sendMessage(
m.chat,
{
video: { url: videoUrl },
mimetype: "video/mp4"
},
{ quoted: m }
)

await kayiza.sendMessage(m.chat, { react: { text: "", key: m.key } })
}
break
case "playvid": {
if (!text) return m.reply(example("faded by Alan Walker"))

await kayiza.sendMessage(m.chat, { react: { text: "🔎", key: m.key } })

let ytsSearch = await yts(text)
let res = ytsSearch.all[0]
if (!res) return m.reply("No results found")

let apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(res.url)}`
let response = await fetch(apiUrl)
let json = await response.json()

let videoUrl = json.video?.url
if (!videoUrl) return m.reply("Download failed")

await kayiza.sendMessage(
m.chat,
{
video: { url: videoUrl },
mimetype: "video/mp4"
},
{ quoted: m }
)

await kayiza.sendMessage(m.chat, { react: { text: "", key: m.key } })
}
break
case "tt": case "tiktok": {
if (!text) return m.reply(example("𝙿𝚛𝚘𝚟𝚒𝚍𝚎 𝚝𝚒𝚔𝚝𝚘𝚔 𝚞𝚛𝚕"))
if (!text.startsWith("https://")) return m.reply(example("𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚝𝚒𝚔𝚝𝚘𝚔 𝚞𝚛𝚕"))
await tiktokDl(q).then(async (result) => {
await kayiza.sendMessage(m.chat, {react: {text: '🕖', key: m.key}})
if (!result.status) return m.reply("Error!")
if (result.durations == 0 && result.duration == "0 Seconds") {
let araara = new Array()
let urutan = 0
for (let a of result.data) {
let imgsc = await prepareWAMessageMedia({ image: {url: `${a.url}`}}, { upload: kayiza.waUploadToServer })
await araara.push({
header: proto.Message.InteractiveMessage.Header.fromObject({
title: `𝙿𝚑𝚘𝚝𝚘 *${urutan += 1}*`, 
hasMediaAttachment: true,
...imgsc
}),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
buttons: [{                  
"name": "cta_url",
"buttonParamsJson": `{\"display_text\":\"Photo Link\",\"url\":\"${a.url}\",\"merchant_url\":\"https://www.google.com\"}`
}]
})
})
}
const msgii = await generateWAMessageFromContent(m.chat, {
viewOnceMessageV2Extension: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
}, interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: proto.Message.InteractiveMessage.Body.fromObject({
text: "*𝚈𝚘𝚞𝚛 𝚗𝚘 𝚠𝚊𝚝𝚎𝚛𝚖𝚊𝚛𝚔 𝚟𝚒𝚍𝚎𝚘 ✅*"
}),
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
cards: araara
})
})}
}}, {userJid: m.sender, quoted: m})
await kayiza.relayMessage(m.chat, msgii.message, { 
messageId: msgii.key.id 
})
} else {
let urlVid = await result.data.find(e => e.type == "nowatermark_hd" || e.type == "nowatermark")
await kayiza.sendMessage(m.chat, {video: {url: urlVid.url}, mimetype: 'video/mp4', caption: `*𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 ✅*`}, {quoted: m})
}
}).catch(e => console.log(e))
await kayiza.sendMessage(m.chat, {react: {text: '', key: m.key}})
}
break

                case "swgc": {
    if (!isCreator) return Reply(mess.owner);
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const caption = m.body.replace(/^\.swgc\s*/i, "").trim();

    try {
        if (/image|video|audio/.test(mime)) {
            const buffer = await quoted.download();
            global.swgcBuffer = global.swgcBuffer || {};
            global.swgcBuffer[m.sender] = { buffer, mime, caption };
        } else if (caption) {
            global.swgcBuffer = global.swgcBuffer || {};
            global.swgcBuffer[m.sender] = { buffer: null, mime: "text", caption };
        } else {
            return Reply(`⚠️ _𝚁𝚎𝚙𝚕𝚢 𝚟𝚒𝚍𝚎𝚘 𝚠𝚒𝚝𝚑 *${prefix}𝚜𝚠𝚐𝚌*_`);
        }

        await kayiza.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        const allGroups = await kayiza.groupFetchAllParticipating();
        const groupList = Object.values(allGroups);

        if (groupList.length === 0) return Reply("❌𝙽𝚘 𝚐𝚛𝚘𝚞𝚙 𝚏𝚘𝚞𝚗𝚍.");

        const rows = groupList.map(g => ({
            title: g.subject,
            description: `Anggota: ${g.participants.length} | Status: ${g.announce == false ? "Terbuka" : "Hanya Admin"}`,
            id: `${prefix}swgc_process ${g.id}`
        }));

        await kayiza.sendMessage(m.chat, {
            image: { url: global.image.menu },
            caption: `📲 *GROUP SWGC*`,
            footer: `Total Grup: ${groupList.length}`,
            buttons: [
                {
                    buttonId: 'swgc_select',
                    buttonText: { displayText: '📥 Select Group' },
                    type: 4,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'SWGC',
                            sections: [
                                {
                                    title: 'Bot Group List',
                                    rows: rows
                                }
                            ]
                        })
                    }
                }
            ],
            headerType: 4,
            viewOnce: true,
            contextInfo: {
                isForwarded: false,
                mentionedJid: [m.sender]
            }
        }, { quoted: m });

    } catch (error) {
        console.error('[SWGC ERROR]', error);
        Reply("❌An error occured while forwarding video to group");
    }
}
break;

case "swgc_process": {
    if (!isCreator && !m.isAdmins) return Reply(mess.admin);
    if (!text) return Reply("❌𝚁𝚎𝚙𝚕𝚢 𝚟𝚒𝚍𝚎𝚘");
    const groupId = text.split("|")[0];

    const data = global.swgcBuffer ? global.swgcBuffer[m.sender] : null;
    if (!data) return Reply("❌ 𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚖𝚎𝚍𝚒𝚊 𝚙𝚕𝚎𝚊𝚜𝚎");
    await kayiza.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    try {
        if (/image/.test(data.mime)) {
            await kayiza.sendMessage(groupId, { groupStatusMessage: { image: data.buffer, caption: data.caption } });
        } else if (/video/.test(data.mime)) {
            await kayiza.sendMessage(groupId, { groupStatusMessage: { video: data.buffer, caption: data.caption } });
        } else if (/audio/.test(data.mime)) {
            await kayiza.sendMessage(groupId, { groupStatusMessage: { audio: data.buffer } });
        } else if (data.mime === "text" && data.caption) {
            await kayiza.sendMessage(groupId, { groupStatusMessage: { text: data.caption } });
        } else {
            return Reply(`⚠️ _Reply video with  *${prefix}swgc*_`);
        }

        delete global.swgcBuffer[m.sender];
        await Reply(`✅ 𝙳𝚘𝚗𝚎! 𝙶𝚛𝚘𝚞𝚙 𝚜𝚝𝚊𝚝𝚞𝚜: ${groupId}`);
    } catch (error) {
        console.error('[SWGC PROCESS ERROR]', error);
        Reply("❌ 𝙰𝚗 𝚎𝚛𝚛𝚘𝚛 𝚘𝚌𝚌𝚞𝚛𝚎𝚍");
    }
}
break;
case "play": {
    try {
        if (!text) {
            return Reply("❌ Please provide a song name!\nExample: `.play Lilly Alan Walker`");
        }
        await kayiza.sendMessage(m.chat, {
            react: { text: "🔍", key: m.key }
        });

        const { videos } = await yts(text);
        if (!videos || videos.length === 0) {
            await kayiza.sendMessage(m.chat, {
                react: { text: "❌", key: m.key }
            });
            return Reply("⚠️ No results found for your query!");
        }

        const video = videos[0];
     const caption =
`╭─❍  *NEMESIS MD SONG DL*  ⬡────⭓
├▢⬡ 
├▢⬡ 🏔️ *Title:* ${video.title}
├▢⬡ 🏔️ *Quality:* Audio (MP3)
├▢⬡ 🏔️ *Duration:* ${video.seconds || "Unknown"} sec
├▢⬡ 🏔️ *Video URL:* ${video.url || text}
├▢⬡ 
╰────────────────────────────
> Cʀᴇᴀᴛᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ❦`;

   await kayiza.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption
}, { quoted: m });
        await kayiza.sendMessage(m.chat, {
            react: { text: "⬇️", key: m.key }
        });

        const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(video.url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data?.status || !data.audio) {
            await kayiza.sendMessage(m.chat, {
                react: { text: "❌", key: m.key }
            });
            return Reply("🚫 Download failed. Try again later.");
        }
        await kayiza.sendMessage(m.chat, {
            react: { text: "✅", key: m.key }
        });
        await kayiza.sendMessage(m.chat, {
            document: { url: data.audio },
            mimetype: "audio/mpeg",
            fileName: `${data.title || video.title}.mp3`
        }, { quoted: m });

    } catch (err) {
        console.error("Play error:", err);
        await kayiza.sendMessage(m.chat, {
            react: { text: "❌", key: m.key }
        });
        Reply("❌ Download failed. Please try again later.");
    }
}
break;
                case "brat": {
    if (!text) 
        return m.reply('❌ Use: .𝚋𝚛𝚊𝚝 𝚑𝚎𝚕𝚕𝚘 𝚠𝚘𝚛𝚕𝚍');
        await kayiza.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    try {
        let encodedText = encodeURIComponent(text);
        let url = `https://alipai-api.vercel.app/imagecreator/bratv?apikey=alipaikey&text=${encodedText}`;
        let res = await getBuffer(url);
        if (!res || res.length < 1000) 
            return m.reply('❌ 𝙰𝚗 𝚎𝚛𝚛𝚘𝚛 𝚘𝚌𝚌𝚞𝚛𝚎𝚍.');
        const { Sticker } = require('wa-sticker-formatter');
        const sticker = new Sticker(res, {
            pack: global.packname,
            author: global.namaOwner || "Kᴇᴠɪɴ ᴛᴇᴄʜ x Rɪᴅᴢ Cᴏᴅᴇʀ",
            type: 'full',
            quality: 100
        });
        const stickerBuffer = await sticker.toBuffer();
       await kayiza.sendMessage(m.chat, {
            sticker: stickerBuffer,
            contextInfo: {
                isForwarded: true, 
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.idSaluran,
                    newsletterName: global.namaSaluran,
                    serverMessageId: -1
                }
            }
        }, { quoted: m });

    } catch (e) {
        m.reply('❌ Sticker forward error.');
        console.error('Sticker Forward Error:', e);
    }
}                        //================================================================================

                        case "kick": 
                        case "kik": {
                                if (!m.isGroup) return Reply(mess.group)
                                if (!isCreator && !m.isAdmin) return Reply(mess.admin)
                                if (!m.isBotAdmin) return Reply(mess.botAdmin)
                                if (text || m.quoted) {
                                        const input = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false
                                        var onWa = await kayiza.onWhatsApp(input.split("@")[0])
                                        if (onWa.length < 1) return m.reply("𝙽𝚘 𝚙𝚊𝚛𝚝𝚒𝚌𝚒𝚙𝚊𝚗𝚝")
                                        const res = await kayiza.groupParticipantsUpdate(m.chat, [input], 'remove')
                                        await m.reply(`𝚄𝚜𝚎𝚛 ${input.split("@")[0]} 𝚛𝚎𝚖𝚘𝚟𝚎𝚍`)
                                } else {
                                        return m.reply(example("𝚁𝚎𝚙𝚕𝚢 𝚘𝚛 𝚝𝚊𝚐 𝚞𝚜𝚎𝚛 𝚝𝚘 𝚛𝚎𝚖𝚘𝚟𝚎"))
                                }
                        }
                        break

                        //================================================================================

                        case "leave": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!m.isGroup) return Reply(mess.group)
                                await m.reply("𝙶𝚛𝚘𝚞𝚙 𝚕𝚎𝚏𝚝 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢")
                                await sleep(4000)
                                await kayiza.groupLeave(m.chat)
                        }
                        break

                        //================================================================================

                        case "resetlinkgc": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!m.isGroup) return Reply(mess.group)
                                if (!m.isBotAdmin) return Reply(mess.botAdmin)
                                await kayiza.groupRevokeInvite(m.chat)
                                m.reply("𝙶𝚛𝚘𝚞𝚙 𝚕𝚒𝚗𝚔 𝚛𝚎𝚜𝚎𝚝 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢✅")
                        }
                        break

                        //================================================================================

                        case "tagall": {
                                if (!m.isGroup) return Reply(mess.group)
                                if (!isCreator && !m.isAdmin) return Reply(mess.admin)
                                if (!text) return m.reply(example("𝚖𝚎𝚖𝚋𝚎𝚛𝚜"))
                                let teks = text+"\n\n"
                                let member = await m.metadata.participants.map(v => v.id).filter(e => e !== botNumber && e !== m.sender)
                                await member.forEach((e) => {
                                        teks += `@${e.split("@")[0]}\n`
                                })
                                await kayiza.sendMessage(m.chat, {text: teks, mentions: [...member]}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "linkgc": {
                                if (!m.isGroup) return Reply(mess.group)
                                if (!m.isBotAdmin) return Reply(mess.botAdmin)
                                const urlGrup = "https://chat.whatsapp.com/" + await kayiza.groupInviteCode(m.chat)
                                var teks = `
${urlGrup}
`
                                await kayiza.sendMessage(m.chat, {text: teks, matchedText: `${urlGrup}`}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "ht": 
                        case "hidetag": {
                                if (!m.isGroup) return Reply(mess.group)
                                if (!isCreator && !m.isAdmin) return Reply(mess.admin)
                                if (!text) return m.reply(example("group"))
                                let member = m.metadata.participants.map(v => v.id)
                                await kayiza.sendMessage(m.chat, {text: text, mentions: [...member]}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "joingc": 
                        case "join": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!text) return m.reply(example("linkgcnya"))
                                if (!text.includes("chat.whatsapp.com")) return m.reply("Invalid WhatsApp group link")
                                let result = text.split('https://chat.whatsapp.com/')[1]
                                let id = await kayiza.groupAcceptInvite(result)
                                m.reply(`𝙶𝚛𝚘𝚞𝚙 𝚓𝚘𝚒𝚗𝚎𝚍 ${id}`)
                        }
                        break

                        //================================================================================

                        case "get": 
                        case "g": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!text) return m.reply(example("https://example.com"))
                                let data = await fetchJson(text)
                                m.reply(JSON.stringify(data, null, 2))
                        }
                        break
case "ping":
case "uptime": {
    let timestamp = speed();
    let latensi = speed() - timestamp;
    let tio = await nou.os.oos();
    var tot = await nou.drive.info();

    let respon = 
`╭═══⬡𝑁𝐸𝑀𝐸𝑆𝐼𝑆 𝑀𝐷 ⬡═══⬡ 
║友│⊷• 𝙿𝙻𝙰𝚃𝙵𝙾𝚁𝙼     : ${nou.os.type()}
║友│⊷• 𝚃𝙾𝚃𝙰𝙻 𝚁𝙰𝙼    : ${formatp(os.totalmem())}
║友│⊷• 𝚃𝙾𝚃𝙰𝙻 𝚁𝙰𝙼    : ${tot.totalGb} 𝙶𝙱
║友│⊷• 𝙲𝙿𝚄 𝙲𝙾𝚁𝙴𝚂    : ${os.cpus().length}
║友│⊷• 𝚅𝙿𝚂 𝚄𝙿𝚃𝙸𝙼𝙴   : ${runtime(os.uptime())}
║友│⊷• 𝙿𝙸𝙽𝙶/𝚂𝙿𝙴𝙴𝙿          : ${latensi.toFixed(4)} sec
║友│⊷• 𝚁𝚄𝙽𝚃𝙸𝙼𝙴      : ${runtime(process.uptime())}
╰═══════════════════⬡`;

    await m.reply(respon)
}
break

                        //================================================================================
                        case "on":
case "off": {
    if (!isCreator) return Reply(mess.owner)
    if (!m.isGroup) return Reply(mess.group)

    let gc = Object.keys(db.groups[m.chat])

    if (!text || isNaN(text)) {
        let teks = `\n🔥 *𝙶𝚁𝙾𝚄𝙿 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂 𝙻𝙸𝚂𝚃*\n\n`
        gc.forEach((i, e) => {
            teks += `• *${e + 1}. ${capital(i)}* → ${db.groups[m.chat][i] ? "✅ On" : "❌ Off"}\n`
        })
        teks += `\n⚠ usage:\n   *.${command}* <on/off>\n   Example: *.${command} 1*\n`
        return m.reply(teks)
    }

    const num = Number(text)
    let total = gc.length
    if (num > total) return

    const event = gc[num - 1]
    global.db.groups[m.chat][event] = command === "on"

    return m.reply(
        `✔ *Cmds*\nStatus *${event}* : ${command === "on" ? "⚡ On" : "🛑 Off"}`
    )
}
break

                        //================================================================================
                        case "closegc": 
                        case "close": 
                        case "opengc": 
                        case "open": {
                                if (!m.isGroup) return Reply(mess.group)
                                if (!m.isBotAdmin) return Reply(mess.botAdmin)
                                if (!isCreator && !m.isAdmin) return Reply(mess.admin)
                                if (/open|opengc/.test(command)) {
                                        if (m.metadata.announce == false) return 
                                        await kayiza.groupSettingUpdate(m.chat, 'not_announcement')
                                } else if (/closegc|close/.test(command)) {
                                        if (m.metadata.announce == true) return 
                                        await kayiza.groupSettingUpdate(m.chat, 'announcement')
                                } else {}
                        }
                        break

                        //================================================================================

                        case "demote":
                        case "promote": {
                                if (!m.isGroup) return Reply(mess.group)
                                if (!m.isBotAdmin) return Reply(mess.botAdmin)
                                if (!isCreator && !m.isAdmin) return Reply(mess.admin)
                                if (m.quoted || text) {
                                        var action
                                        let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
                                        if (/demote/.test(command)) action = "Demote"
                                        if (/promote/.test(command)) action = "Promote"
                                        await kayiza.groupParticipantsUpdate(m.chat, [target], action.toLowerCase()).then(async () => {
                                                await kayiza.sendMessage(m.chat, {text: `Success ${action.toLowerCase()} @${target.split("@")[0]}`, mentions: [target]}, {quoted: m})
                                        })
                                } else {
                                        return m.reply(example("@tag/2567###"))
                                }
                        }
                        break

                        //================================================================================

                        case 'addcase': {
    if (!isCreator) return Reply(mess.owner);
    if (!text) return Reply(`Usage: .addcase *vv*`);
    const namaFile = path.join(__dirname, 'command.js');
    const caseBaru = `${text}\n\n`;
    const tambahCase = (data, caseBaru) => {
        const posisiDefault = data.lastIndexOf("default:");
        if (posisiDefault !== -1) {
            const kodeBaruLengkap = data.slice(0, posisiDefault) + caseBaru + data.slice(posisiDefault);
            return { success: true, kodeBaruLengkap };
        } else {
            return { success: false, message: "Added case to command.js" };
        }
    };
    fs.readFile(namaFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error adding case:', err);
            return Reply(`Error adding case: ${err.message}`);
        }
        const result = tambahCase(data, caseBaru);
        if (result.success) {
            fs.writeFile(namaFile, result.kodeBaruLengkap, 'utf8', (err) => {
                if (err) {
                    console.error('Error with file:', err);
                    return Reply(`Error with file: ${err.message}`);
                } else {
                    console.log('Success:');
                    console.log(caseBaru);
                    return Reply('Successfuly added case!');
                }
            });
        } else {
            console.error(result.message);
            return Reply(result.message);
        }
    });
}
break
case 'delcase': {
    if (!isCreator) return Reply(mess.owner);
    if (!text) 
        return Reply(`usage: .delcase nama_case`);

    const fs = require('fs').promises;

    async function removeCase(filePath, caseNameToRemove) {
        try {
            let data = await fs.readFile(filePath, 'utf8');
            const regex = new RegExp(`case\\s+['"\`]${caseNameToRemove}['"\`]:[\\s\\S]*?break;?`, 'g');

            const modifiedData = data.replace(regex, '');

            if (data === modifiedData) {
                return Reply(`❌ Case "${caseNameToRemove}" removed .`);
            }

            await fs.writeFile(filePath, modifiedData, 'utf8');
            Reply(`✅ Successful deleted: *${caseNameToRemove}*`);
        } catch (err) {
            Reply(`Error occured: ${err.message}`);
        }
    }
    removeCase('./command.js', text.trim());
}
break;

                        case "addstore": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!text) return m.reply(example("store|andy"))
                                if (!text.split("|")) return m.reply(example("store|andy"))
                                let result = text.split("|")
                                if (result.length < 2) return m.reply(example("store|andy"))
                                const [ cmd, respon ] = result
                                let res = list.find(e => e.cmd == cmd.toLowerCase())
                                if (res) return m.reply("Cmd added")
                                let obj = {
                                        cmd: cmd.toLowerCase(), 
                                        respon: respon
                                }
                                list.push(obj)
                                fs.writeFileSync("./lib/database/list.json", JSON.stringify(list, null, 2))
                                m.reply(`cmd *${cmd.toLowerCase()}* added`)
                        }
                        break

                        //================================================================================

                        case "delstore": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!text) return m.reply(example("cmd\n\n forexample *.listproduk"))
                                const cmd = text.toLowerCase()
                                let res = list.find(e => e.cmd == cmd.toLowerCase())
                                if (!res) return m.reply("Cmd store example .listproduk")
                                let position = list.indexOf(res)
                                await list.splice(position, 1)
                                fs.writeFileSync("./lib/database/list.json", JSON.stringify(list, null, 2))
                                m.reply(`Done updating cmd store *${cmd.toLowerCase()}* done database listproduk`)
                        }
                        break
                        case "addprem": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!text && !m.quoted) return m.reply(example("2567###"))
                                const input = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                                const input2 = input.split("@")[0]
                                if (input2 === global.owner || premium.includes(input) || input === botNumber) return m.reply(`This  ${input2} is already premium!`)
                                premium.push(input)
                                await fs.writeFileSync("./lib/database/premium.json", JSON.stringify(premium, null, 2))
                                m.reply(`𝙳𝚘𝚗𝚎 ✅`)
                        }
                        break

                        //================================================================================

                        case "listprem": {
                                if (premium.length < 1) return m.reply("𝙽𝚘 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚞𝚜𝚎𝚛")
                                let teks = `\n *乂𝚙𝚛𝚎𝚖 𝚞𝚜𝚎𝚛𝚜*\n`
                                for (let i of premium) {
                                        teks += `\n* ${i.split("@")[0]}
* *Tag :* @${i.split("@")[0]}\n`
                                }
                                kayiza.sendMessage(m.chat, {text: teks, mentions: premium}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "delprem": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!m.quoted && !text) return m.reply(example("2567###"))
                                const input = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                                const input2 = input.split("@")[0]
                                if (input2 == global.owner || input == botNumber) return m.reply(`𝙲𝚊𝚗'𝚝 𝚍𝚎𝚕𝚎𝚝𝚎 𝚖𝚢 𝚘𝚠𝚗𝚎𝚛`)
                                if (!premium.includes(input)) return m.reply(`𝚄𝚜𝚎𝚛: ${input2} 𝚛𝚎𝚖𝚘𝚟𝚎𝚍!`)
                                let posi = premium.indexOf(input)
                                await premium.splice(posi, 1)
                                await fs.writeFileSync("./lib/database/premium.json", JSON.stringify(premium, null, 2))
                                m.reply(`𝙳𝚘𝚗𝚎 ✅`)
                        }
                        break

                        //================================================================================

                        case "jpm": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!q) return m.reply(example("𝚑𝚎𝚕𝚕𝚘 𝚖𝚎𝚖𝚋𝚎𝚛𝚜"))
                                let allgrup = await kayiza.groupFetchAllParticipating()
                                let res = await Object.keys(allgrup)
                                let count = 0
                                const jid = m.chat
                                const teks = text
                                await m.reply(`𝚂𝚎𝚗𝚍𝚒𝚗𝚐 𝚓𝚙𝚖 𝚝𝚘 ${res.length} `)
                                for (let i of res) {
                                        if (global.db.groups[i] && global.db.groups[i].blacklistjpm && global.db.groups[i].blacklistjpm == true) continue
                                        try {
                                                await kayiza.sendMessage(i, {text: `${teks}`}, {quoted: qlocJpm})
                                                count += 1
                                        } catch {}
                                        await sleep(global.delayJpm)
                                }
                                await kayiza.sendMessage(jid, {text: `*𝚂𝚎𝚗𝚝 𝚌𝚘𝚖𝚖𝚘𝚗 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚘 : ${count} 𝚐𝚛𝚘𝚞𝚙𝚜`}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "developerbot": 
                        case "owner": {
                                await kayiza.sendContact(m.chat, [global.owner], m)
                        }
                        break

                        //================================================================================
                        case "self": {
                                if (!isCreator) return
                                kayiza.public = false
                                m.reply("𝙱𝙾𝚃 𝙲𝙷𝙰𝙽𝙶𝙴𝙳 𝚃𝙾 𝙿𝚁𝙸𝚅𝙰𝚃𝙴 𝙼𝙾𝙳𝙴*")
                        }
                        break

                        //================================================================================

                        case "getcase": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!text) return m.reply(example("menu"))
                                const getcase = (cases) => {
                                        return "case "+`\"${cases}\"`+fs.readFileSync('./case.js').toString().split('case \"'+cases+'\"')[1].split("break")[0]+"break"
                                }
                                try {
                                        m.reply(`${getcase(q)}`)
                                } catch (e) {
                                        return m.reply(`Case *${text}*`)
                                }
                        }
                        break

                        //================================================================================



                        //================================================================================

                        case "public": {
                                if (!isCreator) return
                                kayiza.public = true
                                m.reply("𝙱𝚘𝚝 𝚌𝚑𝚊𝚗𝚐𝚎𝚍 𝚝𝚘 𝚙𝚞𝚋𝚕𝚒𝚌 𝚖𝚘𝚍𝚎*")
                        }
                        break

                        //================================================================================

                        case "getsc": {
                                if (!isCreator) return Reply(mess.owner)
                                let dir = await fs.readdirSync("./lib/database/kayiza")
                                if (dir.length >= 2) {
                                        let res = dir.filter(e => e !== "A")
                                        for (let i of res) {
                                                await fs.unlinkSync(`./lib/database/kayiza/${i}`)
                                        }}
                                await m.reply("𝙵𝚎𝚝𝚌𝚑𝚒𝚗𝚐 𝚋𝚘𝚝'𝚜 𝚜𝚌𝚛𝚒𝚙𝚝")
                                var name = `ridz-md`
                                const ls = (await execSync("ls"))
                                        .toString()
                                        .split("\n")
                                        .filter(
                                                (pe) =>
                                                pe != "node_modules" &&
                                                pe != "session" &&
                                                pe != "package-lock.json" &&
                                                pe != "yarn.lock" &&
                                                pe != ""
                                        )
                                const anu = await execSync(`zip -r ${name}.zip ${ls.join(" ")}`)
                                await kayiza.sendMessage(m.sender, {document: await fs.readFileSync(`./${name}.zip`), fileName: `${name}.zip`, mimetype: "application/zip"}, {quoted: m})
                                await execSync(`rm -rf ${name}.zip`)
                                if (m.chat !== m.sender) return m.reply("Script bot")
                        }
                        break

                        //================================================================================

                        case "resetdb": 
                        case "rstdb": {
                                if (!isCreator) return Reply(mess.owner)
                                for (let i of Object.keys(global.db)) {
                                        global.db[i] = {}
                                }
                                m.reply("𝙳𝙾𝙽𝙴 𝚁𝙴𝚂𝙴𝚃𝚃𝙸𝙽𝙶 𝙳𝙰𝚃𝙰𝙱𝙰𝚂𝙴 ✅")
                        }
                        break

                        //================================================================================

                        case "setppbot": {
                                if (!isCreator) return Reply(mess.owner)
                                if (/image/g.test(mime)) {
                                        var medis = await kayiza.downloadAndSaveMediaMessage(qmsg)
                                        if (args[0] && args[0] == "panjang") {
                                                const { img } = await generateProfilePicture(medis)
                                                await kayiza.query({
                                                        tag: 'iq',
                                                        attrs: {
                                                                to: botNumber,
                                                                type:'set',
                                                                xmlns: 'w:profile:picture'
                                                        },
                                                        content: [
                                                                {
                                                                        tag: 'picture',
                                                                        attrs: { type: 'image' },
                                                                        content: img
                                                                }
                                                        ]
                                                })
                                                await fs.unlinkSync(medis)
                                                m.reply("𝙳𝙿 𝚂𝙴𝚃 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈 ✅")
                                        } else {
                                                await kayiza.updateProfilePicture(botNumber, {content: medis})
                                                await fs.unlinkSync(medis)
                                                m.reply("𝚁𝚎𝚙𝚕𝚢 𝚙𝚑𝚘𝚝𝚘 𝚠𝚒𝚝𝚑 .𝚜𝚎𝚝𝚋𝚘𝚝𝚙𝚙✅")
                                        }
                                } else return m.reply(example('𝚎𝚛𝚛𝚘𝚛'))
                        }
                        break

                        //================================================================================

                        case "clearchat": 
                        case "clc": {
                                if (!isCreator) return Reply(mess.owner)
                                kayiza.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.timestamp }]}, m.chat)
                        }
                        break

                        //================================================================================

                        case "listowner": 
                        case "listown": {
                                if (owners.length < 1) return m.reply("𝙽𝚘 𝚘𝚠𝚗𝚎𝚛𝚜 𝚒𝚗 𝚝𝚑𝚎 𝚍𝚊𝚝𝚊𝚋𝚊𝚜𝚎")
                                let teks = `\n *༒𝙾𝚠𝚗𝚎𝚛𝚜 𝚕𝚒𝚜𝚝༒*\n`
                                for (let i of owners) {
                                        teks += `\n* ${i.split("@")[0]}
* *Tag :* @${i.split("@")[0]}\n`
                                }
                                kayiza.sendMessage(m.chat, {text: teks, mentions: owners}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "delowner": 
                        case "delown": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!m.quoted && !text) return m.reply(example("2567###"))
                                const input = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                                const input2 = input.split("@")[0]
                                if (input2 === global.owner || input == botNumber) return m.reply(`𝙲𝚊𝚗'𝚝 𝚛𝚎𝚖𝚘𝚟𝚎 𝚖𝚢 𝚘𝚠𝚗𝚎𝚛 𝚋𝚘𝚜𝚜!`)
                                if (!owners.includes(input)) return m.reply(`𝚍𝚎𝚕𝚎𝚝𝚎 ${input2} !`)
                                let posi = owners.indexOf(input)
                                await owners.splice(posi, 1)
                                await fs.writeFileSync("./lib/database/owner.json", JSON.stringify(owners, null, 2))
                                m.reply(`𝙳𝚎𝚕𝚎𝚝𝚎𝚍 𝚘𝚠𝚗𝚎𝚛 𝚏𝚛𝚘𝚖 𝚍𝚊𝚝𝚊𝚋𝚊𝚜𝚎 ✅`)
                        }
                        break

                        //================================================================================

                        case "addowner": 
                        case "addown": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!m.quoted && !text) return m.reply(example("2567###"))
                                const input = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
                                const input2 = input.split("@")[0]
                                if (input2 === global.owner || owners.includes(input) || input === botNumber) return m.reply(`𝙱𝚛𝚞𝚑: ${input2} 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚊𝚗 𝚘𝚠𝚗𝚎𝚛!`)
                                owners.push(input)
                                await fs.writeFileSync("./lib/database/owner.json", JSON.stringify(owners, null, 2))
                                m.reply(`𝙰𝚍𝚍𝚎𝚍 𝚘𝚠𝚗𝚎𝚛 ✅`)
                        }
                        break

                        case "getpp": {
        try {
            // Owner check
            if (!isCreator) {
                return Reply("❌ This command is only available for the owner!");
            }

            let userToAnalyze;

            // Check for mentioned users
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                userToAnalyze = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } 
            // Check for replied message
            else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
                userToAnalyze = m.message.extendedTextMessage.contextInfo.participant;
            }

            if (!userToAnalyze) {
                return Reply("⚠️ Please mention someone or reply to their message to get their profile picture!\n\nMaximum usage 5");
            }

            // Try to get profile picture
            let profilePic;
            try {
                profilePic = await kayiza.profilePictureUrl(userToAnalyze, "image");
            } catch {
                profilePic = "https://files.catbox.moe/lvcwnf.jpg"; // fallback image
            }

            // Send profile picture
            await kayiza.sendMessage(m.chat, {
                image: { url: profilePic },
                caption: `Profile picture of @${userToAnalyze.split('@')[0]}`,
                mentions: [userToAnalyze]
            });

        } catch (err) {
            console.error("GetPP Error:", err);
            m.reply("❌ Failed to retrieve profile picture. The user might not have one set.");
        }
    }
    break

    case "block": {
    // Get the bot owner's number dynamically
    const botOwner = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    if (!isCreator) {
        return Reply("Only the bot owner can use this command.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender; // If replying to a message, get sender JID
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0]; // If mentioning a user, get their JID
    } else if (q && q.includes("@")) {
        jid = q.replace(/[@\s]/g, '') + "@s.whatsapp.net"; // If manually typing a JID
    } else {
        return Reply("Please mention a user or reply to their message.");
    }

    try {
        await kayiza.updateBlockStatus(jid, "block");
  //put succecc reaction
        m.reply(`Successfully blocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Block command error:", error);
        //await react("❌");
        m.reply("Failed to block the user.");
    }
}
break
case "movieinfo": {
    try {
        // Properly extract the movie name from arguments
        const movieName = args.length > 0 ? args.join(' ') : m.text.replace(/^[\.\#\$\!]?movie\s?/i, '').trim();

        if (!movieName) {
            return Reply("📽️ Please provide the name of the movie.\nExample: .movie Iron Man");
        }

        const apiUrl = `https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(movieName)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.movie) {
            return Reply("🚫 Movie not found. Please check the name and try again.");
        }

        const movie = response.data.movie;

        // Format the caption
        const dec = `
🎬 *${movie.title}* (${movie.year}) ${movie.rated || ''}

⭐ *IMDb:* ${movie.imdbRating || 'N/A'} | 🍅 *Rotten Tomatoes:* ${movie.ratings.find(r => r.source === 'Rotten Tomatoes')?.value || 'N/A'} | 💰 *Box Office:* ${movie.boxoffice || 'N/A'}

📅 *Released:* ${new Date(movie.released).toLocaleDateString()}
⏳ *Runtime:* ${movie.runtime}
🎭 *Genre:* ${movie.genres}

📝 *Plot:* ${movie.plot}

🎥 *Director:* ${movie.director}
✍️ *Writer:* ${movie.writer}
🌟 *Actors:* ${movie.actors}

🌍 *Country:* ${movie.country}
🗣️ *Language:* ${movie.languages}
🏆 *Awards:* ${movie.awards || 'None'}

[View on IMDb](${movie.imdbUrl})
`;

        // Send message with the requested format
        await kayiza.sendMessage(
            m.chat,
            {
                image: { 
                    url: movie.poster && movie.poster !== 'N/A' ? movie.poster : 'https://files.catbox.moe/qva4tf.jpg'
                },
                caption: dec,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363404529319592@newsletter',
                        newsletterName: 'Airbyte Synergetic Labs 🏔️',
                        serverMessageId: 143
                    }
                }
            },
            { quoted: m }
        );

    } catch (e) {
        console.error('Movie command error:', e);
        m.reply(`❌ Error: ${e.message}`);
    }
}
  break
  case "tts":{
try{
if(!text) return Reply("Need some text.")
    const url = googleTTS.getAudioUrl(q, {
  lang: 'hi-IN',
  slow: false,
  host: 'https://translate.google.com',
})
await kayiza.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
    }catch(a){
reply(`${a}`)
}
}
break
case "ai": {
    try {
        if (!text) return Reply("Please provide a message for the Ai.\nExample: `.andy what is going on`");
             await kayiza.sendMessage(m.chat, { 
                react: { text: "📡", key: m.key } 
            });

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            return Reply("Nemesis failed to respond. Please try again later.");
        }

        await m.reply(`🤖 * Nemesis Response:*\n\n${data.message}`);
    } catch (e) {
        console.error("Error in AI command:", e);
        m.reply("An error occurred while communicating with the AI.");
    }
}
break
case "bible": {
  try {
    if (!q) {
      return await kayiza.sendMessage(
        m.chat,
        {
          text: `⚠️ *Please provide a Bible reference.*\n\n📝 *Example:*\n.bible John 1:1`

        },
        { quoted: m }
      );
    }

    const apiUrl = `https://bible-api.com/${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (response.status === 200 && response.data.text) {
      const { reference, translation_name, verses } = response.data;

      // Pull details from the first verse object
      const verseData = verses?.[0] || {};
      const book = verseData.book_name || "Unknown";
      const chapter = verseData.chapter || "Unknown";
      const verse = verseData.verse || "Unknown";
      const text = verseData.text || response.data.text;

      const verseMessage =
        `📜 *𝘽𝙄𝘽𝙇𝙀 𝙑𝙀𝙍𝙎𝙀 𝙁𝙊𝙐𝙉𝘿!* 📜\n\n` +
        `📖 *Reference:* ${reference}\n` +
        `📚 *Book:* ${book}\n` +
        `🔢 *Chapter:* ${chapter}\n` +
        `🔤 *Verse:* ${verse}\n\n` +
        `📖 *Text:* ${text.trim()}\n\n` +
        `🗂️ *Translation:* ${translation_name}\n\n` +
        `> ©Kᴇᴠɪɴ ᴛᴇᴄʜ x Rɪᴅᴢ Cᴏᴅᴇʀ`;

      await kayiza.sendMessage(m.chat, { text: verseMessage
      }, { quoted: m });
    } else {
      await kayiza.sendMessage(
        m.chat,
        { text: "❌ *Verse not found.* Please check the reference and try again."
         },
        { quoted: m }
      );
    }
  } catch (error) {
    console.error("Bible command error:", error.message || error);
    await kayiza.sendMessage(
      m.chat,
      { text: "⚠️ *An error occurred while fetching the Bible verse.* Please try again."
       },
      { quoted: m }
    );
  }
}
break
case "joke": {
    try {
      const { data } = await axios.get("https://v2.jokeapi.dev/joke/Any?type=single");
      if (!data || !data.joke) return Reply("❌ Couldn't fetch a joke!");
    return  Reply(`😂 *Here's a joke for you:*\n\n${data.joke}`);
    } catch (e) {
      console.error("Joke Command Error:", e);
     await Reply ("❌ Error fetching joke.");
    }
  }
break
//repeated 
case "msg": {
  if (!isCreator) return Reply(mess.owner);

  try {
    if (!text.includes(',')) return Reply("❌ *Format:* .msg text,count\n*Example:* .msg Hello,5");

    const [rawMessage, countStr] = text.split(',');
    const message = rawMessage.trim();
    const count = parseInt(countStr.trim());

    if (isNaN(count) || count < 1 || count > 500) {
      return reply("❌ *Max 500 messages at once!*");
    }

    const zws = '\u200B'; // Zero-width space

    for (let i = 0; i < count; i++) {
      const hiddenMsg = message + zws.repeat(i); // visually same, technically unique
      await kayiza.sendMessage(m.chat, { text: hiddenMsg }, { quoted: null });
      if (i < count - 1) await new Promise(res => setTimeout(res, 1000)); // 1 sec delay
    }

  } catch (e) {
    console.error("Error in msg command:", e);
    Reply(`❌ *Error:* ${e.message}`);
  }
  }
break

// channel info

//TikTok stalk
case "ttstalk":{
  try {
    if (!text) {
      return Reply("❎ Please provide a TikTok username.\n\n*Example:* .tiktokstalk mrbeast");
    }

    const apiUrl = `https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl);

    if (!data.status) {
      return Reply("❌ User not found. Please check the username and try again.");
    }

    const user = data.data.user;
    const stats = data.data.stats;

    const profileInfo = `
    🎭 *TikTok Profile Stalker* 🎭

👤 *Username:* @${user.uniqueId}
📛 *Nickname:* ${user.nickname}
✅ *Verified:* ${user.verified ? "Yes ✅" : "No ❌"}
📍 *Region:* ${user.region}
📝 *Bio:* ${user.signature || "No bio available."}
🔗 *Bio Link:* ${user.bioLink?.link || "No link available."}

📊 *Statistics:*
👥 *Followers:* ${stats.followerCount.toLocaleString()}
👤 *Following:* ${stats.followingCount.toLocaleString()}
❤️ *Likes:* ${stats.heartCount.toLocaleString()}
🎥 *Videos:* ${stats.videoCount.toLocaleString()}

📅 *Account Created:* ${new Date(user.createTime * 1000).toLocaleDateString()}
🔒 *Private Account:* ${user.privateAccount ? "Yes 🔒" : "No 🌍"}

🔗 *Profile URL:* https://www.tiktok.com/@${user.uniqueId}
`;

    const profileImage = { image: { url: user.avatarLarger }, caption: profileInfo };

    await kayiza.sendMessage(m.chat, profileImage, { quoted: m });
  } catch (error) {
    console.error("❌ Error in TikTok stalk command:", error);
    m.reply("⚠️ An error occurred while fetching TikTok profile data.");
  }
}
break
//xstalk 


  //lines
  case "lines": {
    try {
        const { data } = await axios.get('https://apis.davidcyriltech.my.id/pickupline');

        if (!data.success) return Reply("❌ Failed to get a pickup line. Try again!");

         m.reply(`💝 *Pickup Line* 💝\n\n"${data.pickupline}"\n\n_Use wisely!_`);

    } catch (error) {
        console.error('Pickup Error:', error);
        m.reply("❌ My charm isn't working right now. Try again later!");
    }
}
break
  // news
  case "news": {
    try {
        const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c';  // Replace with your NewsAPI key
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
        const articles = response.data.articles.slice(0, 5); // Get top 5 articles
        let newsMessage = '📰 *Latest News*:\n\n';
        articles.forEach((article, index) => {
            newsMessage += `${index + 1}. *${article.title}*\n${article.description}\n\n`;
        });
        await kayiza.sendMessage(m.chat, { text: newsMessage });
    } catch (error) {
        console.error('Error fetching news:', error);
        await kayiza.sendMessage(m.chat, { text: 'Sorry, I could not fetch news right now.' });
    }
} 
break


case "requests":
 {
    try {
        await kayiza.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        if (!m.isGroup) {
            await kayiza.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply("❌ This command can only be used in groups.");
        }
        if (!m.isBotAdmin) {
            await kayiza.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply("❌ I need to be an admin to view join requests.");
        }

        const requests = await kayiza.groupRequestParticipantsList(m.chat);

        if (requests.length === 0) {
            await kayiza.sendMessage(m.chat, {
                react: { text: 'ℹ️', key: m.key }
            });
            return Reply("ℹ️ No pending join requests.");
        }

        let text = `📋 *Pending Join Requests (${requests.length})*\n\n`;
        requests.forEach((user, i) => {
            text += `${i+1}. @${user.jid.split('@')[0]}\n`;
        });

        await kayiza.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });
        return Reply(text, { mentions: requests.map(u => u.jid) });
    } catch (error) {
        console.error("Request list error:", error);
        await kayiza.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        return Reply("❌ Failed to fetch join requests.");
    }
}
break

case "acceptall":
{
    try {
        await kayiza.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        if (!m.isGroup) {
            await kayiza.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply(mess.admin);
        }

        if (!m.isBotAdmin) {
            await kayiza.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply(mess.admin);
        }

        const requests = await kayiza.groupRequestParticipantsList(m.chat);

        if (requests.length === 0) {
            await kayiza.sendMessage(m.chat, {
                react: { text: 'ℹ️', key: m.key }
            });
            return Reply("ℹ️ No pending join requests to accept.");
        }

        const jids = requests.map(u => u.jid);
        await kayiza.groupRequestParticipantsUpdate(m.chat, jids, "approve");

        await kayiza.sendMessage(m.chat, {
            react: { text: '👍', key: m.key }
        });
        return Reply(`✅ Successfully accepted ${requests.length} join requests.`);
    } catch (error) {
        console.error("Accept all error:", error);
        await kayiza.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        return Reply("❌ Failed to accept join requests.");
    }
}
break

case "rejectall":
 {
    try {
        await kayiza.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        if (!m.isGroup) {
            await kayiza.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply(mess.group);
        }

        if (!m.isBotAdmin) {
            await kayiza.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply(mess.admin);
        }

        const requests = await kayiza.groupRequestParticipantsList(m.chat);

        if (requests.length === 0) {
            await kayiza.sendMessage(m.chat, {
                react: { text: 'ℹ️', key: m.key }
            });
            return Reply("ℹ️ No pending join requests to reject.");
        }

        const jids = requests.map(u => u.jid);
        await kayiza.groupRequestParticipantsUpdate(from, jids, "reject");

        await kayiza.sendMessage(m.chat, {
            react: { text: '👎', key: m.key }
        });
        return Reply(`✅ Successfully rejected ${requests.length} join requests.`);
    } catch (error) {
        console.error("Reject all error:", error);
        await kayiza.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        return Reply("❌ Failed to reject join requests.");
    }
}


                        //================================================================================

                        default:
                                if (budy.startsWith('>')) {
                                        if (!isCreator) return
                                        try {
                                                let evaled = await eval(budy.slice(2))
                                                if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                                                await m.reply(evaled)
                                        } catch (err) {
                                                await m.reply(String(err))
                                        }}

                        //================================================================================

                        if (m.text.toLowerCase() == "bot") {
                                m.reply("*𝙱𝚘𝚝 𝚒𝚜 𝚘𝚗𝚕𝚒𝚗𝚎*")
                        }

                        //================================================================================

                        if (budy.startsWith('=>')) {
                                if (!isCreator) return
                                try {
                                        let evaled = await eval(`(async () => { ${budy.slice(2)} })()`)
                                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                                        await m.reply(evaled)
                                } catch (err) {
                                        await m.reply(String(err))
                                }}

                        //================================================================================

                        if (budy.startsWith('$')) {
                                if (!isCreator) return
                                if (!text) return
                                exec(budy.slice(2), (err, stdout) => {
                                        if (err) return m.reply(`${err}`)
                                        if (stdout) return m.reply(stdout)
                                })
                        }

                        //================================================================================
                }
        } catch (err) {
                console.log(util.format(err));
                const botNumber = kayiza.user.id.split(':')[0] + '@s.whatsapp.net';
                let Obj = botNumber
                kayiza.sendMessage(Obj + "@s.whatsapp.net", { 
                        text: `
*ERROR OCCURED :*\n\n` + util.format(err), 
                        contextInfo: { isForwarded: true } 
                }, { quoted: m })
        }}

//================================================================================

let file = require.resolve(__filename)
fs.watchFile(file, () => {
        fs.unwatchFile(file)
        console.log(chalk.redBright(`Update ${__filename}`))
        delete require.cache[file]
        require(file)
});