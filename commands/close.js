const { 
    SlashCommandBuilder, // Needed to define the command structure
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
} = require('discord.js');

// --- Configuration ---
// These constants are critical for linking this command to the separate modal submission handler
const CLOSURE_MODAL_ID = 'ticket_closure_modal';
const REASON_INPUT_ID = 'closure_reason_input'; 

// Array of Category IDs where the /close command is allowed to run.
const ALLOWED_TICKET_CATEGORIES = [
    '1434351268935110706', 
    '1434351276967333961', 
    '1434351278753972235', 
    '1434351280427630622', 
    '1434351281698246849', 
    '1434351282914721912', 
    '1434351270046470144'
];

// --- Slash Command Definition ---
module.exports = {
    // Define the command's metadata for Discord
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Opens the confirmation form to close the current ticket.'),

    // --- Command Execution Logic ---
    async execute(interaction) {
        
        const channel = interaction.channel;

        // 1. **Check Channel Type and Parent Category ID**
        // Ensure the channel has a parent category and that the parent ID is in the allowed list.
        if (!channel.parent || !ALLOWED_TICKET_CATEGORIES.includes(channel.parentId)) {
            return interaction.reply({ 
                content: 'This command can only be used in a channel that is inside one of the designated ticket categories.', 
                ephemeral: true 
            });
        }
        
        // The original channel name check is redundant if using category IDs but can remain as a secondary check if needed.
        /* if (!channel.name.startsWith('ticket-')) {
            return interaction.reply({ 
                content: 'This command can only be used inside a ticket channel.', 
                ephemeral: true 
            });
        }
        */

        // 2. Build the Closure Modal
        const modal = new ModalBuilder()
            .setCustomId(CLOSURE_MODAL_ID)
            .setTitle('Confirm Ticket Closure'); 

        // 3. The text input component where the staff enters the closure reason
        const reasonInput = new TextInputBuilder()
            .setCustomId(REASON_INPUT_ID)
            .setLabel('Reason for Closing Ticket (Required)') 
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(1024)
            .setPlaceholder('Enter a detailed reason for the closure. This will be sent to the user.');

        // 4. Add the input component to an action row
        const actionRow = new ActionRowBuilder().addComponents(reasonInput);

        // 5. Add the action row to the modal
        modal.addComponents(actionRow);
        
        // 6. Show the Modal to the user
        await interaction.showModal(modal).catch(error => {
            console.error('Failed to show modal on /close command:', error);
            interaction.reply({ content: 'An error occurred while trying to open the closure form. Check the console.', ephemeral: true });
        });
    }
};
