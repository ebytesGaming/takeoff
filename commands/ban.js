const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// --- CONFIGURATION ---
// ⚠️ IMPORTANT: Replace this placeholder with the actual ID of the Discord role allowed to use this command.
const REQUIRED_ROLE_ID = '1413237680262877214'; 

// --- /ban COMMAND ---
const banCommand = {
    // Defines the command name, description, and options for Discord
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The yser to ban.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for banning the user.')
                .setRequired(false)),
    
    // The main logic that runs when the command is executed
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        // 1. Staff Role Check (Your custom role)
        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        
        // 3. Hierarchy Check (Bot cannot ban users with higher or equal roles)
        if (targetMember && targetMember.manageable === false) {
             return interaction.reply({ content: `I cannot ban ${targetUser.tag} because they have a higher or equal role to me.`, ephemeral: true });
        }

        try {
            // Attempt to send a DM to the user before they are banned
            await targetUser.send(`**${targetUser.tag}** has been banned for ${reason}`);
        } catch (error) {
            console.log(`Could not DM user ${targetUser.tag} about their ban.`);
        }

        try {
            // Execute the ban
            await interaction.guild.members.ban(targetUser.id, { reason });
            
            // --- TEXT RESPONSE (No Embeds/Emojis) ---
            await interaction.reply({ 
                content: `${targetUser.tag} has been banned by ${interaction.user.tag}.}` 
            });

        } catch (error) {
            console.error('Error banning member:', error);
            await interaction.reply({ content: `I am unable to run this command at this time, please try again later.`, ephemeral: true });
        }
    },
};

// Export only the single ban command
module.exports = banCommand;
