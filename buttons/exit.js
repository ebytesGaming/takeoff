const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

// Custom ID for the Exit button
const EXIT_BUTTON_ID = "p_195610463402773200";

module.exports = {
    customID: EXIT_BUTTON_ID,
    name: 'interactionCreate',

    async execute(interaction) {
        if (!interaction.isButton() || interaction.customId !== EXIT_BUTTON_ID) {
            return;
        }

        // We use deferReply as ephemeral, even though we will delete the channel shortly after.
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.channel;
        const user = interaction.user;

        // 1. Send the final confirmation/closure message (ephemeral)
        await interaction.editReply({
            content: `<:Check:1409419092389007393> **Order Closed.** You have chosen to exit this order.`
        });

        // 2. Add a small delay for the user to see the confirmation message
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            // 3. Delete the channel
            await channel.delete(`Order exited by user ${user.tag} (${user.id}) via the Exit button.`);
            console.log(`Channel ${channel.name} deleted successfully after user exit.`);
            
        } catch (error) {
            console.error('Error deleting channel after exit button press:', error);
            // Since the channel might already be gone, this second reply will likely fail,
            // but we'll log the error and let the user know if they can still see the ephemeral message.
            if (channel.deletable) {
                // If it failed but the channel is still there, try one more message before giving up.
                // This is unlikely to run in a real scenario unless permissions are missing.
                channel.send(`<:Wrong:1409419053281316864> **Critical Error:** Failed to delete channel. Please contact staff to delete this ticket manually.`);
            }
        }
    }
};
