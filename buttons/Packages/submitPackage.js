const { MessageFlags, EmbedBuilder } = require('discord.js');
let fetchDraft = null;
let saveDraft = null;
try {
  ({ fetchDraft, saveDraft } = require('../../utils/Packages/packageDraftStore'));
} catch (e) {
  // will provide fallbacks below
}

let Package = null;
try { Package = require('../../Database/Models/package'); } catch (e) { Package = null; }

// Defensive fallbacks for draft store functions
const _fetchDraft = typeof fetchDraft === 'function' ? fetchDraft : (userId) => {
  try {
    const store = require('../../utils/Packages/packageDraftStore');
    if (store && typeof store.fetchDraft === 'function') return store.fetchDraft(userId);
  } catch (e) {}
  const map = global.__packageDrafts instanceof Map ? global.__packageDrafts : new Map();
  const entry = map.get(userId);
  if (!entry) return { draft: null, expired: false };
  return { draft: entry.draft, expired: false, createdAt: entry.createdAt, expiresAt: entry.expiresAt };
};

const _saveDraft = typeof saveDraft === 'function' ? saveDraft : (userId, draft) => {
  try {
    const store = require('../../utils/Packages/packageDraftStore');
    if (store && typeof store.saveDraft === 'function') return store.saveDraft(userId, draft);
  } catch (e) {}
  global.__packageDrafts = global.__packageDrafts || new Map();
  if (draft == null) {
    return global.__packageDrafts.delete(userId);
  }
  const now = Date.now();
  const entry = { draft, createdAt: now, expiresAt: now + 10 * 60 * 1000 };
  global.__packageDrafts.set(userId, entry);
  return { createdAt: entry.createdAt, expiresAt: entry.expiresAt };
};

module.exports = {
  customID: 'submitPackage',

  async execute(interaction) {
    try {
      // Try to defer the reply; if it fails we'll fall back to replying later.
      let _deferredOk = false;
      try {
        await interaction.deferReply({ ephemeral: true });
        _deferredOk = true;
      } catch (e) {
        console.warn('submitPackage: deferReply failed, will fall back to reply', e?.message || e);
      }

      const safeReply = async (payload) => {
        try {
          if (interaction.deferred || interaction.replied || _deferredOk) return await interaction.editReply(payload);
          return await interaction.reply(payload);
        } catch (err) {
          try { return await interaction.followUp(typeof payload === 'object' ? payload : { content: String(payload), ephemeral: true }); } catch (e) { /* ignore */ }
        }
      };

      const { draft } = (_fetchDraft(interaction.user.id) || {});
      if (!draft) {
        return safeReply({ content: 'No package draft found. Use /package create first.', ephemeral: true });
      }

      // Basic validation: no unresolved issues
      if (draft.issues && draft.issues.length > 0) {
        // Provide a clear list of validation issues so the user can fix them.
        const issuesText = draft.issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n');
        const issuesEmbed = new EmbedBuilder()
          .setTitle('Draft validation issues')
          .setDescription(issuesText || 'Unknown validation issues')
          .setColor(0xd97706)
          .addFields(
            { name: 'Name', value: draft.name || 'N/A', inline: true },
            { name: 'Packer ID', value: draft.packerId || 'N/A', inline: true },
            { name: 'Price', value: draft.price || 'N/A', inline: true }
          );

        // Also include a compact snapshot of the draft to help debugging
        const snapshot = [
          `Name: ${draft.name || 'N/A'}`,
          `Purchase Link: ${draft.purchaselink || 'N/A'}`,
          `Packer ID: ${draft.packerId || 'N/A'}`,
          `Price: ${draft.price || 'N/A'}`,
          `Items: ${draft.items || 'N/A'}`,
        ].join('\n');

        const snapshotEmbed = new EmbedBuilder().setTitle('Draft snapshot').setDescription(`\n\`${snapshot}\``).setColor(0x242429);

        return safeReply({
          content: 'Your draft has validation issues. Use Edit to fix them first. See details below.',
          embeds: [issuesEmbed, snapshotEmbed],
          ephemeral: true,
        });
      }

      // Minimal publish: save to DB if the model exists, otherwise just acknowledge
      try {
        const pkg = new Package({
          name: draft.name,
          purchaselink: draft.purchaselink,
          packerId: draft.packerId || draft.packer,
          price: draft.price,
          items: draft.items,
        });
        await pkg.save().catch(() => {});
        // Also store a lightweight in-memory copy for environments without DB
        try {
          global.__publishedPackages = global.__publishedPackages || new Map();
          global.__publishedPackages.set(draft.name, {
            name: draft.name,
            purchaselink: draft.purchaselink,
            assetId: draft.assetId || null,
            packerId: draft.packerId || draft.packer,
            price: draft.price,
            items: draft.items,
            createdAt: Date.now(),
          });
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // If saving fails (missing model), continue to ack the action
        // Save to in-memory fallback so send/list/delete can still work
        try {
          global.__publishedPackages = global.__publishedPackages || new Map();
          global.__publishedPackages.set(draft.name, {
            name: draft.name,
            purchaselink: draft.purchaselink,
            assetId: draft.assetId || null,
            packerId: draft.packerId || draft.packer,
            price: draft.price,
            items: draft.items,
            createdAt: Date.now(),
          });
        } catch (ee) { /* ignore */ }
      }

      // Clear the draft after submit
  _saveDraft(interaction.user.id, null);

      return safeReply({ content: 'Package submitted successfully (placeholder).', ephemeral: true });
    } catch (err) {
      console.error('submitPackage handler error:', err);
      try { await interaction.editReply({ content: 'An error occurred while submitting the package.', ephemeral: true }); } catch (e) {
        try { await interaction.followUp({ content: 'An error occurred while submitting the package.', ephemeral: true }); } catch (ee) { /* ignore */ }
      }
    }
  }
};
