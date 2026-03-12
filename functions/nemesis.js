/*Kelvin Tech*/


const fs = require('fs'); 
const FormData = require('form-data');
const cheerio = require('cheerio')
const acrcloud = require ('acrcloud');
const axios = require('axios');
const timezones = global.timezones || "Africa/Kampala";
const moment = require("moment-timezone");
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);  

const db = require('../lib/databaseManager');

const acr = new acrcloud({
    host: 'identify-eu-west-1.acrcloud.com',
    access_key: '882a7ef12dc0dc408f70a2f3f4724340',
    access_secret: 'qVvKAxknV7bUdtxjXS22b5ssvWYxpnVndhy2isXP'
});

async function ephoto(url, texk) {
      let form = new FormData();
      let gT = await axios.get(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        },
      });
      let $ = cheerio.load(gT.data);
      let text = texk;
      let token = $("input[name=token]").val();
      let build_server = $("input[name=build_server]").val();
      let build_server_id = $("input[name=build_server_id]").val();
      form.append("text[]", text);
      form.append("token", token);
      form.append("build_server", build_server);
      form.append("build_server_id", build_server_id);
      let res = await axios({
        url: url,
        method: "POST",
        data: form,
        headers: {
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
          cookie: gT.headers["set-cookie"]?.join("; "),
          "Content-Type": "multipart/form-data",
        },
      });
      let $$ = cheerio.load(res.data);
      let json = JSON.parse($$("input[name=form_value_input]").val());
      json["text[]"] = json.text;
      delete json.text;
      let { data } = await axios.post(
        "https://en.ephoto360.com/effect/create-image",
        new URLSearchParams(json),
        {
          headers: {
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
            cookie: gT.headers["set-cookie"].join("; "),
          },
        }
      );
      return build_server + data.image;
 }
 
function extractMessageText(message) {
    if (!message) return "";
    
    if (message.conversation) {
        return message.conversation;
    } else if (message.extendedTextMessage?.text) {
        return message.extendedTextMessage.text;
    } else if (message.imageMessage?.caption) {
        return message.imageMessage.caption;
    } else if (message.videoMessage?.caption) {
        return message.videoMessage.caption;
    } else if (message.documentMessage?.caption) {
        return message.documentMessage.caption;
    } else if (message.protocolMessage?.editedMessage) {
        // Handle edited messages recursively
        return extractMessageText(message.protocolMessage.editedMessage);
    }
    return "";
}



// message store for antidelete 
function loadStoredMessages() {
    try {
        if (fs.existsSync('./start/lib/database/deleted_messages.json')) {
            const data = fs.readFileSync('./lib/database/deleted_messages.json', 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading stored messages:', error);
    }
    return {};
}

function saveStoredMessages(messages) {
    try {
        const dir = './lib/database';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync('./lib/database/deleted_messages.json', JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error('Error saving stored messages:', error);
    }
}

function storeMessage(chatId, messageId, messageData) {
    try {
        const storedMessages = loadStoredMessages();
        
        if (!storedMessages[chatId]) {
            storedMessages[chatId] = {};
        }
        
        // Extract text content and detect media type
        let textContent = "";
        let mediaType = "text";
        const msgType = Object.keys(messageData.message || {})[0];
        
        if (msgType === 'conversation') {
            textContent = messageData.message.conversation;
        } else if (msgType === 'extendedTextMessage') {
            textContent = messageData.message.extendedTextMessage?.text || "";
        } else if (msgType === 'imageMessage') {
            textContent = messageData.message.imageMessage?.caption || "";
            mediaType = "image";
        } else if (msgType === 'videoMessage') {
            textContent = messageData.message.videoMessage?.caption || "";
            mediaType = "video";
        } else if (msgType === 'audioMessage') {
            textContent = "";
            mediaType = "audio";
        } else if (msgType === 'stickerMessage') {
            textContent = "";
            mediaType = "sticker";
        } else {
            textContent = "";
        }
        
        storedMessages[chatId][messageId] = {
            key: messageData.key,
            message: messageData.message,
            messageTimestamp: messageData.messageTimestamp,
            pushName: messageData.pushName,
            text: textContent,
            mediaType: mediaType,
            storedAt: Date.now(),
            remoteJid: messageData.key?.remoteJid || chatId
        };
        
        // Limit storage per chat to prevent memory issues
        const chatMessages = Object.keys(storedMessages[chatId]);
        if (chatMessages.length > 100) {
            const oldestMessageId = chatMessages[0];
            delete storedMessages[chatId][oldestMessageId];
        }
        
        saveStoredMessages(storedMessages);
        
    } catch (error) {
        console.error("Error storing message:", error);
    }
}

// Store messages function for export
function handleMessageStore(m) {
    try {
        if (!m.message || m.key.fromMe) return; // Don't store bot's own messages
        
        const chatId = m.chat;
        const messageId = m.key.id;
        
        // Store all messages
        storeMessage(chatId, messageId, {
            key: m.key,
            message: m.message,
            messageTimestamp: m.messageTimestamp,
            pushName: m.pushName
        });
        
    } catch (error) {
        console.error("Error storing message:", error);
    }
}

async function handleAntiEdit(m, clutch) {
    try {
        // Get bot number
        const botNumber = await clutch.decodeJid(clutch.user.id);
        
        const antieditSetting = await db.get(botNumber, 'antiedit', 'off');
        
        // Check if anti-edit is enabled and we have an edited message
        if (!antieditSetting || antieditSetting === 'off' || !m.message?.protocolMessage?.editedMessage) {
            return;
        }

        let messageId = m.message.protocolMessage.key.id;
        let chatId = m.chat;
        let editedBy = m.sender;

        let storedMessages = loadStoredMessages();
        let originalMsg = storedMessages[chatId]?.[messageId];

        if (!originalMsg) {
            console.log("⚠️ Original message not found in store.json.");
            return;
        }

        let sender = originalMsg.key?.participant || originalMsg.key?.remoteJid;
        
        // Get chat name
        let chatName;
        if (chatId.endsWith("@g.us")) {
            try {
                const groupInfo = await clutch.groupMetadata(chatId);
                chatName = groupInfo.subject || "Group Chat";
            } catch {
                chatName = "Group Chat";
            }
        } else {
            chatName = originalMsg.pushName || "Private Chat";
        }

        let xtipes = moment(originalMsg.messageTimestamp * 1000).tz(`${timezones}`).locale('en').format('HH:mm z');
        let xdptes = moment(originalMsg.messageTimestamp * 1000).tz(`${timezones}`).format("DD/MM/YYYY");

        // Get original text
        let originalText = originalMsg.message?.conversation || 
                          originalMsg.message?.extendedTextMessage?.text ||
                          originalMsg.text ||
                          "[Text not available]";

        // Get edited text
        let editedText = m.message.protocolMessage?.editedMessage?.conversation || 
                        m.message.protocolMessage?.editedMessage?.extendedTextMessage?.text ||
                        "[Edit content not available]";

        let replyText = 
        `
╭──⧼♛ *𝙴𝙳𝙸𝚃𝙴𝙳 𝙼𝙴𝚂𝚂𝙰𝙶𝙴!* ♛⧽──≽
│┃ ♛• 𝙲𝙷𝙰𝚃: ${chatName}
│┃ ♛• 𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]} 
│┃ ♛• 𝚃𝙸𝙼𝙴: ${xtipes}
│┃ ♛• 𝙳𝙰𝚃𝙴: ${xdptes}
│┃ ♛• 𝙴𝙳𝙸𝚃𝙴𝙳 𝙱𝚈: @${editedBy.split('@')[0]}
│┃ ♛• 𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻: ${originalText}
│┃ ♛• 𝙴𝙳𝙸𝚃𝙴𝙳 𝚃𝙾: ${editedText}
╰────────────────≽`;

        let quotedMessage = {
            key: {
                remoteJid: chatId,
                fromMe: sender === clutch.user.id,
                id: messageId,
                participant: sender
            },
            message: {
                conversation: originalText 
            }
        };

        let targetChat;
        if (antieditSetting === 'private') {
            targetChat = clutch.user.id; 
            console.log(`📤 Anti-edit: Sending to bot owner's inbox`);
        } else if (antieditSetting === 'chat') {
            targetChat = chatId; 
            console.log(`📤 Anti-edit: Sending to same chat`);
        } else {
            console.log("❌ Invalid anti-edit mode");
            return;
        }

        await clutch.sendMessage(
            targetChat, 
            { text: replyText, mentions: [sender, editedBy] }, 
            { quoted: quotedMessage }
        );

    } catch (err) {
        console.error("❌ Error processing edited message:", err);
    }
}

async function handleAntiDelete(m, clutch) {
    try {
        const botNumber = await clutch.decodeJid(clutch.user.id);
        
        const antideleteSetting = await db.get(botNumber, 'antidelete', 'off');
        
        // Check if anti-delete is enabled
        if (!antideleteSetting || antideleteSetting === 'off') {
            return;
        }

        let messageId = m.message.protocolMessage.key.id;
        let chatId = m.chat;
        let deletedBy = m.sender;
        const isGroup = chatId.endsWith('@g.us');

        let storedMessages = loadStoredMessages();
        let deletedMsg = storedMessages[chatId]?.[messageId];

        if (!deletedMsg) {
            return;
        }

        let sender = deletedMsg.key.participant || deletedMsg.key.remoteJid;

        let chatName;
        if (deletedMsg.key.remoteJid === 'status@broadcast') {
            chatName = "Status Update";
        } else if (isGroup) {
            try {
                const groupInfo = await clutch.groupMetadata(chatId);
                chatName = groupInfo.subject || "Group Chat";
            } catch {
                chatName = "Group Chat";
            }
        } else {
            chatName = deletedMsg.pushName || m.pushName || "Private Chat";
        }

        let xtipes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).locale('en').format('HH:mm z');
        let xdptes = moment(deletedMsg.messageTimestamp * 1000).tz(`${timezones}`).format("DD/MM/YYYY");

        // Determine target chat based on antidelete mode
        let targetChat;
        if (antideleteSetting === 'private') {
            targetChat = clutch.user.id; 
        } else if (antideleteSetting === 'chat') {
            targetChat = chatId; 
        } else {
            return;
        }

        // Handle media messages
        if (!deletedMsg.message.conversation && !deletedMsg.message.extendedTextMessage) {
            try {
                let forwardedMsg = await clutch.sendMessage(
                    targetChat,
                    { 
                        forward: deletedMsg,
                        contextInfo: { isForwarded: false }
                    },
                    { quoted: deletedMsg }
                );
                
                let mediaInfo = `
╭──⧼♛ *𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼𝙴𝙳𝙸𝙰!* ♛⧽──≽
│┃ ♛• 𝙲𝙷𝙰𝚃: ${chatName}
│┃ ♛• 𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]} 
│┃ ♛• 𝚃𝙸𝙼𝙴: ${xtipes}
│┃ ♛• 𝙳𝙰𝚃𝙴: ${xdptes}
│┃ ♛• 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedBy.split('@')[0]}
╰─────────────────────≽`;

                await clutch.sendMessage(
                    targetChat, 
                    { text: mediaInfo, mentions: [sender, deletedBy] },
                    { quoted: forwardedMsg }
                );
                
            } catch (mediaErr) {
                console.error("Media recovery failed:", mediaErr);
                let replyText = `
╭──⧼♛ *𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼𝙴𝚂𝚂𝙰𝙶𝙴!* ♛⧽──≽
│┃ ♛• 𝙲𝙷𝙰𝚃: ${chatName}
│┃ ♛• 𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]} 
│┃ ♛• 𝚃𝙸𝙼𝙴: ${xtipes}
│┃ ♛• 𝙳𝙰𝚃𝙴: ${xdptes}
│┃ ♛• 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedBy.split('@')[0]}
│┃ ♛
│┃ ♛• 𝙼𝙴𝚂𝚂𝙰𝙶𝙴: [Unsupported media content]
╰─────────────────────≽`;

                let quotedMessage = {
                    key: {
                        remoteJid: chatId,
                        fromMe: sender === clutch.user.id,
                        id: messageId,
                        participant: sender
                    },
                    message: { conversation: "Media recovery failed" }
                };

                await clutch.sendMessage(
                    targetChat,
                    { text: replyText, mentions: [sender, deletedBy] },
                    { quoted: quotedMessage }
                );
            }
        } 
        // Handle text messages
        else {
            let text = deletedMsg.message.conversation || 
                      deletedMsg.message.extendedTextMessage?.text;

            let replyText = `
╭──⧼♛ *𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙼𝙴𝚂𝚂𝙰𝙶𝙴!* ♛⧽──≽
│┃ ♛
│┃ ♛• 𝙲𝙷𝙰𝚃: ${chatName}
│┃ ♛• 𝚂𝙴𝙽𝚃 𝙱𝚈: @${sender.split('@')[0]} 
│┃ ♛• 𝚃𝙸𝙼𝙴: ${xtipes}
│┃ ♛• 𝙳𝙰𝚃𝙴: ${xdptes}
│┃ ♛• 𝙳𝙴𝙻𝙴𝚃𝙴𝙳 𝙱𝚈: @${deletedBy.split('@')[0]}
│┃ ♛
│┃ ♛• 𝙼𝙴𝚂𝚂𝙰𝙶𝙴: ${text}
╰──────────────────────≽`;

            let quotedMessage = {
                key: {
                    remoteJid: chatId,
                    fromMe: sender === clutch.user.id,
                    id: messageId,
                    participant: sender
                },
                message: {
                    conversation: text 
                }
            };

            await clutch.sendMessage(
                targetChat,
                { text: replyText, mentions: [sender, deletedBy] },
                { quoted: quotedMessage }
            );
        }

    } catch (err) {
        console.error("❌ Error processing deleted message:", err);
    }
}
 
module.exports = { 
ephoto,
acr,
handleAntiDelete,
handleMessageStore,
handleAntiEdit
}