const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    customID: "p_195610463227088901", // Agree button ID
    async execute(interaction) {
        const channel = interaction.channel;
        const userId = interaction.user.id;

        try {
            // Delete the TOS embed message
            await interaction.message.delete().catch(() => {});

            // Announce agreement
            await channel.send(
                `<:TAKEOFFStudios:1419840091651575910> **${interaction.user}** has **agreed** to the terms of service.`
            );

            // Update permissions so user can send messages and attach files
            await channel.permissionOverwrites.edit(userId, {
                ViewChannel: true,
                SendMessages: true,
                AttachFiles: true
            });

            // Acknowledge the button press ephemerally
            await interaction.reply({ content: "You have agreed to the Terms of Service.", flags: 64 });
        } catch (err) {
            console.error("Error handling Agree button:", err);
            await interaction.reply({ content: "⚠️ Something went wrong.", flags: 64 });
        }
    }
};
