const { PermissionsBitField } = require('discord.js');

module.exports = {
    // Command name is 'say' so the trigger will be '-say' (or whatever your bot's prefix is)
    name: 'say',
    description: 'Makes the bot send a message.',
    
    // Note: This is designed for a traditional prefix command handler (e.g., bot.on('messageCreate', ...))
    async execute(message, args) {
        
        // 1. Permission Check: Ensure the user has Administrator permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                content: "<:Wrong:1409419053281316864> You need the **Administrator** permission to use the `-say` command.",
                // Delete the reply after 10 seconds to keep the chat clean
                allowedMentions: { repliedUser: false } 
            }).then(msg => {
                setTimeout(() => msg.delete().catch(console.error), 10000);
            });
        }
        
        // 2. Content Check: Ensure a message was provided
        const content = args.join(' ');
        if (!content) {
            return message.reply({
                content: "Please provide a message for me to say. Example: `-say Hello everyone!`",
                allowedMentions: { repliedUser: false } 
            });
        }

        try {
            // 3. Delete the original command message
            await message.delete();
            
            // 4. Send the desired content
            await message.channel.send(content);

        } catch (error) {
            console.error('Error executing -say command:', error);
            message.channel.send(`An error occurred while trying to say that message.`).catch(console.error);
        }
    },
};