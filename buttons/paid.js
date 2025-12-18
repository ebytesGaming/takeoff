const { ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    customID: 'paid',
    async execute(interaction) {
        const requiredRoleId = '1413237680262877214'; // Role required to use the button
  
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
          return interaction.editReply({
            content: 'You do not have permission to use this button.',
          });
        }

        try {
            const originalEmbed = interaction.message.embeds[0];
            if (!originalEmbed) {
                return interaction.reply({ content: "Original embed not found.", ephemeral: true });
            }

            const button = new ButtonBuilder()
                    .setCustomId('paid')
                    .setLabel('Paid')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true)

            const disabledRow = new ActionRowBuilder().addComponents(button)

            await interaction.update({
                components: [disabledRow],
            });
            
        } catch (error) {
            console.error('Error updating paid:', error);
            await interaction.reply({ content: '<:Wrong:1409419053281316864> There was an issue processing the confirmation.', ephemeral: true });
        }
    }
};