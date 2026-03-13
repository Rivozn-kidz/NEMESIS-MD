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
const { default: WAConnection, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, getBinaryNodeChildren,
getDevice, useMultiFileAuthState, generateWAMessageContent, downloadContentFromMessage, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@whiskeysockets/baileys');

const db = require('./lib/databaseManager');
const { ephoto, acr } = require('./functions/nemesis'); 
const contacts = JSON.parse(fs.readFileSync("./lib/database/contacts.json"))
const owners = JSON.parse(fs.readFileSync("./lib/database/owner.json"))
const premium = JSON.parse(fs.readFileSync("./lib/database/premium.json"))
const list = JSON.parse(fs.readFileSync("./lib/database/list.json"))
const { pinterest, pinterest2, remini, mediafire, tiktokDl } = require('./lib/scraper');
const { unixTimestampSeconds, generateMessageTag, processTime, webApi, getRandom, getBuffer, fetchJson, runtime, clockString, sleep, isUrl, getTime, formatDate, tanggal, formatp, jsonformat, reSize, toHD, logic, generateProfilePicture, bytesToSize, checkBandwidth, getSizeMedia, parseMention, getGroupAdmins, readFileTxt, readFileJson, getHashedPassword, generateAuthToken, cekMenfes, generateToken, batasiTeks, randomText, isEmoji, getTypeUrlMedia, pickRandom, toIDR, capital } = require('./lib/function');
const {
veniceAICommand,
mistralAICommand,
perplexityAICommand,
bardAICommand,
gpt4NanoAICommand,
kelvinAICommand,
claudeAICommand
} = require('./lib/ai');

module.exports = clutch = async (clutch, m, chatUpdate, store) => {
        try {
                const botNumber = await clutch.decodeJid(clutch.user.id)
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

     // Ensure group database exists
if (m.isGroup) {
    if (!db.groups) db.groups = {}

    if (!db.groups[m.chat]) {
        db.groups[m.chat] = {
            mute: false,
            antilink: false,
            antilink2: false
        }
    }
}

// Mute check
if (m.isGroup && db.groups[m.chat].mute === true && !isCreator) return

// Anti-link kick
if (m.isGroup && db.groups[m.chat].antilink === true) {
    const link = /chat.whatsapp.com|buka tautaniniuntukbergabungkegrupwhatsapp/gi

    if (m.text && link.test(m.text) && !isCreator && !m.isAdmin && m.isBotAdmin && !m.fromMe) {

        const gclink = `https://chat.whatsapp.com/` + await clutch.groupInviteCode(m.chat)
        const isLinkThisGc = new RegExp(gclink, 'i')
        const isgclink = isLinkThisGc.test(m.text)

        if (isgclink) return

        let delet = m.key.participant
        let bang = m.key.id

        await clutch.sendMessage(
            m.chat,
            {
                text: `*乂 [ Group Link Detected ]*\n\n@${m.sender.split("@")[0]} Sorry, I will kick you because the anti-link feature is enabled.`,
                mentions: [m.sender]
            },
            { quoted: m }
        )

        await clutch.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: bang,
                participant: delet
            }
        })

        await sleep(1000)

        await clutch.groupParticipantsUpdate(m.chat, [m.sender], "remove")
    }
}

// Anti-link delete message only
if (m.isGroup && db.groups[m.chat].antilink2 === true) {
    const link = /chat.whatsapp.com|buka tautaniniuntukbergabungkegrupwhatsapp/gi

    if (m.text && link.test(m.text) && !isCreator && !m.isAdmin && m.isBotAdmin && !m.fromMe) {

        const gclink = `https://chat.whatsapp.com/` + await clutch.groupInviteCode(m.chat)
        const isLinkThisGc = new RegExp(gclink, 'i')
        const isgclink = isLinkThisGc.test(m.text)

        if (isgclink) return

        let delet = m.key.participant
        let bang = m.key.id

        await clutch.sendMessage(
            m.chat,
            {
                text: `*乂 [ Group Link Detected ]*\n\n@${m.sender.split("@")[0]} Your message was deleted because the anti-link feature is enabled.`,
                mentions: [m.sender]
            },
            { quoted: m }
        )

        await clutch.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: bang,
                participant: delet
            }
        })
    }
}

                //============= [ FUNCTION ] ======================================================

                const example = (teks) => {
                        return `\n *Usage examples :*\n Type *${prefix+command}* ${teks}\n`
                }

                const Reply = async (teks) => {
                        return clutch.sendMessage(m.chat, {text: teks, mentions: [m.sender], contextInfo: {
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
                const ridzcoder = { clutch, toIDR, isCreator, Reply, command, isPremium, capital, isCmd, example, text, runtime, qtext, qlocJpm, qmsg, mime, sleep, botNumber }
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
if (!text) return m.reply(example("https://ridzcoder.zone.id"))
if (!isUrl(text)) return m.reply(example("https://ridzcoder.zone.id"))
const {
  screenshotV1, 
  screenshotV2,
  screenshotV3 
} = require('getscreenshot.js')
const fs = require('fs')
var data = await screenshotV2(text)
await clutch.sendMessage(m.chat, { image: data, mimetype: "image/png"}, {quoted: m})
}
break
case "support": {
try {

let dec = `    
⟣──────────────────⟢
▧ *ᴄʀᴇᴀᴛᴏʀ* : *Ridz Coder X Kevin tech*
▧ *ᴍᴏᴅᴇ* : *public*
▧ *ᴘʀᴇғɪx* : .
▧ *ᴠᴇʀsɪᴏɴ* : *2.0.0*

⟣──────────────────⟢

> NEMESIS MD 
https://github.com/Ridzcoder/NEMESIS-MD

⟣──────────────────⟢
> CHANNEL
https://whatsapp.com/channel/0029Vb73EYZFXUujAoHFor1i

> GROUP
https://chat.whatsapp.com/KQzM54TU1LmGwIGc2TcOGi?mode=gi_t
`

await clutch.sendMessage(
m.chat,
{
image:{url:"https://files.catbox.moe/qhl7st.png"},
caption:dec,
contextInfo:{
mentionedJid:[m.sender],
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363404529319592@newsletter",
newsletterName:"Airbyte Synergetic Labs🪀",
serverMessageId:143
}
}
},
{quoted:m}
)

} catch(e){
console.log(e)
m.reply("Error")
}
}
break
case "instagram":
case "insta":
case "ig": {
try {

const url = text || m.quoted?.text
if(!url || !url.includes("instagram.com")) return m.reply("Provide Instagram link")

let api=`https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`
let res=await axios.get(api)

for(const item of res.data.data){

let caption=`📶 *Instagram Downloader*

❤‍🩹 Quality: HD

> © Powered by Ridz Coder x Kevin Tech`

await clutch.sendMessage(
m.chat,
{
[item.type==='video'?'video':'image']:{url:item.url},
caption:caption,
contextInfo:{
mentionedJid:[m.sender],
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363404529319592@newsletter",
newsletterName:"Airbyte Synergetic Labs🪀",
serverMessageId:143
}
}
},
{quoted:m}
)

}

}catch(e){
console.log(e)
m.reply("Download failed")
}
}
break



case "instagram2":
case "ig2": {
try {

const url = text
if(!url || !url.includes("instagram.com")) return m.reply("Invalid link")

const api=`https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(url)}`
const {data}=await axios.get(api)

const video=data.result[0]

let caption=`📥 *Instagram Reel Downloader*

> Powered by Ridz Coder`

await clutch.sendMessage(
m.chat,
{
video:{url:video},
caption:caption,
contextInfo:{
mentionedJid:[m.sender],
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363404529319592@newsletter",
newsletterName:"Airbyte Synergetic Labs🪀",
serverMessageId:143
}
}
},
{quoted:m}
)

}catch(e){
console.log(e)
m.reply("Failed")
}
}
break



case "facebook":
case "fbdl": {
try {

const url=text
if(!url || !url.includes("facebook.com")) return m.reply("Invalid Facebook link")

const api=`https://apis.davidcyriltech.my.id/facebook?url=${encodeURIComponent(url)}`
const {data}=await axios.get(api)

const dl=data.result.downloads.hd?.url||data.result.downloads.sd.url
const quality=data.result.downloads.hd?"HD":"SD"

let caption=`🎥 *Facebook Video Downloader*

Quality: ${quality}

> Powered by Ridz Coder`

await clutch.sendMessage(
m.chat,
{
video:{url:dl},
caption:caption,
contextInfo:{
mentionedJid:[m.sender],
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363404529319592@newsletter",
newsletterName:"Airbyte Synergetic Labs🪀",
serverMessageId:143
}
}
},
{quoted:m}
)

}catch(e){
console.log(e)
m.reply("Failed downloading video")
}
}
break



case "family": {
try {

let caption=`
      *╭┈──[ • RIDZ TECH 𝖥𝖠𝖬𝖨𝖫𝖸 • ]───•*
      *│  ◦* *▢➠*
      *│  ◦* *▢➠ Kelvin tech*
      *│  ◦* *▢➠ Jinx*
      *│  ◦* *▢➠ Terri Dev*
      *│  ◦* *▢➠ Rivozn Coder*
      *│  ◦* *▢➠ And You*
      *╰┈───────────────•*
        *•────────────•⟢*
      Family is not about blood,It's about the people who choose to be there for you, support you, and love you unconditionally, no matter what. They're the ones who show up, who listen, and who care 🤗
`

await clutch.sendMessage(
m.chat,
{
image:{url:"https://files.catbox.moe/qhl7st.png"},
caption:caption,
contextInfo:{
mentionedJid:[m.sender],
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363404529319592@newsletter",
newsletterName:"Airbyte Synergetic Labs🪀",
serverMessageId:143
}
}
},
{quoted:m}
)

}catch(e){
console.log(e)
m.reply("Error")
}
}
break



case "ridzcoder":
case "kayiza": {
try {

let caption=`
╭━━〔 ʀɪᴅᴢ ᴄᴏᴅᴇʀ ɪɴғᴏ〕━━┈⊷
┃★
┃★ •ʜᴇʟʟᴏ There 👋, ɪ ᴀᴍ ʀɪᴅᴢ ᴄᴏᴅᴇʀ.
┃★ •ɪ ʟᴀᴜɢʜ ᴀᴛ ᴇᴠᴇʀʏᴏɴᴇ ᴡʜᴏ ʟᴀᴜɢʜs ᴀᴛ ᴍᴇ.
┃★ •ɪ ᴀᴍ ᴛʜᴇ ʟᴀsᴛ ᴛʜɪᴇғ, ʙᴜᴛ ᴅᴏɴ'ᴛ ᴄʜᴀsᴇ ᴀғᴛᴇʀ ᴍᴇ
┃★ •ʙᴇᴄᴀᴜsᴇ ɪ ᴡɪʟʟ ᴄʜᴀɴɢᴇ ᴍʏsᴇʟғ
┃★ •ᴀsᴋ ᴛʜᴇᴍ ᴀʟʟ ᴀɴᴅ ᴛʜᴇʏ ᴡɪʟʟ ᴛᴇʟʟ ʏᴏᴜ:
┃★ •ɪғ ʏᴏᴜ sᴛᴀɴᴅ ʙᴇʜɪɴᴅ ᴍᴇ, ɪ ᴘʀᴏᴛᴇᴄᴛ ʏᴏᴜ.
┃★ •ɪғ ʏᴏᴜ sᴛᴀɴᴅ ʙᴇsɪᴅᴇ ᴍᴇ, ɪ ʀᴇsᴘᴇᴄᴛ ʏᴏᴜ.
┃★ •ʙᴜᴛ ɪғ ʏᴏᴜ sᴛᴀɴᴅ ᴀɢᴀɪɴsᴛ ᴍᴇ, ɪ sʜᴏᴡ ɴᴏ ᴍᴇʀᴄʏ.
┃★
╰━━━━━━━━━━━━━━━┈⊷

> *ᴀ sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ᴅᴇᴠᴇʟᴘᴏʀ*

*╭━━━〔 • MY TOP FRIENDS• 〕━━━┈⊷*
*┃★╭──────────────*
*┃★│* *▢KEVIN TECH*
*┃★│* *▢JINX*
*┃★│* *▢TERRI DEV*
*┃★│* *▢KING ORMAN*
*┃★╰──────────────*
*╰━━━━━━━━━━━━━━━┈⊷*

*•────────────•⟢*
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ
*•────────────•⟢*
`

await clutch.sendMessage(
m.chat,
{
image:{url:"https://files.catbox.moe/qhl7st.png"},
caption:caption,
contextInfo:{
mentionedJid:[m.sender],
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363404529319592@newsletter",
newsletterName:"Airbyte Synergetic Labs🪀",
serverMessageId:999
}
}
},
{quoted:m}
)

}catch(e){
console.log(e)
m.reply("Error")
}
}
break
case "pair":
case "pair2": {
try {

let caption=`
ohh 😯 No, to pair your number contact Ridz Coder on +237678687593

*•────────────•⟢*
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ
*•────────────•⟢*
`

await clutch.sendMessage(
m.chat,
{
image:{url:"https://files.catbox.moe/qhl7st.png"},
caption:caption,
contextInfo:{
mentionedJid:[m.sender],
forwardingScore:999,
isForwarded:true,
forwardedNewsletterMessageInfo:{
newsletterJid:"120363404529319592@newsletter",
newsletterName:"Airbyte Synergetic Labs🪀",
serverMessageId:999
}
}
},
{quoted:m}
)

}catch(e){
console.log(e)
m.reply("Error")
}
}
break
case "play": {
try {

if (!text) return Reply("Example: .play lucid dreams")

await clutch.sendMessage(m.chat,{react:{text:"🔎",key:m.key}})

let search = await yts(text)
if (!search.videos.length) return Reply("No results found")

let video = search.videos[0]
let videoUrl = video.url.split("&")[0]

await clutch.sendMessage(m.chat,{react:{text:"⬇️",key:m.key}})

const res = await axios.get(
"https://api.malvin.gleeze.com/download/youtube",
{
params:{ url: videoUrl },
headers:{ "User-Agent":"Mozilla/5.0" }
}
).catch(()=>null)

if (!res || !res.data.status) return Reply("Download failed")

let anu = res.data

let caption = `
╭─❍ *NEMESIS MD SONG DL*
║ 🎵 Title: ${anu.title}
║ ⏱ Duration: ${video.timestamp}
║ 🔗 Link: ${videoUrl}
╰────────────
> Created by Ridz Coder
`

await clutch.sendMessage(m.chat,{
image:{url:anu.thumbnail},
caption
},{quoted:m})

await clutch.sendMessage(m.chat,{
audio:{url:anu.audio},
mimetype:"audio/mpeg",
fileName:`${anu.title}.mp3`
},{quoted:m})

await clutch.sendMessage(m.chat,{react:{text:"✅",key:m.key}})

} catch(e){
console.log(e)
Reply("Download failed")
}
}
break
// ===== BIBLE VERSE =====
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

// ===== BIBLE BOOK LIST (FULL) =====
case "biblelist": {
    m.reply(`📖 *NEMESIS MD BIBLE BOOKS*

╭──⧼♛ *Old Testament* ♛⧽──≽
│┃ ♛Genesis
│┃ ♛ Exodus
│┃ ♛Leviticus
│┃ ♛Numbers
│┃ ♛ Deuteronomy
│┃ ♛Joshua
│┃ ♛Judges
│┃ ♛Ruth
│┃ ♛1 Samuel
│┃ ♛ 2 Samuel
│┃ ♛1 Kings
│┃ ♛ 2 Kings
│┃ ♛ 1 Chronicles
│┃ ♛ 2 Chronicles
│┃ ♛Ezra
│┃ ♛ Nehemiah
│┃ ♛ Esther
│┃ ♛ Job
│┃ ♛ Psalms
│┃ ♛Proverbs
│┃ ♛ Ecclesiastes
│┃ ♛ Song of Solomon
│┃ ♛Isaiah
│┃ ♛ Jeremiah
│┃ ♛ Lamentations
│┃ ♛ Ezekiel
│┃ ♛Daniel
│┃ ♛ Hosea
│┃ ♛ Joel
│┃ ♛ Amos
│┃ ♛ Obadiah
│┃ ♛Jonah
│┃ ♛ Micah
│┃ ♛ Nahum
│┃ ♛ Habakkuk
│┃ ♛ Zephaniah
│┃ ♛Haggai
│┃ ♛ Zechariah
│┃ ♛ Malachi
╰──────────────────≽

╭──⧼ *♛New Testament* ♛⧽──≽
│┃ ♛Matthew
│┃ ♛ Mark
│┃ ♛ Luke
│┃ ♛ John
│┃ ♛ Act
│┃ ♛Romans
│┃ ♛ 1 Corinthians
│┃ ♛ 2 Corinthians
│┃ ♛Galatians
│┃ ♛ Ephesians
│┃ ♛ Philippians
│┃ ♛ Colossians
│┃ ♛1 Thessalonians
│┃ ♛ 2 Thessalonians
│┃ ♛1 Timothy
│┃ ♛ 2 Timothy
│┃ ♛ Titus
│┃ ♛ Philemon
│┃ ♛Hebrews
│┃ ♛ James
│┃ ♛ 1 Peter
│┃ ♛ 2 Peter
│┃ ♛1 John
│┃ ♛ 2 John
│┃ ♛ 3 John
│┃ ♛ Jude
│┃ ♛ Revelation
╰──────────────────≽
ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ`)
}
break
// ===== QURAN VERSE =====
case "quran": {
    if (!text) return m.reply("Example: .quran 1:1")
    try {
        let res = await fetch(`https://api.alquran.cloud/v1/ayah/${text}/en.asad`)
        let json = await res.json()
        if (json.status !== "OK") return m.reply("Verse not found")

        m.reply(`📜 *Quran*
Surah ${json.data.surah.englishName} (${json.data.surah.number})
Ayah ${json.data.numberInSurah}

${json.data.text}
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ`)
    } catch {
        m.reply("Error fetching Quran verse")
    }
}
break

// ===== QURAN SURAH LIST (FULL 114) =====
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

case "meme": {
    let res = await fetch("https://meme-api.com/gimme")
    let json = await res.json()
    clutch.sendMessage(m.chat, { image: { url: json.url }, caption: "> ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ" }, { quoted: m })
}
break

case "anime": {
    let res = await fetch("https://api.waifu.pics/sfw/waifu")
    let json = await res.json()
    clutch.sendMessage(m.chat, { image: { url: json.url }, caption: "🌸 Anime" }, { quoted: m })
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

    clutch.sendMessage(
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


                case "shortlink": case "shorturl": {
if (!text) return m.reply(example("https://ridzcoder.zone.id"))
if (!isUrl(text)) return m.reply(example("https://ridzcoder.zone.id"))
var res = await axios.get('https://tinyurl.com/api-create.php?url='+encodeURIComponent(text))
var link = `
* *𝙷𝚎𝚛𝚎 𝚒𝚜 𝚢𝚘𝚞𝚛 𝚜𝚑𝚘𝚛𝚢 𝚕𝚒𝚗𝚔*
${res.data.toString()}
`
return m.reply(link)
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
               await clutch.sendMessage(m.chat, { 
                react: { text: "☠️", key: m.key } 
            });
            const mime = mediaMessage.mimetype;
            if (!mime) return Reply("❌ Unable to detect media type.");

            if (mime.startsWith("image/")) {
                return await handleImage(clutch, m.chat, mediaMessage);
            }

            if (mime.startsWith("video/")) {
                return await handleVideo(clutch, m.chat, mediaMessage);
            }

            if (mime.startsWith("audio/")) {
                return await handleAudio(clutch, m.chat, mediaMessage);
            }

            m.reply("❌ Unsupported media type.");

        } catch (err) {
            console.error("ViewOnce Error:", err);
            m.reply("❌ Failed to process view-once media.");
        }
    }

async function handleImage(clutch, chatId, mediaMessage) {
    const stream = await downloadContentFromMessage(mediaMessage, 'image');
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    await clutch.sendMessage(chatId, { image: buffer });
}

async function handleVideo(clutch, chatId, mediaMessage) {
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

async function handleAudio(clutch, chatId, mediaMessage) {
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
let media = await clutch.downloadAndSaveMediaMessage(qmsg)
const { ImageUploadService } = require('node-upload-images')
const service = new ImageUploadService('pixhost.to');
let { directLink } = await service.uploadFromBinary(fs.readFileSync(media), 'media.png');

let teks = directLink.toString()
await clutch.sendMessage(m.chat, {text: teks}, {quoted: m})
await fs.unlinkSync(media)
}
break

case "play2": {
if (!text) return m.reply("Example: .play2 youtube link")
if (!text.startsWith("https://")) return m.reply("Invalid youtube link")

await clutch.sendMessage(m.chat,{react:{text:"🕖",key:m.key}})

try {

let videoUrl = text.split("&")[0]

const res = await axios.get(
"https://api.malvin.gleeze.com/download/youtube",
{
params:{ url: videoUrl },
headers:{ "User-Agent":"Mozilla/5.0" }
}
).catch(()=>null)

if (!res || !res.data.status) return m.reply("Error! No result")

let anu = res.data

await clutch.sendMessage(m.chat,{
audio:{url:anu.audio},
mimetype:"audio/mpeg",
fileName:`${anu.title}.mp3`
},{quoted:m})

} catch(e){
console.log(e)
m.reply("API error")
}

await clutch.sendMessage(m.chat,{react:{text:"",key:m.key}})
}
break

//=================================================

case "ytmp4": {
if (!text) return m.reply("Example: .ytmp4 youtube link")
if (!text.startsWith("https://")) return m.reply("Invalid youtube link")

await clutch.sendMessage(m.chat,{react:{text:"🕖",key:m.key}})

try {

let videoUrl = text.split("&")[0]

const res = await axios.get(
"https://api.malvin.gleeze.com/download/youtube",
{
params:{ url: videoUrl },
headers:{ "User-Agent":"Mozilla/5.0" }
}
).catch(()=>null)

if (!res || !res.data.status) return m.reply("Error! No result")

let anu = res.data

await clutch.sendMessage(m.chat,{
video:{url:anu.videos["360"]},
mimetype:"video/mp4",
fileName:`${anu.title}.mp4`
},{quoted:m})

} catch(e){
console.log(e)
m.reply("API error")
}

await clutch.sendMessage(m.chat,{react:{text:"",key:m.key}})
}
break

//=================================================

case "video": {
if (!text) return m.reply("Example: .playvid faded alan walker")

await clutch.sendMessage(m.chat,{react:{text:"🔎",key:m.key}})

let search = await yts(text)
let video = search.videos[0]

if (!video) return m.reply("No result found")

try {

let videoUrl = video.url.split("&")[0]

const res = await axios.get(
"https://api.malvin.gleeze.com/download/youtube",
{
params:{ url: videoUrl },
headers:{ "User-Agent":"Mozilla/5.0" }
}
).catch(()=>null)

if (!res || !res.data.status) return m.reply("Download failed")

let anu = res.data

await clutch.sendMessage(m.chat,{
video:{url:anu.videos["360"]},
ptv:true,
mimetype:"video/mp4"
},{quoted:m})

} catch(e){
console.log(e)
m.reply("API error")
}

await clutch.sendMessage(m.chat,{react:{text:"",key:m.key}})
}
break

case "tt": case "tiktok": {
if (!text) return m.reply(example("𝙿𝚛𝚘𝚟𝚒𝚍𝚎 𝚝𝚒𝚔𝚝𝚘𝚔 𝚞𝚛𝚕"))
if (!text.startsWith("https://")) return m.reply(example("𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚝𝚒𝚔𝚝𝚘𝚔 𝚞𝚛𝚕"))
await tiktokDl(q).then(async (result) => {
await clutch.sendMessage(m.chat, {react: {text: '🕖', key: m.key}})
if (!result.status) return m.reply("Error!")
if (result.durations == 0 && result.duration == "0 Seconds") {
let araara = new Array()
let urutan = 0
for (let a of result.data) {
let imgsc = await prepareWAMessageMedia({ image: {url: `${a.url}`}}, { upload: clutch.waUploadToServer })
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
await clutch.relayMessage(m.chat, msgii.message, { 
messageId: msgii.key.id 
})
} else {
let urlVid = await result.data.find(e => e.type == "nowatermark_hd" || e.type == "nowatermark")
await clutch.sendMessage(m.chat, {video: {url: urlVid.url}, mimetype: 'video/mp4', caption: `*𝚃𝙸𝙺𝚃𝙾𝙺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 ✅*`}, {quoted: m})
}
}).catch(e => console.log(e))
await clutch.sendMessage(m.chat, {react: {text: '', key: m.key}})
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

        await clutch.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

        const allGroups = await clutch.groupFetchAllParticipating();
        const groupList = Object.values(allGroups);

        if (groupList.length === 0) return Reply("❌𝙽𝚘 𝚐𝚛𝚘𝚞𝚙 𝚏𝚘𝚞𝚗𝚍.");

        const rows = groupList.map(g => ({
            title: g.subject,
            description: `Member: ${g.participants.length} | Status: ${g.announce == false ? "Open" : "Admin Only"}`,
            id: `${prefix}swgc_process ${g.id}`
        }));

        await clutch.sendMessage(m.chat, {
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
    await clutch.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    try {
        if (/image/.test(data.mime)) {
            await clutch.sendMessage(groupId, { groupStatusMessage: { image: data.buffer, caption: data.caption } });
        } else if (/video/.test(data.mime)) {
            await clutch.sendMessage(groupId, { groupStatusMessage: { video: data.buffer, caption: data.caption } });
        } else if (/audio/.test(data.mime)) {
            await clutch.sendMessage(groupId, { groupStatusMessage: { audio: data.buffer } });
        } else if (data.mime === "text" && data.caption) {
            await clutch.sendMessage(groupId, { groupStatusMessage: { text: data.caption } });
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
                case "brat": {
    if (!text) 
        return m.reply('❌ Use: .𝚋𝚛𝚊𝚝 𝚑𝚎𝚕𝚕𝚘 𝚠𝚘𝚛𝚕𝚍');
        await clutch.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
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
       await clutch.sendMessage(m.chat, {
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
                                        var onWa = await clutch.onWhatsApp(input.split("@")[0])
                                        if (onWa.length < 1) return m.reply("𝙽𝚘 𝚙𝚊𝚛𝚝𝚒𝚌𝚒𝚙𝚊𝚗𝚝")
                                        const res = await clutch.groupParticipantsUpdate(m.chat, [input], 'remove')
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
                                await clutch.groupLeave(m.chat)
                        }
                        break

                        //================================================================================

                        case "resetlinkgc": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!m.isGroup) return Reply(mess.group)
                                if (!m.isBotAdmin) return Reply(mess.botAdmin)
                                await clutch.groupRevokeInvite(m.chat)
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
                                await clutch.sendMessage(m.chat, {text: teks, mentions: [...member]}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "linkgc": {
                                if (!m.isGroup) return Reply(mess.group)
                                if (!m.isBotAdmin) return Reply(mess.botAdmin)
                                const urlGrup = "https://chat.whatsapp.com/" + await clutch.groupInviteCode(m.chat)
                                var teks = `
${urlGrup}
`
                                await clutch.sendMessage(m.chat, {text: teks, matchedText: `${urlGrup}`}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "ht": 
                        case "hidetag": {
                                if (!m.isGroup) return Reply(mess.group)
                                if (!isCreator && !m.isAdmin) return Reply(mess.admin)
                                if (!text) return m.reply(example("group"))
                                let member = m.metadata.participants.map(v => v.id)
                                await clutch.sendMessage(m.chat, {text: text, mentions: [...member]}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "joingc": 
                        case "join": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!text) return m.reply(example("linkgcnya"))
                                if (!text.includes("chat.whatsapp.com")) return m.reply("Invalid WhatsApp group link")
                                let result = text.split('https://chat.whatsapp.com/')[1]
                                let id = await clutch.groupAcceptInvite(result)
                                m.reply(`𝙶𝚛𝚘𝚞𝚙 𝚓𝚘𝚒𝚗𝚎𝚍 ${id}`)
                        }
                        break

                        //================================================================================

                        case "get": 
                        case "g": {
                                if (!isCreator) return Reply(mess.owner)
                                if (!text) return m.reply(example("https://ridzcoder.zone.id"))
                                let data = await fetchJson(text)
                                m.reply(JSON.stringify(data, null, 2))
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
                                        await clutch.groupSettingUpdate(m.chat, 'not_announcement')
                                } else if (/closegc|close/.test(command)) {
                                        if (m.metadata.announce == true) return 
                                        await clutch.groupSettingUpdate(m.chat, 'announcement')
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
                                        await clutch.groupParticipantsUpdate(m.chat, [target], action.toLowerCase()).then(async () => {
                                                await clutch.sendMessage(m.chat, {text: `Success ${action.toLowerCase()} @${target.split("@")[0]}`, mentions: [target]}, {quoted: m})
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
                                if (!text) return m.reply(example("store|nemesis"))
                                if (!text.split("|")) return m.reply(example("store|nemesis"))
                                let result = text.split("|")
                                if (result.length < 2) return m.reply(example("store|nemesis"))
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
                                clutch.sendMessage(m.chat, {text: teks, mentions: premium}, {quoted: m})
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
                                let allgrup = await clutch.groupFetchAllParticipating()
                                let res = await Object.keys(allgrup)
                                let count = 0
                                const jid = m.chat
                                const teks = text
                                await m.reply(`𝚂𝚎𝚗𝚍𝚒𝚗𝚐 𝚓𝚙𝚖 𝚝𝚘 ${res.length} `)
                                for (let i of res) {
                                        if (global.db.groups[i] && global.db.groups[i].blacklistjpm && global.db.groups[i].blacklistjpm == true) continue
                                        try {
                                                await clutch.sendMessage(i, {text: `${teks}`}, {quoted: qlocJpm})
                                                count += 1
                                        } catch {}
                                        await sleep(global.delayJpm)
                                }
                                await clutch.sendMessage(jid, {text: `*𝚂𝚎𝚗𝚝 𝚌𝚘𝚖𝚖𝚘𝚗 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚘 : ${count} 𝚐𝚛𝚘𝚞𝚙𝚜`}, {quoted: m})
                        }
                        break

                        //================================================================================

                        case "developerbot": 
                        case "owner": {
                                await clutch.sendContact(m.chat, [global.owner], m)
                        }
                        break

                        //================================================================================
                        case "self": {
                                if (!isCreator) return
                                clutch.public = false
                                m.reply("𝙱𝙾𝚃 𝙲𝙷𝙰𝙽𝙶𝙴𝙳 𝚃𝙾 𝙿𝚁𝙸𝚅𝙰𝚃𝙴 𝙼𝙾𝙳𝙴*")
                        }
                        break
                        case "public": {
                                if (!isCreator) return
                                clutch.public = true
                                m.reply("𝙱𝚘𝚝 𝚌𝚑𝚊𝚗𝚐𝚎𝚍 𝚝𝚘 𝚙𝚞𝚋𝚕𝚒𝚌 𝚖𝚘𝚍𝚎*")
                        }
                        break

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
                                        var medis = await clutch.downloadAndSaveMediaMessage(qmsg)
                                        if (args[0] && args[0] == "long") {
                                                const { img } = await generateProfilePicture(medis)
                                                await clutch.query({
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
                                                await clutch.updateProfilePicture(botNumber, {content: medis})
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
                                clutch.chatModify({ delete: true, lastMessages: [{ key: m.key, messageTimestamp: m.timestamp }]}, m.chat)
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
                                clutch.sendMessage(m.chat, {text: teks, mentions: owners}, {quoted: m})
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
        if (!isCreator) {
            return Reply("❌ This command is only available for the owner!");
        }

        let userToAnalyze;

        // Mentioned user (group)
        if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            userToAnalyze = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }

        // Replied message
        else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
            userToAnalyze = m.message.extendedTextMessage.contextInfo.participant;
        }

        // Number provided (works in inbox)
        else if (text) {
            let number = text.replace(/[^0-9]/g, "");
            userToAnalyze = number + "@s.whatsapp.net";
        }

        // Default to sender
        else {
            userToAnalyze = m.sender;
        }

        let profilePic;
        try {
            profilePic = await clutch.profilePictureUrl(userToAnalyze, "image");
        } catch {
            profilePic = "https://files.catbox.moe/qhl7st.png";
        }

        await clutch.sendMessage(m.chat, {
            image: { url: profilePic },
            caption: `Profile picture of @${userToAnalyze.split("@")[0]}`,
            mentions: [userToAnalyze]
        }, { quoted: m });

    } catch (err) {
        console.error("GetPP Error:", err);
        m.reply("❌ Failed to retrieve profile picture.");
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
        await clutch.updateBlockStatus(jid, "block");
  //put succecc reaction
        m.reply(`Successfully blocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Block command error:", error);
        //await react("❌");
        m.reply("Failed to block the user.");
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
await clutch.sendMessage(m.chat, { audio: { url: url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
    }catch(a){
reply(`${a}`)
}
}
break
case "ask":
case "chat":
case "ai": {
    try {
        if (!text) return Reply("Please provide a message for the Ai.\nExample: `.nemesis what is going on`");
             await clutch.sendMessage(m.chat, { 
                react: { text: "📡", key: m.key } 
            });

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            return Reply("nemesis failed to respond. Please try again later.");
        }

        await m.reply(`🤖 *nemesis Response:*\n\n${data.message}`);
    } catch (e) {
        console.error("Error in AI command:", e);
        m.reply("An error occurred while communicating with the AI.");
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
      await clutch.sendMessage(m.chat, { text: hiddenMsg }, { quoted: null });
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
╭──⧼♛ *NEMESIS MD TT  STALKER* ♛⧽──≽
│┃ ♛ 
│┃ ♛ 👤 *Username:* @${user.uniqueId}
│┃ ♛ 📛 *Nickname:* ${user.nickname}
│┃ ♛ ✅ *Verified:* ${user.verified ? "Yes ✅" : "No ❌"}
│┃ ♛ 📍 *Region:* ${user.region}
│┃ ♛ 📝 *Bio:* ${user.signature || "No bio available."}
│┃ ♛ 🔗 *Bio Link:* ${user.bioLink?.link || "No link available."}
│┃ ♛ 
│┃ ♛ 📊 *Statistics:*
│┃ ♛ 👥 *Followers:* ${stats.followerCount.toLocaleString()}
│┃ ♛ 👤 *Following:* ${stats.followingCount.toLocaleString()}
│┃ ♛ ❤️ *Likes:* ${stats.heartCount.toLocaleString()}
│┃ ♛ 🎥 *Videos:* ${stats.videoCount.toLocaleString()}
│┃ ♛ 
│┃ ♛ 📅 *Account Created:* ${new Date(user.createTime * 1000).toLocaleDateString()}
│┃ ♛ 🔒 *Private Account:* ${user.privateAccount ? "Yes 🔒" : "No 🌍"}
│┃ ♛ 
╰────Rɪᴅᴢ Cᴏᴅᴇʀ❦─────≽
ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rɪᴅᴢ Cᴏᴅᴇʀ x Kᴇᴠɪɴ ᴛᴇᴄʜ
`;

    const profileImage = { image: { url: user.avatarLarger }, caption: profileInfo };

    await clutch.sendMessage(m.chat, profileImage, { quoted: m });
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
        await clutch.sendMessage(m.chat, { text: newsMessage });
    } catch (error) {
        console.error('Error fetching news:', error);
        await clutch.sendMessage(m.chat, { text: 'Sorry, I could not fetch news right now.' });
    }
} 
break


case "requests":
 {
    try {
        await clutch.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        if (!m.isGroup) {
            await clutch.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply("❌ This command can only be used in groups.");
        }
        if (!m.isBotAdmin) {
            await clutch.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply("❌ I need to be an admin to view join requests.");
        }

        const requests = await clutch.groupRequestParticipantsList(m.chat);

        if (requests.length === 0) {
            await clutch.sendMessage(m.chat, {
                react: { text: 'ℹ️', key: m.key }
            });
            return Reply("ℹ️ No pending join requests.");
        }

        let text = `📋 *Pending Join Requests (${requests.length})*\n\n`;
        requests.forEach((user, i) => {
            text += `${i+1}. @${user.jid.split('@')[0]}\n`;
        });

        await clutch.sendMessage(m.chat, {
            react: { text: '✅', key: m.key }
        });
        return Reply(text, { mentions: requests.map(u => u.jid) });
    } catch (error) {
        console.error("Request list error:", error);
        await clutch.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        return Reply("❌ Failed to fetch join requests.");
    }
}
break

case "acceptall":
{
    try {
        await clutch.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        if (!m.isGroup) {
            await clutch.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply(mess.admin);
        }

        if (!m.isBotAdmin) {
            await clutch.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply(mess.admin);
        }

        const requests = await clutch.groupRequestParticipantsList(m.chat);

        if (requests.length === 0) {
            await clutch.sendMessage(m.chat, {
                react: { text: 'ℹ️', key: m.key }
            });
            return Reply("ℹ️ No pending join requests to accept.");
        }

        const jids = requests.map(u => u.jid);
        await clutch.groupRequestParticipantsUpdate(m.chat, jids, "approve");

        await clutch.sendMessage(m.chat, {
            react: { text: '👍', key: m.key }
        });
        return Reply(`✅ Successfully accepted ${requests.length} join requests.`);
    } catch (error) {
        console.error("Accept all error:", error);
        await clutch.sendMessage(m.chat, {
            react: { text: '❌', key: m.key }
        });
        return Reply("❌ Failed to accept join requests.");
    }
}
break

case "repo": {
    try {
        const sender = m.sender;

        const repo = "Ridzcoder/NEMESIS-MD";
        const { data } = await axios.get(`https://api.github.com/repos/${repo}`);

        const caption = `
╭━━〔  *NEMESIS MD REPO* 〕━━⬣
│┃ ♛  *Bot Name:* ${data.name}
│┃ ♛  *Owner:* ${data.owner.login}
│┃ ♛  *Stars:* ${data.stargazers_count}
│┃ ♛  *Forks:* ${data.forks_count}
│┃ ♛  *Link:* ${data.html_url}
╰━━━━━━━━━━━━━━━━━━━━⬣
🏔️ *Don't forget to ★ and fork!*`;

        await clutch.sendMessage(
            m.chat,
            {
                image: { url: "https://files.catbox.moe/qva4tf.jpg" },
                caption: caption,
                contextInfo: {
                    mentionedJid: [sender]
                }
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        m.reply("❌ Failed to fetch repository info");
    }
}
break
case "smartphone":
case "gsmarena": {
    if (!text) return m.reply("*Please provide a query to search for smartphones.*");

    try {
      const apiUrl = `${global.siputzx}/api/s/gsmarena?query=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result.status || !result.data || result.data.length === 0) {
        return reply("*No results found. Please try another query.*");
      }

      const limitedResults = result.data.slice(0, 10);
      let responseMessage = `*Top 10 Results for "${text}":*\n\n`;

      for (let item of limitedResults) {
        responseMessage += `📱 *Name:* ${item.name}\n`;
        responseMessage += `📝 *Description:* ${item.description}\n`;
        responseMessage += `🌐 [View Image](${item.thumbnail})\n\n`;
      }

      m.reply(responseMessage);
    } catch (error) {
      console.error('Error fetching results from GSMArena API:', error);
      m.reply(mess.error);
    }
}
break
case "getdevice": {
   if (!m.quoted) {
      return m.reply('*Please quote a message to use this command!*');
    }
    
    console.log('Quoted Message:', m.quoted);
console.log('Quoted Key:', m.quoted?.key);

    try {
      const quotedMsg = await m.getQuotedMessage();

      if (!quotedMsg) {
        return reply('*Could not detect, please try with newly sent message!*');
      }

      const messageId = quotedMsg.key.id;

      const device = getDevice(messageId) || 'Unknown';

      m.reply(`The message is sent from *${device}* device.`);
    } catch (err) {
      console.error('Error determining device:', err);
      m.reply('Error determining device: ' + err.message);
    }
}
break
case "browse": {
if (!text) return m.reply("Enter URL");

    try {
      let res = await fetch(text);

      if (res.headers.get('Content-Type').includes('application/json')) {
        let json = await res.json();
        await clutch.sendMessage(m.chat, { text: JSON.stringify(json, null, 2) }, { quoted: m });
      } else {
        let resText = await res.text();
        await clutch.sendMessage(m.chat, { text: resText }, { quoted: m });
      }

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    } catch (error) {
      m.reply(`Error fetching URL: ${error.message}`);
    }
}
break
case "filtervcf": {
const quoted = m.quoted ? m.quoted : null;
    const mime = quoted?.mimetype || "";
    const normalizePhoneNumber = (phone) => {
      if (!phone || typeof phone !== 'string') return null;
      return phone.replace(/\D/g, '');
    };

    if (!quoted || !(mime === "text/vcard" || mime === "text/x-vcard")) {
      return clutch.sendMessage(m.chat, { 
        text: "❌ *Error:* Reply to a `.vcf` file with `.filtervcf` or `.cleanvcf`!" 
      }, { quoted: m });
    }

    try {
      const media = await quoted.download();
      const vcfContent = media.toString('utf8');
      
      await clutch.sendMessage(m.chat, { 
        text: "🔍 Filtering VCF - checking WhatsApp numbers, this may take a while..." 
      }, { quoted: m });

      const vCards = vcfContent.split('END:VCARD')
        .map(card => card.trim())
        .filter(card => card.length > 0);

      const validContacts = [];
      const invalidContacts = [];
      let processed = 0;

      for (const card of vCards) {
        try {
          const telMatch = card.match(/TEL[^:]*:([^\n]+)/);
          if (!telMatch) continue;
          
          const phoneRaw = telMatch[1].trim();
          const phoneNumber = normalizePhoneNumber(phoneRaw);
          if (!phoneNumber) continue;

          const jid = `${phoneNumber}@s.whatsapp.net`;
          const result = await clutch.onWhatsApp(jid);
          
          if (result.length > 0 && result[0].exists) {
            validContacts.push(card);
          } else {
            invalidContacts.push(phoneNumber);
          }
        } catch (error) {
          console.error('Error processing contact:', error);
        }
      }

      const filteredVcf = validContacts.join('\nEND:VCARD\n') + (validContacts.length > 0 ? '\nEND:VCARD' : '');
      
      const resultMessage = `✅ *VCF Filtering Complete*\n\n` +
        `• Total contacts: ${vCards.length}\n` +
        `• Valid WhatsApp contacts: ${validContacts.length}\n` +
        `• Non-WhatsApp numbers removed: ${invalidContacts.length}\n\n` +
        `Sending filtered VCF file...`;

      await clutch.sendMessage(m.chat, { text: resultMessage }, { quoted: m });

      await clutch.sendMessage(m.chat, { 
        document: Buffer.from(filteredVcf), 
        mimetype: "text/x-vcard", 
        fileName: "filtered_contacts.vcf" 
      });

    } catch (error) {
      await clutch.sendMessage(from, { 
        text: `❌ *Error:* ${error.message}` 
      }, { quoted: m });
    }
}
break
case "shazam": {
 const quoted = m.quoted ? m.quoted : null || m.msg ;
 const mime = quoted?.mimetype || ""; 
      if (!quoted || !/audio|video/.test(mime)) return m.reply("Reply to an audio or video to identify music.");
      
try {
    const media = await m.quoted.download();
    const filePath = `./tmp/${m.sender}.${mime.split('/')[1]}`;
    fs.writeFileSync(filePath, media);
    const res = await acr.identify(fs.readFileSync(filePath));
    if (res.status.code != 0) throw new Error(res.status.msg);

    //  this check before accessing music[0]
    if (!res.metadata?.music || res.metadata.music.length === 0) {
        return m.reply("No music identified in this audio/video.");
    }

    const { title, artists, album, release_date } = res.metadata.music[0];
    const resultText = `  *Music Identified!*\n\n*Title:* ${title}\n*Artist(s):* ${artists.map(v => v.name).join(', ')}\n*Album:* ${album?.name || 'Unknown'}\n*Release Date:* ${release_date || 'Unknown'}`;
    
    m.reply(resultText);
} catch (error) {
    console.error(error);
    m.reply("Error identifying music: " + error.message);
      }
}
break
case " advancedglow": {
let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}advancedglow Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/advanced-glow-effects-74.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in advancedglow command:", error);
      m.reply(mess.error);
      }
}
break
case "blackpinklogo": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}blackpinklogo Kevin*`);
    }

    const link = "https://en.ephoto360.com/create-blackpink-logo-online-free-607.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in blackpinklogo command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "blackpinkstyle": {
    let q = args.join(" ");
    if (!q) {
      return reply(`*Example: ${prefix}blackpinkstyle Ridz coder*`);
    }

    const link = "https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in blackpinkstyle command:", error);
      reply("*An error occurred while generating the effect.*");
    }
}
break
case "cartoonstyle": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}cartoonstyle Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in cartoonstyle command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "deadpool": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}deadpool Kevin*`);
    }

    const link = "https://en.ephoto360.com/create-light-effects-green-neon-online-429.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in deadpool command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
} 
break
case "effectclounds": {
let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}effectclouds Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in effectclouds command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "flagtext": {
let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}flagtext Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in flagtext command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "freecreate": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}freecreate Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in freecreate command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "galaxystyle": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}galaxystyle Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in galaxystyle command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "galaxywallpaper": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}galaxywallpaper Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in galaxywallpaper command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "makingneon": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}makingneon Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in makingneon command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
case "matrix": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}matrix Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/matrix-text-effect-154.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in matrix command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case"royaltext": {
let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}royaltext Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/royal-text-effect-online-free-471.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in royaltext command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "sand": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}sand Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in sand command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "summerbeach": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}summerbeach Kevin*`);
    }

    const link = "https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in summerbeach command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "topography": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}topography Ridz coder*`);
    }

    const link = "https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in topography command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "typography": {
    let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}typography Ridz Coder*`);
    }

    const link = "https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in typography command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "luxurygold": {
let q = args.join(" ");
    if (!q) {
      return m.reply(`*Example: ${prefix}luxurygold Kevin*`);
    }

    const link = "https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html";

    try {
      let result = await ephoto(link, q);
      await clutch.sendMessage(
        m.chat,
        { image: { url: result }, caption: `> ${global.wm}` },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in luxurygold command:", error);
      m.reply("*An error occurred while generating the effect.*");
    }
}
break
case "imdb":
case "movie": {
if (!text) return m.reply("Provide a movie or series name.");
      
      try {
        const { data } = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`);
        if (data.Response === "False") throw new Error();

        const imdbText = `🎬 *IMDB SEARCH*\n\n`
          + `*Title:* ${data.Title}\n*Year:* ${data.Year}\n*Rated:* ${data.Rated}\n`
          + `*Released:* ${data.Released}\n*Runtime:* ${data.Runtime}\n*Genre:* ${data.Genre}\n`
          + `*Director:* ${data.Director}\n*Actors:* ${data.Actors}\n*Plot:* ${data.Plot}\n`
          + `*IMDB Rating:* ${data.imdbRating} ⭐\n*Votes:* ${data.imdbVotes}`;

        clutch.sendMessage(m.chat, { image: { url: data.Poster }, caption: imdbText }, { quoted: m });
      } catch (error) {
        m.reply("❌ Unable to fetch IMDb data.");
      }
}
break
case 'venice':
case 'vai': {
    await veniceAICommand(clutch, m.chat, text, m);
    break;
}

case 'mistral': {
    await mistralAICommand(clutch, m.chat, text, m);
    break;
}

case 'perplexity': {
    await perplexityAICommand(clutch, m.chat, text, m);
    break;
}

case 'bard': {
    await bardAICommand(clutch, m.chat, text, m);
    break;
}

case 'gpt4nano':
case 'gpt41nano': {
    await gpt4NanoAICommand(clutch, m.chat, text, m);
    break;
}

case 'nemesisai': {
    await kelvinAICommand(clutch, text, m.chat, m);
    break;
}

case 'claude': {
    await claudeAICommand(clutch, m.chat, text, m);
    break;
}
case 'autotyping':
case 'typing': {
    if (!isCreator) return m.reply(mess.owner);
    const autoTyping = await db.get(botNumber, 'autoTyping', false);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        return m.reply(`❌ Usage: ${prefix}autotyping <on/off>`);
    }
    
    const boolValue = mode === 'on';
    
    await db.set(botNumber, 'autoTyping', boolValue);
    
    m.reply(`✅ Auto-typing ${boolValue ? 'enabled' : 'disabled'}`);
    break;
}
case 'autoreact': {
    if (!isCreator) return m.reply(mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'autoreact', false);
        return m.reply(`❌ Usage: ${prefix}autoreact <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF ❌'}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'autoreact', boolValue);
    m.reply(`✅ Auto-react ${boolValue ? 'enabled' : 'disabled'}`);
    break;
}
case 'autoread': {
    if (!isCreator) return m.reply(mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'autoread', false);
        return m.reply(`❌ Usage: ${prefix}autoread <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF ❌'}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'autoread', boolValue);
    m.reply(`✅ Auto-read ${boolValue ? 'enabled' : 'disabled'}`);
    break;
}
case 'autorecord':
case 'autorecording': {
    if (!isCreator) return m.reply(mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'autorecording', false);
        return m.reply(`❌ Usage: ${prefix}autorecord <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF ❌'}`);
    }
    
    const boolValue = mode === 'on';
    await db.set(botNumber, 'autorecording', boolValue);
    m.reply(`✅ Auto-recording ${boolValue ? 'enabled' : 'disabled'}`);
    break;
}
case 'aichat':
case 'chatbot':
case 'aichatbot':
case 'setai': {
    if (!isCreator) return m.reply(mess.owner);
    
    const mode = args[0]?.toLowerCase();
    if (!mode || !['on', 'off'].includes(mode)) {
        const current = await db.get(botNumber, 'AI_CHAT', false);
        return m.reply(`❌ Usage: ${prefix}aichat <on/off>\n\nCurrent: ${current ? 'ON ✅' : 'OFF ❌'}`);
    }
    // Message memory for conversation context
   let messageMemory = new Map();
   const MAX_MEMORY = 150; // Maximum messages to remember per chat
   
    const boolValue = mode === 'on';
    await db.set(botNumber, 'AI_CHAT', boolValue);
    
    // Clear memory when turning off/on
    if (boolValue) {
        // Clear old memory when turning on
        messageMemory.clear();
    }
    
    m.reply(`✅ AI Chatbot ${boolValue ? 'enabled' : 'disabled'}`);
    
}
case 'antiedit': {
    if (!isCreator) return m.reply(mess.owner);
    
    const mode = args[0]?.toLowerCase();
    
    // Show help if no arguments
    if (!mode) {
        const currentMode = await db.get(botNumber, 'antiedit', 'off');
        return m.reply(`*ANTI-EDIT SETTINGS*

Current Mode: ${currentMode}

📌 *Commands:*
• ${prefix}antiedit on - Enable (chat mode)
• ${prefix}antiedit off - Disable
• ${prefix}antiedit chat - Set to chat mode
• ${prefix}antiedit private - Set to private mode`);
    }
    
    // Handle on/off
    if (mode === 'on') {
        await db.set(botNumber, 'antiedit', 'chat');
        return m.reply(`✅*Successfully enabled antiedit chat mode*`);
    }
    
    if (mode === 'off') {
        await db.set(botNumber, 'antiedit', 'off');
        return m.reply(`✅*Successfully disabled antiedit*`);
    }
    
    // Handle mode settings
    if (mode === 'chat') {
        await db.set(botNumber, 'antiedit', 'chat');
        return m.reply(`✅*Successfully enabled antiedit chat mode*`);
    }
    
    if (mode === 'private') {
        await db.set(botNumber, 'antiedit', 'private');
        return m.reply(`✅*Successfully enabled antiedit private mode*`);
    }
    
    m.reply('*Invalid option! Use: on, off, chat, private*');
    break;
}
case 'antidelete': {
    if (!isCreator) return m.reply(mess.owner);
    
    const mode = args[0]?.toLowerCase();
    
    if (!mode) {
        const currentMode = await db.get(botNumber, 'antidelete', 'off');
        
        return m.reply(`*ANTI-DELETE SETTINGS*

Current Mode: ${currentMode}

📌 *Commands:*
• ${prefix}antidelete on - Enable (chat mode)
• ${prefix}antidelete off - Disable
• ${prefix}antidelete chat - Set to chat mode
• ${prefix}antidelete private - Set to private mode
• ${prefix}antidelete status - Show settings`);
    }
    
    // Handle on/off
    if (mode === 'on') {
        await db.set(botNumber, 'antidelete', 'chat');
        return m.reply(`✅*Successfully enabled antidelete chat mode*`);
    }
    
    if (mode === 'off') {
        await db.set(botNumber, 'antidelete', 'off');
        return m.reply(`✅*Successfully disabled antidelete*`);
    }
    
    // Handle mode settings
    if (mode === 'chat') {
        await db.set(botNumber, 'antidelete', 'chat');
        return m.reply(`✅*Successfully enabled antidelete chat mode*`);
    }
    
    if (mode === 'private') {
        await db.set(botNumber, 'antidelete', 'private');
        return m.reply(`✅*Successfully enabled antidelete private mode*`);
    }
    
    // Handle status
    if (mode === 'status') {
        const currentMode = await db.get(botNumber, 'antidelete', 'off');
        return m.reply(`*ANTI-DELETE STATUS*

Mode: ${currentMode}
Status: ${currentMode !== 'off' ? '✅ Enabled' : '❌ Disabled'}

📌 *Modes:*
• chat - Alerts sent to same chat
• private - Alerts sent to bot owner's inbox`);
    }
    
    m.reply('*Invalid option! Use: on, off, chat, private, status*');
    break;
}
case 'anticall': {
    if (!isCreator) return m.reply(mess.owner);
    
    const mode = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase();
    
    // Show help if no arguments
    if (!mode) {
        const current = await db.get(botNumber, 'anticall', 'off');
        return m.reply(`*ANTICALL*\n\n` +
            `• ${prefix}anticall decline on\n` +
            `• ${prefix}anticall decline off\n` +
            `• ${prefix}anticall block on\n` +
            `• ${prefix}anticall block off\n\n` +
            `Current: ${current}`);
    }
    
    // Handle decline mode
    if (mode === 'decline') {
        if (action === 'on') {
            await db.set(botNumber, 'anticall', 'decline');
            return m.reply('✅ *Successfully enabled anticall decline mode*');
        }
        if (action === 'off') {
            await db.set(botNumber, 'anticall', 'off');
            return m.reply('❌ Anticall OFF');
        }
    }
    
    // Handle block mode
    if (mode === 'block') {
        if (action === 'on') {
            await db.set(botNumber, 'anticall', 'block');
            return m.reply('✅ *Successfully enabled anticall block mode*');
        }
        if (action === 'off') {
            await db.set(botNumber, 'anticall', 'off');
            return m.reply('Anticall OFF');
        }
    }
    
    // Invalid command
    m.reply('*Use: .anticall decline on/off or .anticall block on/off*');
    
}
break;
case "yts": {
    if (!text) return m.reply("❌ Give search text");

    const { videos } = await yts(text);
    if (!videos.length) return Reply("❌ No results");

    let msg = `🔍 *YouTube Search*\n\n`;

    videos.slice(0, 9).forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n⏱ ${v.timestamp}\n🔗 ${v.url}\n\n`;
    });

    Reply(msg);
}
break;
case "ping":
case "uptime": {
    try {
        const sender = m.sender;

        let timestamp = speed();
        let latensi = speed() - timestamp;
        let tio = await nou.os.oos();
        var tot = await nou.drive.info();

        let respon =
`╭═══⬡𝑁𝐸𝑀𝐸𝑆𝐼𝑆 𝑀𝐷 ⬡═══⬡ 
║友│⊷• 𝙿𝙻𝙰𝚃𝙵𝙾𝚁𝙼     : ${nou.os.type()}
║友│⊷• 𝚃𝙾𝚃𝙰𝙻 𝚁𝙰𝙼    : ${formatp(os.totalmem())}
║友│⊷• 𝚃𝙾𝚃𝙰𝙻 𝚂𝚃𝙾𝚁𝙰𝙶𝙴 : ${tot.totalGb} GB
║友│⊷• 𝙲𝙿𝚄 𝙲𝙾𝚁𝙴𝚂    : ${os.cpus().length}
║友│⊷• 𝚅𝙿𝚂 𝚄𝙿𝚃𝙸𝙼𝙴   : ${runtime(os.uptime())}
║友│⊷• 𝙿𝙸𝙽𝙶         : ${latensi.toFixed(4)} sec
║友│⊷• 𝙱𝙾𝚃 𝚁𝚄𝙽𝚃𝙸𝙼𝙴  : ${runtime(process.uptime())}
╰═══════════════════⬡`;

        await clutch.sendMessage(
            m.chat,
            {
                image: { url: "https://files.catbox.moe/qva4tf.jpg" },
                caption: respon,
                contextInfo: {
                    mentionedJid: [sender]
                }
            },
            { quoted: m }
        );

    } catch (e) {
        console.log(e)
        m.reply("Error")
    }
}
break;
/* ================= GROUP COMMANDS ================= */

case "link":
case "setdesc":
case "jid":
case "open":
case "opentime":
case "close":
case "closetime":
case "setgcpp":
case "antilink":
case "antitagadmin":
case "invite": {

    if (!m.isGroup) return Reply("❌ Group only");

    const metadata = await clutch.groupMetadata(m.chat);
    const groupAdmins = metadata.participants
        .filter(p => p.admin)
        .map(p => p.id);

    const isAdmin = groupAdmins.includes(m.sender);

    /* 🔗 GROUP LINK */
    if (command === "link") {
        if (!isAdmin) return Reply("❌ Admin only");
        const code = await clutch.groupInviteCode(m.chat);
        return Reply(`🔗 Group Link:\nhttps://chat.whatsapp.com/${code}`);
    }

    /* ✏️ SET DESCRIPTION */
    if (command === "setdesc") {
        if (!isAdmin) return Reply("❌ Admin only");
        if (!text) return Reply("❌ Provide description");
        await clutch.groupUpdateDescription(m.chat, text);
        return Reply("✅ Description updated");
    }

    /* 🆔 USER JID */
    if (command === "jid") {
        const jid = m.mentionedJid?.[0] || m.sender;
        return Reply(`🆔 ${jid}`);
    }

    /* 🟢 OPEN GROUP */
    if (command === "open" || command === "opentime") {
        if (!isAdmin) return Reply("❌ Admin only");
        await clutch.groupSettingUpdate(m.chat, "not_announcement");
        return Reply("✅ Group opened");
    }

    /* 🔴 CLOSE GROUP */
    if (command === "close" || command === "closetime") {
        if (!isAdmin) return Reply("❌ Admin only");
        await clutch.groupSettingUpdate(m.chat, "announcement");
        return Reply("🔒 Group closed");
    }

    /* 🖼️ SET GROUP PICTURE */
    if (command === "setgcpp") {
        if (!isAdmin) return Reply("❌ Admin only");
        if (!m.quoted || !m.quoted.image)
            return Reply("❌ Reply to an image");

        const img = await m.quoted.download();
        await clutch.updateProfilePicture(m.chat, img);
        return Reply("✅ Group picture updated");
    }

    /* 🚫 ANTI-LINK TOGGLE */
    if (command === "antilink") {
        if (!isAdmin) return Reply("❌ Admin only");
        global.antilink = global.antilink || {};
        global.antilink[m.chat] = !global.antilink[m.chat];
        return Reply(`✅ Anti-link: ${global.antilink[m.chat] ? "ON" : "OFF"}`);
    }

    /* 🚫 ANTI-TAG-ADMIN TOGGLE */
    if (command === "antitagadmin") {
        if (!isAdmin) return Reply("❌ Admin only");
        global.antitagadmin = global.antitagadmin || {};
        global.antitagadmin[m.chat] = !global.antitagadmin[m.chat];
        return Reply(
            `✅ Anti-tag-admin: ${global.antitagadmin[m.chat] ? "ON" : "OFF"}`
        );
    }

    /* 📩 INVITE */
    if (command === "invite") {
        if (!isAdmin) return Reply("❌ Admin only");
        const code = await clutch.groupInviteCode(m.chat);
        await clutch.sendMessage(m.chat, {
            react: { text: "📩", key: m.key }
        });
        return Reply(`📩 Invite Link:\nhttps://chat.whatsapp.com/${code}`);
    }
}
break;

/* ============ GROUP PROTECTION HANDLERS ============ */

if (m.isGroup && global.antilink?.[m.chat]) {
    if (/chat\.whatsapp\.com/i.test(m.text) && !isAdmin) {
        await clutch.sendMessage(m.chat, { delete: m.key });
    }
}

if (m.isGroup && global.antitagadmin?.[m.chat]) {
    if (m.mentionedJid?.some(j => groupAdmins.includes(j)) && !isAdmin) {
        await clutch.sendMessage(m.chat, { delete: m.key });
    }
}
case "rejectall":
 {
    try {
        await clutch.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        });

        if (!m.isGroup) {
            await clutch.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply(mess.group);
        }

        if (!m.isBotAdmin) {
            await clutch.sendMessage(m.chat, {
                react: { text: '❌', key: m.key }
            });
            return Reply(mess.admin);
        }

        const requests = await clutch.groupRequestParticipantsList(m.chat);

        if (requests.length === 0) {
            await clutch.sendMessage(m.chat, {
                react: { text: 'ℹ️', key: m.key }
            });
            return Reply("ℹ️ No pending join requests to reject.");
        }

        const jids = requests.map(u => u.jid);
        await clutch.groupRequestParticipantsUpdate(from, jids, "reject");

        await clutch.sendMessage(m.chat, {
            react: { text: '👎', key: m.key }
        });
        return Reply(`✅ Successfully rejected ${requests.length} join requests.`);
    } catch (error) {
        console.error("Reject all error:", error);
        await clutch.sendMessage(m.chat, {
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
                                m.reply("*NEMESIS MD IS ONLINE*")
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
                const botNumber = clutch.user.id.split(':')[0] + '@s.whatsapp.net';
                let Obj = botNumber
                clutch.sendMessage(Obj + "@s.whatsapp.net", { 
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