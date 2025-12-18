const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require("discord.js");
// CRITICAL FIX: Assuming Mongoose/Database Model is one level up in a 'models' directory.
const AssistanceModel = require("../models/AssistanceModel");

// Use distinct custom IDs for the two states
const CLAIM_ACTION_ID = 'claim:claim_action';
const UNCLAIM_ACTION_ID = 'claim:unclaim_action';

module.exports = {
	customID: CLAIM_ACTION_ID, // This component handles the initial CLAIM action
    name: Events.InteractionCreate, // Explicitly listening for interaction create, though often handled by a loader

	async execute(interaction) {
		if (!interaction.isButton() || interaction.customId !== CLAIM_ACTION_ID) return;

		// Defer the reply to give time for database and channel operations
		await interaction.deferReply({ ephemeral: true });

		// Allow both the original role and the support role to claim tickets
		const requiredRoles = ['1434350997752516800', '1434350988306808936'];
		if (!interaction.member.roles.cache.some(role => requiredRoles.includes(role.id))) {
			return await interaction.editReply({
				content: 'You do not have permissions to claim tickets!',
			});
		}

		const { channel, user } = interaction;
		let ticket;

		try {
			// Find the ticket based on the channel ID
			ticket = await AssistanceModel.findOne({ channelId: channel.id });
			
			if (!ticket) {
				return await interaction.editReply({ content: 'Could not find a matching ticket in the database.' });
			}
            
			// --- CLAIM LOGIC ---

			if (ticket.staffId) {
				// This ticket is already claimed. The button should have been 'Unclaim'.
				// This guards against race conditions or stale messages.
				return await interaction.editReply({
					content: `This ticket is already claimed by <@${ticket.staffId}>.`,
				});
			}

			// 1. Update Database
			ticket.staffId = user.id;
			await ticket.save();

			// 2. Rename Channel
			const safeUsername = user.username.toLowerCase().replace(/[^a-z0-9-]/g, '');
			await channel.edit({ name: `🟢・${safeUsername}` });

			// 3. Send Claim Message
			await channel.send({
				embeds: [
					new EmbedBuilder()
						.setDescription(`Your order has been claimed by ${user}.`)
						.setTitle('<:Ticket:1409269775300825138> Order Claimed')
						.setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=69121a2d&is=6910c8ad&hm=46a128315401b3052b978fdf9447c53a8ba958ad3d2b63e90afa9e41a99610cd&=&format=webp&width=2844&height=186')
						.setColor('#176EFE')
				]
			});

			// 4. Update Original Message Components
			// Build the new set of components: Unclaim Button + Close Button
			const updatedComponents = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId(UNCLAIM_ACTION_ID) // Now changes to the UNCLAIM ID
					.setLabel('Unclaim')
					.setStyle(ButtonStyle.Success), // Changed to Success style for claimed state
				new ButtonBuilder()
					.setCustomId('close:button')
					.setLabel('Close')
					.setStyle(ButtonStyle.Danger)
			);

			// Update the interaction message
			await interaction.message.edit({
				components: [updatedComponents]
			});
			
			// 5. Final Reply
			await interaction.editReply({
				content: `✅ You have successfully claimed this ticket. The channel has been renamed to \`🟢・${safeUsername}\`.`,
				ephemeral: true
			});


		} catch (error) {
			console.error(`[Claim Button Error] Failed to process claim action in channel ${channel.id}:`, error);
			await interaction.editReply({
				content: '❌ An unexpected error occurred while processing the claim request. Check bot permissions (rename channel) and console logs.',
			});
		}
	}
};