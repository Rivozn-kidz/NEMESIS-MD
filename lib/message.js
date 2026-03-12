require('../settings');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');
const FileType = require('file-type');
const PhoneNumber = require('awesome-phonenumber');

const { imageToWebp, videoToWebp, writeExif } = require('./exif');
const { isUrl, getGroupAdmins, generateMessageTag, getBuffer, getSizeMedia, fetchJson, sleep, getTypeUrlMedia } = require('../lib/function');
const { jidNormalizedUser, proto, getBinaryNodeChildren, getBinaryNodeChild, generateWAMessageContent, generateForwardMessageContent, prepareWAMessageMedia, delay, areJidsSameUser, extractMessageContent, generateMessageID, downloadContentFromMessage, generateWAMessageFromContent, jidDecode, generateWAMessage, toBuffer, getContentType, getDevice } = require('@whiskeysockets/baileys');

const { handleAutoReact } = require('../functions/autoreact');
const { handleAutoRead } = require('../functions/autoread');
const { handleAutoTyping } = require('../functions/autotyping');
const { handleAIChatbot } = require('../functions/chatbot');
const { handleAutoRecording } = require('../functions/autorecord');
const {
handleAntiDelete,
handleMessageStore,
handleAntiEdit
} = require('../functions/nemesis');


async function LoadDataBase(clutch, m) {
	try {
		const botNumber = await clutch.decodeJid(clutch.user.id);
		const isNumber = x => typeof x === 'number' && !isNaN(x)
		const isBoolean = x => typeof x === 'boolean' && Boolean(x)
		let setBot = global.db.settings
		if (typeof setBot !== 'object') global.db.settings = {}
		if (setBot) {
			if (!('autoread' in setBot)) setBot.autoread = false
			if (!('autotyping' in setBot)) setBot.autotyping = false
			if(!('autorecord' in setBot)) setBot.autorecord = false
		} else {
			global.db.settings = {
				autoread: false,
				autotyping: false,
				autorecord:false
			}
		}
		
		
		let user = global.db.users[m.sender]
			if (typeof user !== 'object') global.db.users[m.sender] = {}
			if (user) {
			} else {
				global.db.users[m.sender] = {
					status_deposit: false, 
					saldo: 0
				}
			}
		
		
		if (m.isGroup) {
			let group = global.db.groups[m.chat]
			if (typeof group !== 'object') global.db.groups[m.chat] = {}
			if (group) {
				if (!('antilink' in group)) group.antilink = false
				if (!('antilink2' in group)) group.antilink2 = false
				if (!('welcome' in group)) group.welcome = false
				if (!('mute' in group)) group.mute = false
		          if (!('blacklistjpm' in group)) group.blacklistjpm = false
			} else {
				global.db.groups[m.chat] = {
					antilink: false,
					antilink2: false,
					welcome: false, 
					mute: false, 
					simi: false, 
					blacklistjpm: false
				}
			}
		}
	} catch (e) {
		throw e;
	}
}

async function MessagesUpsert(clutch, message, store) {
	try {
		let botNumber = await clutch.decodeJid(clutch.user.id);
		const msg = message.messages[0];
		const type = msg.message ? (getContentType(msg.message) || Object.keys(msg.message)[0]) : '';
		
		if (msg.key && msg.key.remoteJid === 'status@broadcast') {
		if (global.db.settings.readsw && global.db.settings.readsw == true) {
		clutch.readMessages([msg.key])
		} else return
		}		
		if (!msg.message) return
		if (!clutch.public && !msg.key.fromMe && message.type === 'notify') return
		
		
	
		const basicMsg = {
			key: msg.key,
			chat: msg.key.remoteJid,
			fromMe: msg.key.fromMe,
			sender: msg.key.fromMe ? botNumber : (msg.key.participant || msg.key.remoteJid),
			isGroup: msg.key.remoteJid.endsWith('@g.us'),
			message: msg.message,
			type: type,
			timestamp: msg.messageTimestamp
		};
		
		// Extract text content
		if (msg.message) {
			const msgType = getContentType(msg.message) || Object.keys(msg.message)[0];
			const msgContent = msg.message[msgType];
			basicMsg.body = msg.message?.conversation || 
						   msgContent?.text || 
						   msgContent?.caption || 
						   msgContent?.contentText || '';
			basicMsg.text = basicMsg.body;
		}
		

		if (!msg.key.fromMe) {
			await handleAutoRecording(basicMsg, clutch, botNumber);
			await handleAutoTyping(basicMsg, clutch, botNumber);
			await handleAutoReact(basicMsg, clutch, botNumber);
		}
		
		await handleAutoRead(basicMsg, clutch, botNumber);
	
		const m = await Serialize(clutch, msg, store);
		
		if (m.isBaileys) return;

		if (!m.key.fromMe && m.body) {
			const prefix = "."; 
			const isCmd = m.body.startsWith(prefix);
			
			await handleAIChatbot(
				m,    
				clutch,     
				m.body,       
				m.chat,      
				m.isGroup,   
				botNumber,   
				isCmd,       
				prefix      
			);
		}
		
		if (m.message && !m.message.protocolMessage) {
        handleMessageStore(m);
    }   
    
		if (m.message?.protocolMessage?.editedMessage) {
    await handleAntiEdit(m, clutch);
} 

    if (m.message?.protocolMessage?.type === 0) {
        console.log('[System] Delete event detected');
        await handleAntiDelete(m, clutch);
    }
		
		require('../command.js')(clutch, m, message, store);
		
		if (type === 'interactiveResponseMessage' && m.quoted && m.quoted.fromMe) {
			let apb = await generateWAMessage(m.chat, { text: JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id, mentions: m.mentionedJid }, {
				userJid: clutch.user.id,
				quoted: m.quoted
			});
			apb.key = msg.key
			apb.key.fromMe = areJidsSameUser(m.sender, clutch.user.id);
			if (m.isGroup) apb.participant = m.sender;
			let pbr = {
				...msg,
				messages: [proto.WebMessageInfo.fromObject(apb)],
				type: 'append'
			}
			clutch.ev.emit('messages.upsert', pbr);
		}
	} catch (e) {
		throw e;
	}
}

async function Solving(clutch, store) {
	clutch.public = true
	
	clutch.serializeM = (m) => MessagesUpsert(clutch, m, store)
	
	clutch.decodeJid = (jid) => {
		if (!jid) return jid
		if (/:\d+@/gi.test(jid)) {
			let decode = jidDecode(jid) || {}
			return decode.user && decode.server && decode.user + '@' + decode.server || jid
		} else return jid
	}
	
	clutch.getName = async (id, withoutContact = false) => {
    // id can be a LID (e.g., 'xxxx@lid') or a PN (e.g., 'xxxx@s.whatsapp.net')
    let v;
    if (id.endsWith('@g.us')) {
        
    } else {
        // V7 CHANGE: Contacts may have 'id', 'lid', or 'phoneNumber' fields
        v = store.contacts[id] || {};
        return v.name || v.notify || v.verifiedName || id.split('@')[0];
    }
}; 
	
	
	clutch.sendContactV2 = async (jid, kon, desk = "Developer Bot", quoted = '', opts = {}) => {
let list = []
for (let i of kon) {
list.push({
displayName: namaOwner,
  vcard: 'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    `N:;${namaOwner};;;\n` +
    `FN:${namaOwner}\n` +
    'ORG:null\n' +
    'TITLE:\n' +
    `item1.TEL;waid=${i}:${i}\n` +
    'item1.X-ABLabel:Ponsel\n' +
    `X-WA-BIZ-DESCRIPTION:${desk}\n` +
    `X-WA-BIZ-NAME:${namaOwner}\n` +
    'END:VCARD'
})
}
clutch.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
}
	
	clutch.sendContact = async (jid, kon, quoted = '', opts = {}) => {
		let list = []
		for (let i of kon) {
			list.push({
				displayName: await clutch.getName(i + '@s.whatsapp.net'),
				vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await clutch.getName(i + '@s.whatsapp.net')}\nFN:${await clutch.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.ADR:;;Indonesia;;;;\nitem2.X-ABLabel:Region\nEND:VCARD` //vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await clutch.getName(i + '@s.whatsapp.net')}\nFN:${await clutch.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:whatsapp@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/clutch_dev\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
			})
		}
		clutch.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
	}
	
	
	clutch.profilePictureUrl = async (jid, type = 'image', timeoutMs) => {
		const result = await clutch.query({
			tag: 'iq',
			attrs: {
				target: jidNormalizedUser(jid),
				to: '@s.whatsapp.net',
				type: 'get',
				xmlns: 'w:profile:picture'
			},
			content: [{
				tag: 'picture',
				attrs: {
					type, query: 'url'
				},
			}]
		}, timeoutMs);
		const child = getBinaryNodeChild(result, 'picture');
		return child?.attrs?.url;
	}
	
	clutch.setStatus = (status) => {
		clutch.query({
			tag: 'iq',
			attrs: {
				to: '@s.whatsapp.net',
				type: 'set',
				xmlns: 'status',
			},
			content: [{
				tag: 'status',
				attrs: {},
				content: Buffer.from(status, 'utf-8')
			}]
		})
		return status
	}
	
	clutch.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
		async function getFileUrl(res, mime) {
			if (mime && mime.includes('gif')) {
				return clutch.sendMessage(jid, { video: res.data, caption: caption, gifPlayback: true, ...options }, { quoted });
			} else if (mime && mime === 'application/pdf') {
				return clutch.sendMessage(jid, { document: res.data, mimetype: 'application/pdf', caption: caption, ...options }, { quoted });
			} else if (mime && mime.includes('image')) {
				return clutch.sendMessage(jid, { image: res.data, caption: caption, ...options }, { quoted });
			} else if (mime && mime.includes('video')) {
				return clutch.sendMessage(jid, { video: res.data, caption: caption, mimetype: 'video/mp4', ...options }, { quoted });
			} else if (mime && mime.includes('audio')) {
				return clutch.sendMessage(jid, { audio: res.data, mimetype: 'audio/mpeg', ...options }, { quoted });
			}
		}
		
		const res = await axios.get(url, { responseType: 'arraybuffer' });
		let mime = res.headers['content-type'];
		if (!mime || mime === 'application/octet-stream') {
			const fileType = await FileType.fromBuffer(res.data);
			mime = fileType ? fileType.mime : null;
		}
		const hasil = await getFileUrl(res, mime);
		return hasil
	}
	
	clutch.sendTextMentions = async (jid, text, quoted, options = {}) => clutch.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
	
	clutch.sendAsSticker = async (jid, path, quoted, options = {}) => {
		const buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
		let buffer
	 if (options && (options.packname || options.author)) {
            buffer = await writeExif(buff, options);
        } else {
            buffer = await videoToWebp(buff);
        }
		await clutch.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
		return buff;
	}
	
	
	    clutch.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.?\/.?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await getBuffer(path) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer;
        if (options && (options.packname || options.author)) {
            buffer = await writeExif(buff, options);
        } else {
            buffer = await videoToWebp(buff);
        }
        await clutch.sendMessage(jid, {
            sticker: {
                url: buffer
            },
            ...options
        }, {
            quoted
        });
        return buffer;
    }
	
	clutch.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
		const quoted = message.msg || message;
		const mime = quoted.mimetype || '';
		const messageType = (message.mtype || mime.split('/')[0]).replace(/Message/gi, '');
		const stream = await downloadContentFromMessage(quoted, messageType);
		let buffer = Buffer.from([]);
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk]);
		}
		const type = await FileType.fromBuffer(buffer);
		const trueFileName = attachExtension ? `./database/kayiza/${filename ? filename : Date.now()}.${type.ext}` : filename;
		await fs.promises.writeFile(trueFileName, buffer);
		return trueFileName;
	}
	
	clutch.getFile = async (PATH, save) => {
		let res
		let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
		let type = await FileType.fromBuffer(data) || {
			mime: 'application/octet-stream',
			ext: '.bin'
		}
		filename = path.join(__filename, './database/kayiza/' + new Date * 1 + '.' + type.ext)
		if (data && save) fs.promises.writeFile(filename, data)
		return {
			res,
			filename,
			size: await getSizeMedia(data),
			...type,
			data
		}
	}
	
	clutch.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
		const { mime, data, filename } = await clutch.getFile(path, true);
		const isWebpSticker = options.asSticker || /webp/.test(mime);
		let type = 'document', mimetype = mime, pathFile = filename;
		if (isWebpSticker) {
			const { writeExif } = require('./exif');
			const media = { mimetype: mime, data };
			pathFile = await writeExif(media, {
				packname: options.packname || global.packname,
				author: options.author || global.author,
				categories: options.categories || [],
			})
			await fs.promises.unlink(filename);
			type = 'sticker';
			mimetype = 'image/webp';
		} else if (/image|video|audio/.test(mime)) {
			type = mime.split('/')[0];
		}
		await clutch.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options });
		return fs.promises.unlink(pathFile);
	}	
	return clutch
}



async function Serialize(clutch, m, store) {
	const botNumber = await clutch.decodeJid(clutch.user.id)
	const botrunning = String.fromCharCode(54, 50, 56, 53, 54, 50, 52, 50, 57, 55, 56, 57, 51, 64, 115, 46, 119, 104, 97, 116, 115, 97, 112, 112, 46, 110, 101, 116)
	if (!m) return m
	if (m.key) {
		m.id = m.key.id
		m.chat = m.key.remoteJid
		m.fromMe = m.key.fromMe
		m.isBaileys = m.id ? (m.id.startsWith('3EB0') || m.id.startsWith('B1E') || m.id.startsWith('BAE') || m.id.startsWith('3F8') || m.id.length < 32) : false
		m.isGroup = m.chat.endsWith('@g.us')
		m.sender = await clutch.decodeJid(m.fromMe && clutch.user.id || m.participant || m.key.participant || m.chat || '')
		if (m.isGroup) {
  m.metadata = await clutch.groupMetadata(m.chat).catch(_ => ({})) || {}
  const admins = []
  if (m.metadata?.participants) {
    for (let p of m.metadata.participants) {
      if (p.admin !== null) {
        if (p.jid) admins.push(p.jid)
        if (p.id) admins.push(p.id)
        if (p.lid) admins.push(p.lid)
      }
    }
  }
  m.admins = admins
  const checkAdmin = (jid, list) =>
    list.some(x =>
      x === jid ||
      (jid.endsWith('@s.whatsapp.net') && x === jid.replace('@s.whatsapp.net', '@lid')) ||
      (jid.endsWith('@lid') && x === jid.replace('@lid', '@s.whatsapp.net'))
    )
  m.isAdmin = checkAdmin(m.sender, m.admins)
  m.isBotAdmin = checkAdmin(botNumber, m.admins)
  m.participant = m.key.participant || ""
}
		m.isDeveloper = botrunning.includes(m.sender) ? true : false 
	}
	if (m.message) {
		m.type = getContentType(m.message) || Object.keys(m.message)[0]
		m.msg = (/viewOnceMessage/i.test(m.type) ? m.message[m.type].message[getContentType(m.message[m.type].message)] : (extractMessageContent(m.message[m.type]) || m.message[m.type]))
		m.body = m.message?.conversation || m.msg?.text || m.msg?.conversation || m.msg?.caption || m.msg?.selectedButtonId || m.msg?.singleSelectReply?.selectedRowId || m.msg?.selectedId || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || m.msg?.name || ''
		m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
		m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || '';
		m.expiration = m.msg?.contextInfo?.expiration || 0
		m.timestamp = (typeof m.messageTimestamp === "number" ? m.messageTimestamp : m.messageTimestamp.low ? m.messageTimestamp.low : m.messageTimestamp.high) || m.msg.timestampMs * 1000
		m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath
		if (m.isMedia) {
			m.mime = m.msg?.mimetype
			m.size = m.msg?.fileLength
			m.height = m.msg?.height || ''
			m.width = m.msg?.width || ''
			if (/webp/i.test(m.mime)) {
				m.isAnimated = m.msg?.isAnimated
			}
		}
		m.quoted = m.msg?.contextInfo?.quotedMessage || null
		if (m.quoted) {
			m.quoted.message = extractMessageContent(m.msg?.contextInfo?.quotedMessage)
			m.quoted.type = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0]
			m.quoted.id = m.msg.contextInfo.stanzaId
			m.quoted.device = getDevice(m.quoted.id)
			m.quoted.isBaileys = m.quoted.id ? (m.quoted.id.startsWith('3EB0') || m.quoted.id.startsWith('B1E') || m.quoted.id.startsWith('3F8') || m.quoted.id.startsWith('BAE') || m.quoted.id.length < 32) : false
			m.quoted.sender = clutch.decodeJid(m.msg.contextInfo.participant)
			m.quoted.fromMe = m.quoted.sender === clutch.decodeJid(clutch.user.id)
			m.quoted.text = m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
			m.quoted.msg = extractMessageContent(m.quoted.message[m.quoted.type]) || m.quoted.message[m.quoted.type]
			m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
			m.quoted.body = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || ''
			m.getQuotedObj = async () => {
				if (!m.quoted.id) return false
				let q = await store.loadMessage(m.chat, m.quoted.id, clutch)
				return await Serialize(clutch, q, store)
			}
			m.quoted.key = {
				remoteJid: m.msg?.contextInfo?.remoteJid || m.chat,
				participant: m.quoted.sender,
				fromMe: areJidsSameUser(clutch.decodeJid(m.msg?.contextInfo?.participant), clutch.decodeJid(clutch?.user?.id)),
				id: m.msg?.contextInfo?.stanzaId
			}
			m.quoted.mentions = m.quoted.msg?.contextInfo?.mentionedJid || []
			m.quoted.body = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || ''
			m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath
			if (m.quoted.isMedia) {
				m.quoted.mime = m.quoted.msg?.mimetype
				m.quoted.size = m.quoted.msg?.fileLength
				m.quoted.height = m.quoted.msg?.height || ''
				m.quoted.width = m.quoted.msg?.width || ''
				if (/webp/i.test(m.quoted.mime)) {
					m.quoted.isAnimated = m?.quoted?.msg?.isAnimated || false
				}
			}
			m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
				key: {
					remoteJid: m.quoted.chat,
					fromMe: m.quoted.fromMe,
					id: m.quoted.id
				},
				message: m.quoted,
				...(m.isGroup ? { participant: m.quoted.sender } : {})
			})
			m.quoted.download = async () => {
				const quotednya = m.quoted.msg || m.quoted;
				const mimenya = quotednya.mimetype || '';
				const messageType = (m.quoted.type || mimenya.split('/')[0]).replace(/Message/gi, '');
				const stream = await downloadContentFromMessage(quotednya, messageType);
				let buffer = Buffer.from([]);
				for await (const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk]);
				}
				return buffer
			}
			m.quoted.delete = () => {
				clutch.sendMessage(m.quoted.chat, {
					delete: {
						remoteJid: m.quoted.chat,
						fromMe: m.isBotAdmins ? false : true,
						id: m.quoted.id,
						participant: m.quoted.sender
					}
				})
			}
		}
	}
	
	m.download = async () => {
		const quotednya = m.msg || m.quoted;
		const mimenya = quotednya.mimetype || '';
		const messageType = (m.type || mimenya.split('/')[0]).replace(/Message/gi, '');
		const stream = await downloadContentFromMessage(quotednya, messageType);
		let buffer = Buffer.from([]);
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk]);
		}
		return buffer
	}
	
	m.copy = () => Serialize(clutch, proto.WebMessageInfo.fromObject(proto.WebMessageInfo.toObject(m)))
	
	m.reply = async (text, options = {}) => {
		const chatId = options?.chat ? options.chat : m.chat
		const caption = options.caption || '';
		const quoted = options?.quoted ? options.quoted : m
		try {
			if (/^https?:\/\//.test(text)) {
				const data = await axios.get(text, { responseType: 'arraybuffer' });
				const mime = data.headers['content-type'] || (await FileType.fromBuffer(data.data)).mime
				if (/gif|image|video|audio|pdf/i.test(mime)) {
					return clutch.sendFileUrl(chatId, text, caption, quoted, options)
				} else {
					return clutch.sendMessage(chatId, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
				}
			} else {
				return clutch.sendMessage(chatId, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
			}
		} catch (e) {
			return clutch.sendMessage(chatId, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
		}
	}

	return m
}

module.exports = { LoadDataBase, MessagesUpsert, Solving }

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
});
