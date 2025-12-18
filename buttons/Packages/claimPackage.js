const { AttachmentBuilder, MessageFlags } = require('discord.js');
let Package = null;
try { Package = require('../../Database/Models/package'); } catch (e) { Package = null; }

module.exports = {
  customID: 'claimPackage',

  async execute(interaction) {
    // Minimal safe claim handler: identify package by the message that owns the button
    try {
      await interaction.deferReply({ ephemeral: true }).catch(() => {});

      const message = interaction.message;
      if (!message) return interaction.editReply({ content: 'Could not locate the package message.', ephemeral: true });

      const packageData = await Package.findOne({ messageId: message.id }).catch(() => null);
      if (!packageData) return interaction.editReply({ content: 'That package is not available.', ephemeral: true });

      // If there's a download attached, attempt to DM the user. This is intentionally simple so it won't crash if DB/model missing.
      if (packageData.downloadFile && packageData.downloadFile.url) {
        try {
          const file = new AttachmentBuilder(packageData.downloadFile.url, { name: packageData.downloadFile.name });
          const dm = await interaction.user.send({ content: `Here is your download for **${packageData.name}**.`, files: [file] });

          packageData.claims = packageData.claims || [];
          packageData.claims.push({ userId: interaction.user.id, dmChannelId: dm.channel.id, dmMessageId: dm.id, claimedAt: new Date() });
          await packageData.save().catch(() => {});

          await interaction.editReply({ content: 'Check your DMs — your package has been delivered.', ephemeral: true }).catch(() => {});
        } catch (dmErr) {
          return interaction.editReply({ content: 'I could not DM you the file. Please enable DMs and try again.', ephemeral: true });
        }
      } else {
        return interaction.editReply({ content: 'This package has no file attached yet.', ephemeral: true });
      }
    } catch (err) {
      console.error('Error in claimPackage button handler:', err);
      await interaction.editReply({ content: 'An error occurred while trying to claim the package.', ephemeral: true }).catch(() => {});
    }
  }
};
const { ModalBuilder } = require("discord.js");
const { fetchDraft } = require("../../utils/Packages/packageDraftStore");

module.exports = {
  customID: "editPackage",
  async execute(interaction) {
    const { draft } = fetchDraft(interaction.user.id);

    const modal = new ModalBuilder()
      .setCustomId("editPackageModal")
      .setTitle("Package Details")
      .addLabelComponents(
        (label) =>
          label.setLabel("Package Name").setTextInputComponent((input) =>
            input
              .setCustomId("packagename")
              .setPlaceholder("FHP Livery Pack")
              .setRequired(false)
              .setStyle(1)
              .setValue(draft?.raw?.name ?? "")
          ),
        (label) =>
          label
            .setLabel("Roblox Purchase Link")
            .setTextInputComponent((input) =>
              input
                .setCustomId("packagepurchaselink")
                .setPlaceholder(
                  "https://www.roblox.com/catalog/1234567890/example"
                )
                .setRequired(false)
                .setStyle(1)
                .setValue(draft?.raw?.purchaselink ?? "")
            ),
        (label) =>
          label
            .setLabel("Packer")
            .setUserSelectMenuComponent((menu) =>
              menu
                .setCustomId("packagepacker")
                .setPlaceholder("Select the packer")
                .setRequired(false)
                .setMaxValues(1)
            ),
        (label) =>
          label.setLabel("Price").setTextInputComponent((input) =>
            input
              .setCustomId("packageprice")
              .setPlaceholder("The desired price of the item")
              .setRequired(false)
              .setStyle(1)
              .setValue(draft?.raw?.price ?? "")
          ),

        (label) =>
          label.setLabel("Included Items").setTextInputComponent((input) =>
            input
              .setCustomId("packageitems")
              .setPlaceholder("Class A Uniform\n2015 Dodge Charger\nEMS Livery")
              .setRequired(false)
              .setStyle(2)
              .setValue(draft?.raw?.items ?? "")
          )
      );

    await interaction.showModal(modal);
  },
};