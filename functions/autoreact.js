/*Kelvin Tech*/

const db = require('../lib/databaseManager'); 

async function handleAutoReact(m, clutch) {
    try {
        const botNumber = await clutch.decodeJid(clutch.user.id);
        
        const autoreact = await db.get(botNumber, 'autoreact', false);
        
        // Check if auto-react is enabled
        if (!autoreact) {
            return;
        }

        // Don't react to bot's own messages
        const sender = m.key.participant || m.key.remoteJid;
        if (sender === botNumber) return;

        // List of common emoji reactions
        const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉', '🤩', '🙏', '💯', '👀', '✨', '🥳', '😎'];
        
        // Pick a random reaction
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        
        // Send the reaction
        await clutch.sendMessage(m.key.remoteJid, {
            react: {
                text: randomReaction,
                key: m.key
            }
        });
        
    } catch (error) {
        console.error("❌ Error in auto-react:", error);
    }
}

module.exports = { handleAutoReact };