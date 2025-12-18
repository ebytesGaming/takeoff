const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// --- CONFIGURATION ---
// The custom role ID used to check if the user is authorized to run moderation commands.
const REQUIRED_ROLE_ID = '1413237680262877214'; 

// --- /kick COMMAND ---
const kickCommand = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Removes a user from the server (they can rejoin).')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to kick.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for kicking the user.')
                .setRequired(false)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        // 1. Staff Role Check (Custom role ID)
        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        
        // 2. Discord Permission Check (Requires actual 'Kick Members' permission)
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'You lack the necessary Discord permissions (`Kick Members`) to use this command.', ephemeral: true });
        }

        // 3. Hierarchy Check
        if (targetMember && targetMember.manageable === false) {
             return interaction.reply({ content: `I cannot kick ${targetUser.tag} because they have a higher or equal role to me.`, ephemeral: true });
        }
        
        try {
            // Attempt to DM the user before kicking
            await targetUser.send(`**${targetUser.tag}** has been kicked from ${interaction.guild.name} for ${reason}`);
        } catch (error) {
            console.log(`Could not DM user ${targetUser.tag} about their kick.`);
        }

        try {
            // Execute the kick
            await targetMember.kick(reason);
            
            // --- TEXT RESPONSE (No Embeds/Emojis) ---
            await interaction.reply({ 
                content: `${targetUser.tag} has been kicked by ${interaction.user.tag}` 
            });

        } catch (error) {
            console.error('Error kicking member:', error);
            await interaction.reply({ content: `I am unable to run this command at this time. Please try again later.`, ephemeral: true });
        }
    },
};

// Export only the single kick command
module.exports = kickCommand;
