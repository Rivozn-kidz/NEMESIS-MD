/*Kelvin Tech*/

const db = require('../lib/databaseManager'); 

async function handleAutoRead(m, clutch) {
    try {
        const botNumber = await clutch.decodeJid(clutch.user.id);
        
        const autoread = await db.get(botNumber, 'autoread', false);
        
        // Check if auto-read is enabled
        if (!autoread) {
            return;
        }

        // Don't mark bot's own messages as read
        if (m.key.fromMe) return;

        await clutch.readMessages([m.key]);
        
    } catch (error) {
        console.error("Error in auto-read:", error);
    }
}

module.exports = { handleAutoRead };