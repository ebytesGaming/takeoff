const { 
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
} = require('discord.js');

// --- Configuration ---
// These constants are shared between the button handler (this file) and the modal handler
const CLOSE_BUTTON_ID = 'close';
const CLOSURE_MODAL_ID = 'ticket_closure_modal';
const REASON_INPUT_ID = 'closure_reason_input'; // Used to reference the input value later

// --- Handler Logic (Button Press) ---
module.exports = {
    customID: CLOSE_BUTTON_ID,
    name: 'interactionCreate',

    async execute(interaction) {
        // 1. Check if the interaction is the correct button
        if (!interaction.isButton() || interaction.customId !== this.customID) {
            return;
        }

        
        // 2. Build the Closure Modal
        const modal = new ModalBuilder()
            .setCustomId(CLOSURE_MODAL_ID)
            .setTitle('Confirm Ticket Closure'); // Updated title to be consistent

        // The text input component where the staff enters the closure reason
        const reasonInput = new TextInputBuilder()
            .setCustomId(REASON_INPUT_ID)
            .setLabel('Reason for Closing Ticket (Required)') 
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(1024) // Using 1024, similar to your example
            .setPlaceholder('Enter a detailed reason for the closure. This will be sent to the user.');

        // Add the input component to an action row
        const actionRow = new ActionRowBuilder().addComponents(reasonInput);

        // Add the action row to the modal
        modal.addComponents(actionRow);
        
        // 3. Show the Modal to the user (This is what sends the form!)
            console.log(`transcript.close modal handler triggered by ${interaction.user?.id} in channel ${interaction.channel?.id}`);
            await interaction.showModal(modal).catch(error => {
                console.error('Failed to show modal:', error);
                // This reply is a fallback if showModal fails
                interaction.reply({ content: 'An error occurred while trying to open the closure form. Check the console.', ephemeral: true });
            });

        // This is the correct place for the code to stop execution until the user submits the form.
    }
};
