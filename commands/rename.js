const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require('discord.js');

// Array of Category IDs where the /rename command is allowed to run.
const ALLOWED_TICKET_CATEGORIES = [
    '1434351268935110706', 
    '1434351276967333961', 
    '1434351278753972235', 
    '1434351280427630622', 
    '1434351281698246849', 
    '1434351282914721912', 
    '1434351270046470144'
];

// --- Slash Command Definition ---
module.exports = {
    // Command metadata
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Renames the current ticket channel.')
        .addStringOption(option =>
            option.setName('new_name')
                .setDescription('The new name for the ticket channel (e.g., support-issue-resolved)')
                .setRequired(true))
        // Restrict this command to users who can manage channels (typically staff/mods)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels), 

    // --- Command Execution Logic ---
    async execute(interaction) {
        // Defer the reply as channel operations can take a moment
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.channel;

        // 1. Category Check: Ensure the channel is in one of the designated ticket categories.
        if (!channel.parent || !ALLOWED_TICKET_CATEGORIES.includes(channel.parentId)) {
            return interaction.editReply({ 
                content: 'This command can only be used in a channel that is inside one of the designated ticket categories.', 
                ephemeral: true 
            });
        }

        // 2. Get the new name provided by the user and sanitize it
        const rawNewName = interaction.options.getString('new_name');
        // Sanitizing the name to ensure it's lowercase and hyphenated, which is standard for Discord channels
        const sanitizedNewName = rawNewName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        try {
            // 3. Rename the channel
            await channel.setName(sanitizedNewName, `Ticket renamed by ${interaction.user.tag}`);

            // 4. Create the notification embed
            const renameEmbed = new EmbedBuilder()
                .setTitle(`<:Ticket:1409269775300825138> Ticket Renamed`)
                .setColor('#176EFE')
                .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=690836ed&is=6906e56d&hm=73ea1cdb4faf2ebd0b51bce81aa46f1e2265fa7d14fdacec724f229eb87c75dd&=&format=webp')
                .setDescription(`This channel has been renamed to **#${sanitizedNewName}**.`);

            // 5. Send the public notification to the channel
            await channel.send({ embeds: [renameEmbed] });

            // 6. Send success response to the staff member
            await interaction.editReply({ 
                content: `Successfully renamed this ticket to **#${sanitizedNewName}**.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error renaming ticket channel:', error);
            await interaction.editReply({ 
                content: `An error occurred while trying to rename the channel. Please check the console for details.`, 
                ephemeral: true 
            });
        }
    }
};
