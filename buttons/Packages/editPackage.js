const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

// Lightweight edit button: shows the `editPackageModal` handled by modals/editPackageModal.js
module.exports = {
  customID: "editPackage",
  async execute(interaction) {
    try {
      // Build modal inputs expected by editPackageModal.js
      const modal = new ModalBuilder().setCustomId("editPackageModal").setTitle("Edit Package");

      const nameInput = new TextInputBuilder()
        .setCustomId('packagename')
        .setLabel('Package name')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const linkInput = new TextInputBuilder()
        .setCustomId('packagepurchaselink')
        .setLabel('Roblox purchase link')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const packerInput = new TextInputBuilder()
        .setCustomId('packagepacker')
        .setLabel('Packer (mention or id)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const priceInput = new TextInputBuilder()
        .setCustomId('packageprice')
        .setLabel('Price')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      const itemsInput = new TextInputBuilder()
        .setCustomId('packageitems')
        .setLabel('Included items (comma or newline separated)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(linkInput),
        new ActionRowBuilder().addComponents(packerInput),
        new ActionRowBuilder().addComponents(priceInput),
        new ActionRowBuilder().addComponents(itemsInput)
      );

      await interaction.showModal(modal);
    } catch (err) {
      console.error('Failed to show editPackage modal:', err);
      // Attempt a safe ephemeral reply when showModal fails. If the interaction
      // was already replied/deferred this may also fail, so try followUp as last
      // resort.
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'Failed to open the edit dialog. Try /package create again.', ephemeral: true });
        } else {
          await interaction.followUp({ content: 'Failed to open the edit dialog. Try /package create again.', ephemeral: true });
        }
      } catch (e) {
        // swallow - nothing further we can do from here
      }
    }
  },
};