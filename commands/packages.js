/* drop your role id here  
   (this is the role that's allowed to run the /package cmds)
*/
const requiredRoleId = "1434350976302845962";

/* put your forum channel id here  
   (where packages get posted, needs to be a forum channel)
*/
const forumChannelId = "1435083619663347842";

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const Package = require("../models/package");
const { saveDraft } = require("../utils/Packages/packageDraftStore");
const {
  sanitizePackageDraft,
  buildPreviewEmbed,
  buildPublicPackageEmbed,
  extractAssetId,
  PACKAGE_COLOR,
  PACKAGE_ATTENTION_COLOR,
} = require("../utils/Packages/packageUtils");

// Safe color fallbacks in case the utils export is missing or malformed.
const _PACKAGE_COLOR = typeof PACKAGE_COLOR === "number" ? PACKAGE_COLOR : 0x242429;
const _PACKAGE_ATTENTION_COLOR = typeof PACKAGE_ATTENTION_COLOR === "number" ? PACKAGE_ATTENTION_COLOR : 0xd97706;

// Defensive fallbacks: some environments or earlier edits may leave these helpers
// undefined. Provide local fallback implementations so the command doesn't crash
// at runtime. The fallbacks are intentionally small and conservative.
const _sanitizePackageDraft =
  typeof sanitizePackageDraft === "function"
    ? sanitizePackageDraft
    : function (input) {
        const name = (input && input.name) ? String(input.name).trim() : "";
        const purchaselink = (input && input.purchaselink) ? String(input.purchaselink).trim() : "";
        const packer = (input && input.packer) ? String(input.packer).trim() : "";
        const price = (input && input.price) ? String(input.price).trim() : "";
        const items = (input && input.items) ? String(input.items).trim() : "";
        const issues = [];
        if (!name) issues.push("Set a package name.");
        if (!purchaselink) issues.push("Add the Roblox purchase link.");
        if (!packer) issues.push("Select or mention the packer.");
        if (!price) issues.push("Enter the package price.");
        if (!items) issues.push("List at least one included item.");
        return {
          name,
          purchaselink,
          purchaseLabel: "",
          packerId: packer.replace(/\D/g, "") || "",
          price,
          items,
          itemsList: items ? items.split(/[,\n]+/).map(s => s.trim()).filter(Boolean) : [],
          assetId: null,
          issues,
          raw: input,
        };
      };

const _buildPreviewEmbed = typeof buildPreviewEmbed === "function"
  ? buildPreviewEmbed
  : function (draft) {
      const embed = new EmbedBuilder()
        .setTitle(draft.name || "Package Preview")
        .setColor(_PACKAGE_COLOR);
      if (draft.purchaselink) embed.setDescription(draft.purchaselink);
      embed.addFields(
        { name: "Packer", value: draft.packerId ? `<@${draft.packerId}>` : "Not set", inline: true },
        { name: "Price", value: draft.price || "Not set", inline: true }
      );
      embed.addFields({ name: "Included Items", value: draft.items || "Not set" });
      return embed;
    };

// Defensive fallback for extractAssetId helper
const _extractAssetId = typeof extractAssetId === 'function'
  ? extractAssetId
  : function (rawLink) {
      if (!rawLink) return null;
      try {
        const s = String(rawLink).trim();
        const m = s.match(/(\d{4,})/);
        return m ? Number(m[1]) : null;
      } catch (e) {
        return null;
      }
    };

// Defensive fallback for saveDraft. Some runtime states observed where the
// require returned an object without the function. Prefer the real export
// but fall back to a simple in-memory store so commands remain usable.
const _saveDraft = typeof saveDraft === "function" ? saveDraft : (userId, draft) => {
  try {
    const store = require("../utils/Packages/packageDraftStore");
    if (store && typeof store.saveDraft === "function") return store.saveDraft(userId, draft);
  } catch (e) {
    // ignore and use fallback
  }

  // In-memory fallback (non-persistent, resets on process restart)
  global.__packageDrafts = global.__packageDrafts || new Map();
  const now = Date.now();
  const entry = { draft, createdAt: now, expiresAt: now + 10 * 60 * 1000 };
  global.__packageDrafts.set(userId, entry);
  return { createdAt: entry.createdAt, expiresAt: entry.expiresAt };
};

function packageEmbedFromDocument(pkg) {
  return buildPublicPackageEmbed({
    name: pkg.name,
    purchaselink: pkg.purchaselink,
    packerId: pkg.packerId,
    price: pkg.price,
    assetId: pkg.assetId,
    items: pkg.items,
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("package")
    .setDescription("Manage package drafts, publishing, and catalog cleanup.")
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Start a new package draft with an editable preview.")
    )
    .addSubcommand((sub) =>
      sub
        .setName("send")
        .setDescription("Publish a saved package to the forum channel.")
        .addStringOption((option) =>
          option
            .setName("package")
            .setDescription("Select the package to publish.")
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("image")
            .setDescription("Preview image for the forum post.")
            .setRequired(true)
        )
        .addAttachmentOption((option) =>
          option
            .setName("file")
            .setDescription(
              "Downloadable file that will be DMed after claiming."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("delete")
        .setDescription("Remove a saved package from the catalog.")
        .addStringOption((option) =>
          option
            .setName("package")
            .setDescription("Select the package to delete.")
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("list")
        .setDescription("Show a snapshot of recently updated packages.")
    ),

  autocomplete: async function (interaction) {
    if (!interaction.isAutocomplete()) return;

    const subcommand = interaction.options.getSubcommand();
    if (!["send", "delete"].includes(subcommand)) return;

    const focused = interaction.options.getFocused(true);
    if (focused.name !== "package") return;

    // NOTE: Autocomplete responses must be fast.
    const query = focused.value?.toLowerCase() ?? "";
    let packages = [];
    if (Package && typeof Package.find === 'function') {
      packages = await Package.find({}).sort({ updatedAt: -1 }).limit(25);
    } else {
      // Fallback to in-memory published packages
      const map = global.__publishedPackages instanceof Map ? global.__publishedPackages : new Map();
      packages = Array.from(map.values()).sort((a,b)=> (b.createdAt||0)-(a.createdAt||0)).slice(0,25);
    }

    const filtered = packages
      .filter((pkg) => (pkg.name || '').toLowerCase().includes(query))
      .slice(0, 25)
      .map((pkg) => ({
        name: pkg.name,
        value: pkg.name,
      }));

    await interaction.respond(filtered);
  },

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(requiredRoleId)) {
      // NOTE: This reply is fast and does not require deferral.
      return interaction.reply({
        content: "You don't have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Defer the reply immediately to satisfy the 3-second limit.
    // Some environments have previously thrown Unknown interaction here; catch
    // failures and fall back to replying later so we don't attempt an editReply
    // on an interaction that wasn't successfully deferred.
    let _deferredOk = false;
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      _deferredOk = true;
    } catch (e) {
      console.warn('packages: deferReply failed - will fall back to reply/edit logic', e?.message || e);
    }

    // Helper to send a reply in a safe way depending on whether deferReply succeeded
    const safeReply = async (payload) => {
      try {
        if (interaction.deferred || interaction.replied || _deferredOk) {
          return await interaction.editReply(payload);
        }
        return await interaction.reply(payload);
      } catch (err) {
        // If editReply/reply fails (for example Unknown interaction), try followUp as last resort.
        try {
          return await interaction.followUp(typeof payload === 'object' ? payload : { content: String(payload), flags: MessageFlags.Ephemeral });
        } catch (e) {
          console.error('packages: safeReply failed', e);
        }
      }
    };

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const previewDraft = _sanitizePackageDraft({
        name: "",
        purchaselink: "",
        packer: "",
        price: "",
        items: "",
      });
  _saveDraft(interaction.user.id, previewDraft);

  const previewEmbed = _buildPreviewEmbed(previewDraft);

      const editButton = new ButtonBuilder()
        .setCustomId("editPackage")
        .setLabel("Edit")
        .setStyle(ButtonStyle.Secondary);

      const submitButton = new ButtonBuilder()
        .setCustomId("submitPackage")
        .setLabel("Submit")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(previewDraft.issues.length > 0);

      const buttons = new ActionRowBuilder().addComponents(
        editButton,
        submitButton
      );

      return safeReply({
        content:
          "Use **Edit** to fill in the details. Submit unlocks once the preview shows no outstanding items.",
        embeds: [previewEmbed],
        components: [buttons],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (subcommand === "send") {
      // --- Configuration Check ---
      if (!forumChannelId || forumChannelId === "YOUR_FORUM_CHANNEL_ID_HERE") {
        const configEmbed = new EmbedBuilder()
    .setColor(_PACKAGE_ATTENTION_COLOR)
          .setTitle("Configuration Error")
          .setDescription("The `forumChannelId` is not set in `commands/package.js`.");
        return safeReply({ embeds: [configEmbed], flags: MessageFlags.Ephemeral });
      }
      // --- End Configuration Check ---


      const packageName = interaction.options.getString("package");
      const image = interaction.options.getAttachment("image");
      const file = interaction.options.getAttachment("file");

      let packageData = null;
      if (Package && typeof Package.findOne === 'function') {
        packageData = await Package.findOne({ name: packageName });
      } else {
        const map = global.__publishedPackages instanceof Map ? global.__publishedPackages : new Map();
        packageData = map.get(packageName) || null;
      }
      if (!packageData) {
        const notFoundEmbed = new EmbedBuilder()
          .setColor(_PACKAGE_ATTENTION_COLOR)
          .setTitle("Package Not Found")
          .setDescription(`No saved package named **${packageName}**.`);

        return safeReply({ embeds: [notFoundEmbed], flags: MessageFlags.Ephemeral });
      }

      if (!packageData.assetId) {
        packageData.assetId = _extractAssetId(packageData.purchaselink);
        try { if (packageData.save) await packageData.save(); } catch(e){}
      }

      // --- START FIX: Build Embed and Button Row ---
      const publicEmbed = new EmbedBuilder()
        .setColor(_PACKAGE_COLOR) // Use the standard package color
        .setTitle(packageData.name)
        // Set the package banner image
        .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=690b82ad&is=690a312d&hm=f1faf33d5c217b4365bdb35d51942b845408734b6bc244db156e838cacb4b8d7&=&format=webp&width=2844&height=186') 
        .setDescription(
          `<:Member:1409418541022580798> Packer: <@${packageData.packerId}>\n<:Purchase:1409255102589698048> Price: ${packageData.price}\n\n**Requirements:**\n${packageData.items}\n\n-# <:Saturn:1434368748734910504> To claim the package press the claim button.`
        );

      const packageButton = new ButtonBuilder()
        .setLabel("Claim Package")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("claimPackage");

      const row = new ActionRowBuilder().addComponents(packageButton);
      // --- END FIX: Build Embed and Button Row ---


      const forum = await interaction.client.channels.fetch(forumChannelId);

      // --- CRITICAL FIX: Send the entire post, including the button and embed, in the initial thread creation message. ---
      const thread = await forum.threads.create({
        name: packageData.name,
        message: {
          files: [image?.url].filter(Boolean), // Initial message includes the image attachment
          embeds: [publicEmbed], // And the embed
          components: [row], // And the button row
        },
      });

      // Fetch the ID of the initial message that was just created to start the thread
      const initialMessage = (await thread.messages.fetch({ limit: 1 })).first();

      packageData.messageId = initialMessage.id;
      packageData.downloadFile = {
        url: file.url,
        name: file.name,
      };

      // Persist changes: prefer calling the Mongoose document save() when
      // available, otherwise update the in-memory published packages map.
      try {
        if (packageData && typeof packageData.save === 'function') {
          await packageData.save();
        } else {
          // Update in-memory fallback store used when DB/model is unavailable
          try {
            global.__publishedPackages = global.__publishedPackages || new Map();
            global.__publishedPackages.set(packageData.name, packageData);
          } catch (e) {
            // swallow - nothing further we can do
          }
        }
      } catch (e) {
        console.warn('packages: failed to persist packageData via save(), falling back to in-memory store', e?.message || e);
        try {
          global.__publishedPackages = global.__publishedPackages || new Map();
          global.__publishedPackages.set(packageData.name, packageData);
        } catch (ee) {}
      }

      // For the confirmation reply, reuse the publicEmbed and just modify its title/description.
      const publishEmbed = publicEmbed
        .setTitle(`${packageData.name} Published`)
        .setDescription(
          [
            `Posted in ${forum}.`,
            thread?.url ? `[Open the forum thread](${thread.url})` : null,
          ]
            .filter(Boolean)
            .join("\n\n")
        )
        .setFooter({
          text: "The claim button is live. Files will be delivered automatically.",
        });

      return safeReply({ embeds: [publishEmbed], flags: MessageFlags.Ephemeral });
    }

    if (subcommand === "delete") {
      const packageName = interaction.options.getString("package");
      let deleted = null;
      if (Package && typeof Package.findOneAndDelete === 'function') {
        deleted = await Package.findOneAndDelete({ name: packageName });
      } else {
        const map = global.__publishedPackages instanceof Map ? global.__publishedPackages : new Map();
        deleted = map.has(packageName) ? map.get(packageName) : null;
        if (deleted) map.delete(packageName);
      }

      if (!deleted) {
        const notFoundEmbed = new EmbedBuilder()
          .setColor(_PACKAGE_ATTENTION_COLOR)
          .setTitle("Package Not Found")
          .setDescription(`No saved package named **${packageName}**.`);

        return safeReply({ embeds: [notFoundEmbed], flags: MessageFlags.Ephemeral });
      }

      const deleteEmbed = new EmbedBuilder()
        .setColor(_PACKAGE_ATTENTION_COLOR)
        .setTitle("Package Removed")
        .setDescription(
          `**${packageName}** has been removed from the catalog.`
        );

      return safeReply({ embeds: [deleteEmbed], flags: MessageFlags.Ephemeral });
    }

    if (subcommand === "list") {
      let packages = [];
      if (Package && typeof Package.find === 'function') {
        packages = await Package.find({}).sort({ updatedAt: -1 });
      } else {
        const map = global.__publishedPackages instanceof Map ? global.__publishedPackages : new Map();
        packages = Array.from(map.values()).sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
      }
      if (!packages.length) {
        return safeReply({ content: "No packages are currently saved.", flags: MessageFlags.Ephemeral });
      }

      const limited = packages.slice(0, 10);
      const lines = limited.map((pkg, index) => {
        const rank = index + 1;
        const title = pkg.purchaselink
          ? `[${pkg.name}](${pkg.purchaselink})`
          : pkg.name;
        const packer = pkg.packerId ? `<@${pkg.packerId}>` : "N/A";
        const asset = pkg.assetId ? `\`${pkg.assetId}\`` : "N/A";
        return `**${rank}. ${title}**\nPrice: ${pkg.price} | Packer: ${packer}\nAsset ID: ${asset}`;
      });

      const listEmbed = new EmbedBuilder()
        .setTitle(`Available Packages (${packages.length})`)
        .setColor(_PACKAGE_COLOR)
        .setDescription(lines.join("\n\n"));

      const footerText =
        limited.length < packages.length
          ? `Showing ${limited.length} of ${packages.length} packages. Run /package list again for the latest snapshot.`
          : "Use /package send <name> to publish a package to the forum.";

      listEmbed.setFooter({ text: footerText });

      return safeReply({ embeds: [listEmbed], flags: MessageFlags.Ephemeral });
    }
  },
};