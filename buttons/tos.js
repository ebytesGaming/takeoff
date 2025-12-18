const { EmbedBuilder } = require('discord.js');

// Helper function to build the main TOS content embed
function createTosContentEmbed() {
    const commonColor = '#393939';

    return new EmbedBuilder()
        .setTitle("Orbit Studios Terms of Service")
        .setColor(commonColor)
        .setDescription("To place an order with Orbit Studios, you must agree to and follow our Terms of Service. By opening an order, submitting a request, or communicating with our team, you acknowledge that you have read, understood, and accepted these terms in full.")
        .addFields(
            {
                name: "Refunds",
                value: "All purchases made at Orbit Studios are final. Payments are non-refundable under all standard circumstances. If you wish to cancel an order, the request must be submitted before the designer begins work. Once a project is confirmed and work has started, cancellations may only be considered under exceptional situations and may include a service fee.\n\nClients who fail to pay cancellation fees or who abandon communication during the process may lose access to future orders or services provided by Orbit Studios."
            },
            {
                name: "Payment",
                value: "Payment must be completed in full before any work begins, unless your designer has explicitly granted an exception. Failure to provide timely payment will result in:\n- Immediate cancellation of your order\n- A one-week suspension from placing new orders\n- Possible long-term restrictions for repeated violations\n\nPaying on time ensures that your project moves smoothly through our workflow and allows our team to allocate resources effectively."
            },
            {
                name: "Order Claiming",
                value: "Orbit Studios operates on a commission-based system, meaning designers have the right to accept or decline any request based on complexity, availability, or workload.\n\nIf no designer claims your order within two weeks, your ticket will be automatically closed.\n\nTo increase the likelihood of your order being accepted, please ensure your request is clear, detailed, realistic, and aligned with our offered services."
            },
            {
                name: "Missing Products & File Responsibility",
                value: "Once your order is completed and the ticket is closed, Orbit Studios is no longer responsible for storing, archiving, or retaining your product files. If you lose your files after the order is finalized, you will need to repurchase them or request a new order.\n\nWe strongly encourage clients to download and safely back up their files upon receiving them."
            },
            {
                name: "Revisions & Adjustments",
                value: "Orbit Studios provides revisions at the discretion of your designer. The number of revisions included depends on the package or service you selected. Excessive revision requests, complete redesigns, or changes unrelated to the original concept may require additional payment.\n\nPlease make sure your instructions are clear from the start to avoid delays or extra charges."
            },
            {
                name: "Conduct & Communication",
                value: "Respectful communication is required at all times. Harassment, spam, threats, slurs, or aggressive behavior toward staff or clients will result in immediate cancellation of your order and a permanent ban from Orbit Studios services.\n\nActive communication is also required. If you fail to respond for more than seven days, your order may be closed and marked as abandoned."
            }
        )
        .setImage('https://media.discordapp.net/attachments/1423154720884916394/1439507385189400688/image.png?ex=691b6df9&is=691a1c79&hm=5e9f771615f6fea62b5dce4ef5df7a162748b2d318cdbaa3875a96fdd5f7fd14&=&format=webp&quality=lossless&width=2844&height=130');
}

// Helper function to build the banner embed
function createBannerEmbed() {
    const commonColor = '#393939'; 
    return new EmbedBuilder()
        .setColor(commonColor)
        .setImage('https://media.discordapp.net/attachments/1413239124542099466/1437968175886106694/image.png?format=webp&quality=lossless&width=2560&height=716');
}

module.exports = {
    customID: 'p_167454270457647108', // match this to your button's custom_id

    async execute(interaction) {
        const embeds = [
            createBannerEmbed(),
            createTosContentEmbed()
        ];

        await interaction.reply({
            embeds: embeds,
            flags: 64 // ephemeral response
        });
    }
};
