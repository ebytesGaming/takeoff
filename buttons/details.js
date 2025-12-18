const { 
    ModalBuilder, 
    TextInputBuilder, 
    ActionRowBuilder, 
    TextInputStyle
} = require('discord.js');

// Custom IDs for the button, modal, and its components
const DETAILS_BUTTON_ID = 'p_195350370967382025';
const MODAL_ID = 'service_screening_modal';
const PRODUCT_ID = 'product_input';
const QUANTITY_ID = 'quantity_input';
const DESCRIPTION_ID = 'description_input';

module.exports = {
    customID: DETAILS_BUTTON_ID,
    name: 'interactionCreate',

    async execute(interaction) {
        // --- 1. Handle Button Click (Show Modal) ---
        if (interaction.isButton() && interaction.customId === DETAILS_BUTTON_ID) {
            
            // Check if the user has already submitted the form by checking the button state in the message
            if (interaction.message.components.some(row => 
                row.components.some(comp => comp.customId === DETAILS_BUTTON_ID && comp.disabled)
            )) {
                return interaction.reply({ content: 'You have already submitted the details for this order.', ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId(MODAL_ID)
                .setTitle('Order Details - Service Screening');

            // --- Form Inputs (Max Label length 45 chars) ---
            const productInput = new TextInputBuilder()
                .setCustomId(PRODUCT_ID)
                .setLabel('Product Name/Type (e.g., Livery, Logo, Bot)') 
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(100);

            const quantityInput = new TextInputBuilder()
                .setCustomId(QUANTITY_ID)
                .setLabel('Quantity (e.g., 1, Two, 5+)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(20);

            const descriptionInput = new TextInputBuilder()
                .setCustomId(DESCRIPTION_ID)
                .setLabel('Project Description (References, Vision)') // Under 45 chars
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(900); // Max 900 chars to safely fit in embed field (1024 limit) 

            const firstActionRow = new ActionRowBuilder().addComponents(productInput);
            const secondActionRow = new ActionRowBuilder().addComponents(quantityInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(descriptionInput);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            await interaction.showModal(modal);
            return;
        }
    }
};
