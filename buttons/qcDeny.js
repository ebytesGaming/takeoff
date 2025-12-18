const { ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    customID: 'deny',
    async execute(interaction) {
        const requiredRoleId = '1307537719081304175'; // Role required to use the button
  
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

            const updatedEmbed = EmbedBuilder.from(originalEmbed).setTitle('Quality Control Denied');

            const button = new ButtonBuilder()
                    .setCustomId('deny')
                    .setLabel('Denied')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)

            const disabledRow = new ActionRowBuilder().addComponents(button)

            if (interaction.channel.isThread()) {
                await interaction.channel.setArchived(true, 'Quality control denied.');
            }

            await interaction.update({
                embeds: [updatedEmbed],
                components: [disabledRow],
            });
        } catch (error) {
            console.error('Error updating QC denied:', error);
            await interaction.reply({ content: 'There was an issue processing the denial.', ephemeral: true });
        }
    }
};