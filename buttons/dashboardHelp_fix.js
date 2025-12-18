const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customID: 'dashboardHelp',

  async execute(interaction) {
    try {
      const modal = new ModalBuilder()
        .setCustomId('dashboardHelpModal')
        .setTitle('Dashboard Assistance Request');

      const questionInput = new TextInputBuilder()
        .setCustomId('dashboardInquiryReason')
        .setLabel('What do you need help with?')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Describe your issue or question regarding the dashboard here.')
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(questionInput);
      modal.addComponents(row);
      await interaction.showModal(modal);
    } catch (error) {
      console.error('Error showing dashboard help modal (fixed):', error);
    }
  }
};
