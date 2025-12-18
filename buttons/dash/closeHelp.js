const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customID: 'closeHelp',

  async execute(interaction) {
    const requiredRoleId = "1364423646721998948"; // Support role ID
    const isOwner = interaction.guild && interaction.guild.ownerId === interaction.user.id;
    const isAdmin = interaction.member && interaction.member.permissions && interaction.member.permissions.has && interaction.member.permissions.has('Administrator');
    if (!interaction.member || (!interaction.member.roles.cache.has(requiredRoleId) && !isOwner && !isAdmin)) {
        return interaction.reply({
          content: `You don't have permission to close this ticket.`,
          ephemeral: true
        });
      }

    const modal = new ModalBuilder()
      .setCustomId('closeModal')
      .setTitle('Close Ticket'); // Set a non-empty title to satisfy builders

    const reasonInput = new TextInputBuilder()
      .setCustomId('closeReason')
      .setLabel("Close Reason") // Your custom label
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  }
};