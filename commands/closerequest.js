const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const AssistanceModel = require('../models/AssistanceModel');

// Helper function to create the closure message (used by both successful closure and timeout)
function createClosedMessage(reason) {
    return {
        content: '**This ticket has been closed automatically.**',
        embeds: [
            new EmbedBuilder()
                .setTitle('<:Ticket:1409269775300825138> Ticket Closure Confirmed')
                .setDescription(`The closure request timeout expired.\n\n**Closure Reason:** *${reason}*`)
                .setColor('Red') // Indicate final state
        ],
        components: [] // Remove buttons
    };
}

module.exports = {
    // Define the slash command metadata
    data: new SlashCommandBuilder()
        .setName('closereq')
        .setDescription('Sends the two-embed message to request ticket closure with a timeout.')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for closing the ticket.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Time in minutes to wait before auto-closing the ticket (Default: 60 minutes).')
                .setRequired(false)),

    // The execution logic for the command
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // --- CHANNEL / TICKET CHECK ---
        // Allow a small whitelist of CATEGORY IDs; any channel whose parent category
        // matches one of these IDs may use the command even when not a ticket channel.
        const allowedCategoryIds = [
            '1434351268935110706',
            '1434351270046470144',
            '1434351276967333961',
            '1434351278753972235',
            '1434351280427630622',
            '1434351281698246849',
            '1434351282914721912'
        ];

        // Resolve parent category ID robustly: try .parentId, .parent?.id, and fall back to fetching the channel
        let parentCategoryId = null;
        try {
            parentCategoryId = interaction.channel?.parentId ?? interaction.channel?.parent?.id ?? null;
            // If the library didn't supply parent info on the cached channel, fetch the channel from the API
            if (!parentCategoryId && interaction.guild) {
                const fetched = await interaction.guild.channels.fetch(interaction.channel.id).catch(() => null);
                parentCategoryId = fetched?.parentId ?? fetched?.parent?.id ?? null;
            }
        } catch (parentErr) {
            // As a last resort, use whatever is available on the object
            parentCategoryId = interaction.channel?.parentId ?? interaction.channel?.parent?.id ?? null;
        }

        const isWhitelistedChannel = parentCategoryId && allowedCategoryIds.includes(parentCategoryId);

        // Try to resolve a ticket entry if this isn't a whitelisted category channel
        let ticket = null;
        if (!isWhitelistedChannel) {
            try {
                ticket = await AssistanceModel.findOne({ channelId: interaction.channel.id });
            } catch (dbErr) {
                console.error('DB error while resolving ticket for /closereq:', dbErr);
                return interaction.editReply({ content: 'An internal error occurred trying to validate this channel as a ticket.', ephemeral: true });
            }

            if (!ticket) {
                return interaction.editReply({ 
                    content: '🚫 This command can only be used inside ticket channels or in specific staff channels.',
                    ephemeral: true
                });
            }
        }

        // --- PERMISSION CHECK: allow support role, assigned staff, guild admins ---
        const supportRoleId = '1434350988306808936';
        let member = null;
        try {
            member = interaction.member || await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        } catch (memErr) {
            member = interaction.member || null;
        }

        const isAdmin = member?.permissions?.has?.('Administrator');
        const hasSupportRole = member?.roles?.cache?.has?.(supportRoleId);
    const isAssignedStaff = ticket && ticket.staffId && ticket.staffId === interaction.user.id;

        if (!isAdmin && !hasSupportRole && !isAssignedStaff) {
            return interaction.editReply({ content: '🚫 You must be an administrator, the assigned staff member, or have the support role to use this command.', ephemeral: true });
        }

        // ---------------------------------------------

        const reason = interaction.options.getString('reason');
        // Get duration in minutes, default to 60 minutes (1 hour)
        const durationMinutes = interaction.options.getInteger('duration') || 60; 
        const delayMs = durationMinutes * 60 * 1000;
        
        // --- 1. BUILD THE EMBEDS ---

        const embedColor = 38143; // The original color
        const timeLimitDescription = `This request will auto-close the ticket in **${durationMinutes} minutes** if not denied.`;

        // First Embed (Top Banner)
        const topBannerEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406764643614802/SupportBanner.png?ex=690836e6&is=6906e566&hm=76bbf4125cf1a803f42694c22b8e103e7db64dacd93099bca1e7d4dd39e2c9c0&=&format=webp&quality=lossless&width=1768&height=512');

        // Second Embed (Main Content)
        const mainContentEmbed = new EmbedBuilder()
            .setTitle('<:Ticket:1409269775300825138> Close Request')
            .setDescription(
                `- A request has been made to close your ticket. The staff member handling your case has determined that the matter has been resolved. If you agree, you may click the **Accept** button to finalize. If you do not agree and feel further assistance is needed, please click the **Deny** button to keep your ticket open. We sincerely appreciate you reaching out and value your time and communication.\n\n**${timeLimitDescription}**\n\n- **Reason Provided:**\n*${reason}*`
            )
            .setColor(embedColor)
            .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=690836ed&is=6906e56d&hm=73ea1cdb4faf2ebd0b51bce81aa46f1e2265fa7d14fdacec724f229eb87c75dd&=&format=webp');

        // --- 2. BUILD THE COMPONENTS (BUTTONS) ---

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('closerequest_accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('p_232186922779283461')
                    .setLabel('Deny')
                    .setStyle(ButtonStyle.Danger)
            );
        
        try {
            // Send the message
            const sentMessage = await interaction.channel.send({ 
                embeds: [topBannerEmbed, mainContentEmbed],
                components: [buttons]
            });

            // --- 3. AUTO-CLOSURE TIMEOUT ---
            
            // Set a timeout to automatically close the ticket message
            setTimeout(async () => {
                // Resolve the message again from cache in case it was modified (e.g., denied)
                const freshMessage = interaction.channel?.messages?.cache?.get(sentMessage.id) || null;

                // If the message could not be fetched or if the buttons were already removed, stop.
                if (!freshMessage || freshMessage.components.length === 0) {
                    console.log(`Auto-close aborted for ticket message ${sentMessage.id}: message already handled or deleted.`);
                    return; 
                }

                try {
                    // Edit the message to show it is closed and remove the buttons
                    await freshMessage.edit(createClosedMessage(reason));
                    console.log(`Ticket message ${sentMessage.id} auto-closed after ${durationMinutes} minutes.`);
                } catch (editError) {
                    console.error(`Failed to auto-edit ticket message ${sentMessage.id}:`, editError);
                }
            }, delayMs);


            // Confirm to the staff member that the message was sent successfully (ephemeral)
            await interaction.editReply({ 
                content: `Close request sent successfully. Ticket will **auto-close** in **${durationMinutes} minutes** if not manually denied.`,
            });

        } catch (error) {
            console.error('Error executing /closereq:', error);
            await interaction.editReply({ 
                content: 'An error occurred while attempting to send the close request message.', 
            });
        }
    }
};
