const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Array of Category IDs where the -rename command is allowed to run.
const ALLOWED_TICKET_CATEGORIES = [
    '1434351268935110706', 
    '1434351276967333961', 
    '1434351278753972235', 
    '1434351280427630622', 
    '1434351281698246849', 
    '1434351282914721912', 
    '1434351270046470144'
];

module.exports = {
    name: 'rename',
    description: 'Renames the current ticket channel. Requires Manage Channels permission.',

    async execute(message, args) {
        const channel = message.channel;
        const rawNewName = args.join(' ');

        // 1. Permission Check: Ensure the user has the 'ManageChannels' permission.
        // This replaces the .setDefaultMemberPermissions check from the Slash Command.
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply({
                content: '<:Wrong:1409419053281316864> You need the **Manage Channels** permission to use the `-rename` command.',
                allowedMentions: { repliedUser: false }
            });
        }
        
        // 2. Input and Category Validation
        if (!rawNewName) {
            return message.reply({
                content: 'Please provide the new name for the ticket channel. Example: `-rename support-issue-resolved`',
                allowedMentions: { repliedUser: false }
            });
        }

        // 3. Category Check: Ensure the channel is in one of the designated ticket categories.
        if (!channel.parent || !ALLOWED_TICKET_CATEGORIES.includes(channel.parentId)) {
            return message.reply({ 
                content: 'This command can only be used in a channel that is inside one of the designated ticket categories.', 
                allowedMentions: { repliedUser: false }
            });
        }
        
        // 4. Sanitize the new name
        // Sanitizing the name to ensure it's lowercase and hyphenated, which is standard for Discord channels
        const sanitizedNewName = rawNewName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        try {
            // Delete the original command message before renaming to prevent confusion
            await message.delete().catch(console.error);

            // 5. Rename the channel
            await channel.setName(sanitizedNewName, `Ticket renamed by ${message.author.tag}`);

            // 6. Create and send the public notification embed
            const renameEmbed = new EmbedBuilder()
                .setTitle(`<:Ticket:1409269775300825138> Ticket Renamed`)
                .setColor('#176EFE')
                .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=690836ed&is=6906e56d&hm=73ea1cdb4faf2ebd0b51bce81aa46f1e2265fa7d14fdacec724f229eb87c75dd&=&format=webp')
                .setDescription(`This channel has been renamed to **#${sanitizedNewName}**.`);

            await channel.send({ embeds: [renameEmbed] });

        } catch (error) {
            console.error('Error renaming ticket channel:', error);
            // Send error to the channel if deletion failed or the user needs to know
            message.channel.send(`An error occurred while trying to rename the channel: \`${error.message}\``).catch(console.error);
        }
    }
};