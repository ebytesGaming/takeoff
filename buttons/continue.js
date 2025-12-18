const { getRobloxAccount } = require('../utils/BloxlinkApi.js');

module.exports = {
    customID: 'continue_account',
    async execute(interaction) {
        try {
            // Acknowledge the interaction early to prevent "Unknown interaction" during long async ops
            await interaction.deferReply({ ephemeral: true }).catch(() => {});

            const guild = interaction.guild;
            const member = interaction.member;

            // Fetch Roblox account info
            const robloxAccount = await getRobloxAccount(guild.id, member.id);

            if (!robloxAccount) {
                return interaction.editReply({
                    content: '<:TAKEOFFStudios:1419840091651575910> Unable to fetch your Roblox account. Please try again.'
                });
            }

            // Remove old role
            await member.roles.remove('1431438701703069837').catch(() => {});

            // Add new role
            await member.roles.add('1431249698622279712').catch(() => {});

            // Update nickname to Roblox username
            await member.setNickname(robloxAccount.username).catch(() => {});

            // Reply with confirmation (no embed)
            await interaction.editReply({
                content: `<:TAKEOFFStudios:1419840091651575910> You have been successfully verified as **${robloxAccount.username}**!`
            });

        } catch (error) {
            console.error('Error in continue_account handler:', error);
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({ content: '<:TAKEOFFStudios:1419840091651575910> An error occurred while processing your verification.', ephemeral: true });
                } else {
                    await interaction.reply({ content: '<:TAKEOFFStudios:1419840091651575910> An error occurred while processing your verification.', ephemeral: true });
                }
            } catch (e) {
                // ignore follow-up errors
            }
        }
    }
};
