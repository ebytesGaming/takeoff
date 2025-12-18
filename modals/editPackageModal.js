const { ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
// Lightweight, robust modal submit handler for package editing.
// Uses the packageDraftStore utilities when available, but tolerates missing modules.
let saveDraft = null;
let fetchDraft = null;
let sanitizePackageDraft = null;
let buildPreviewEmbed = null;
try {
  ({ saveDraft, fetchDraft } = require('../utils/Packages/packageDraftStore'));
} catch (e) { /* optional */ }
try {
  ({ sanitizePackageDraft, buildPreviewEmbed } = require('../utils/Packages/packageUtils'));
} catch (e) { /* optional */ }

// Defensive fallbacks so the modal works even when utils are missing
const _fetchDraft = typeof fetchDraft === 'function' ? fetchDraft : (userId) => {
  const map = global.__packageDrafts instanceof Map ? global.__packageDrafts : new Map();
  const entry = map.get(userId);
  if (!entry) return { draft: null, expired: false };
  return { draft: entry.draft, expired: false, createdAt: entry.createdAt, expiresAt: entry.expiresAt };
};

const _saveDraft = typeof saveDraft === 'function' ? saveDraft : (userId, draft) => {
  global.__packageDrafts = global.__packageDrafts || new Map();
  if (draft == null) return global.__packageDrafts.delete(userId);
  const now = Date.now();
  const entry = { draft, createdAt: now, expiresAt: now + 10 * 60 * 1000 };
  global.__packageDrafts.set(userId, entry);
  return { createdAt: entry.createdAt, expiresAt: entry.expiresAt };
};

const _sanitizePackageDraft = typeof sanitizePackageDraft === 'function'
  ? sanitizePackageDraft
  : (input) => {
      const name = (input && input.name) ? String(input.name).trim() : '';
      const purchaselink = (input && input.purchaselink) ? String(input.purchaselink).trim() : '';
      const packer = (input && input.packer) ? String(input.packer).trim() : '';
      const price = (input && input.price) ? String(input.price).trim() : '';
      const items = (input && input.items) ? String(input.items).trim() : '';
      const issues = [];
      if (!name) issues.push('Set a package name.');
      if (!purchaselink) issues.push('Add the Roblox purchase link.');
      if (!packer) issues.push('Select or mention the packer.');
      if (!price) issues.push('Enter the package price.');
      if (!items) issues.push('List at least one included item.');
      return { name, purchaselink, packerId: packer.replace(/\D/g, '') || '', price, items, itemsList: items ? items.split(/[,\n]+/).map(s => s.trim()).filter(Boolean) : [], assetId: null, issues, raw: input };
    };

const _buildPreviewEmbed = typeof buildPreviewEmbed === 'function'
  ? buildPreviewEmbed
  : (draft) => {
      const embed = new EmbedBuilder().setTitle(draft.name || 'Package Preview');
      if (draft.purchaselink) embed.setDescription(draft.purchaselink);
      embed.addFields({ name: 'Packer', value: draft.packerId ? `<@${draft.packerId}>` : 'Not set', inline: true }, { name: 'Price', value: draft.price || 'Not set', inline: true });
      embed.addFields({ name: 'Included Items', value: draft.items || 'Not set' });
      return embed;
    };

module.exports = {
  customID: 'editPackageModal',
  async execute(interaction) {
    try {
  const prev = (_fetchDraft(interaction.user.id) || {}).draft ?? null;

      const read = (id, key) => {
        try {
          return interaction.fields.getTextInputValue(id) ?? '';
        } catch {
          return prev?.raw?.[key] ?? prev?.[key] ?? '';
        }
      };

  const draft = _sanitizePackageDraft({
    name: read('packagename', 'name'),
    purchaselink: read('packagepurchaselink', 'purchaselink'),
    packer: read('packagepacker', 'packer'),
    price: read('packageprice', 'price'),
    items: read('packageitems', 'items'),
  });

      _saveDraft(interaction.user.id, draft);

      const previewEmbed = _buildPreviewEmbed(draft);

      const editButton = new ButtonBuilder().setCustomId('editPackage').setLabel('Edit').setStyle(ButtonStyle.Secondary);
      const submitButton = new ButtonBuilder().setCustomId('submitPackage').setLabel('Submit').setStyle(ButtonStyle.Primary).setDisabled(draft.issues && draft.issues.length > 0);
      const buttons = new ActionRowBuilder().addComponents(editButton, submitButton);

      try {
        await interaction.update({ embeds: previewEmbed ? [previewEmbed] : [], components: [buttons], flags: MessageFlags.Ephemeral });
      } catch (e) {
        console.warn('editPackageModal: interaction.update failed, falling back to reply/followUp', e?.message || e);
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ embeds: previewEmbed ? [previewEmbed] : [], components: [buttons], ephemeral: true });
          } else {
            await interaction.followUp({ embeds: previewEmbed ? [previewEmbed] : [], components: [buttons], ephemeral: true });
          }
        } catch (ee) {
          // nothing else to do - swallow
        }
      }
    } catch (err) {
      console.error('editPackageModal handler error:', err);
      try { await interaction.reply({ content: 'Failed to update package preview.', flags: MessageFlags.Ephemeral }); } catch (e) { /* ignore */ }
    }
  }
};