/*Kelvin Tech*/

const db = require('../lib/databaseManager');

async function handleAutoTyping(m, clutch) {
    try {
        const botNumber = await clutch.decodeJid(clutch.user.id);
        
        const autoTyping = await db.get(botNumber, 'autoTyping', false);
        
        // Check if auto-typing is enabled
        if (!autoTyping) {
            return;
        }

        // Don't respond to own messages
        if (m.key.fromMe) return;

        // For groups, check participant count to avoid spam
        if (m.isGroup) {
            try {
                const groupMetadata = await clutch.groupMetadata(m.chat);
                if (groupMetadata.participants.length > 50) {
                    return; // Skip large groups to avoid spam
                }
            } catch (error) {
                console.error("❌ Error getting group metadata:", error);
                return;
            }
        }

        // Send typing indicator
        await clutch.sendPresenceUpdate('composing', m.chat);
        
        // Stop typing after 5 seconds
        setTimeout(async () => {
            await clutch.sendPresenceUpdate('paused', m.chat);
        }, 5000);
        
    } catch (error) {
        console.error("❌ Error in auto-typing:", error);
    }
}

module.exports = { handleAutoTyping };