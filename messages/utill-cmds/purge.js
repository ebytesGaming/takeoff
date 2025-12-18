const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "purge",
    description: "Deletes a specified number of messages.",
    async execute(message, args) {
        // Check permission
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const reply = await message.reply(
                "<:X_1:1439403896039805019> You do not have ****permission**** to use this command."
            );
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        // Parse amount
        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount <= 0 || amount > 100) {
            const reply = await message.reply(
                "<:X_1:1439403896039805019> Please provide a ****valid number**** between 1 and 100."
            );
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return;
        }

        try {
            await message.channel.bulkDelete(amount, true);

            const confirmation = await message.channel.send(
                `<:OrbitLogo2:1437921856630947930> Successfully ****deleted**** ${amount} messages.`
            );
            setTimeout(() => confirmation.delete().catch(() => {}), 5000);
        } catch (error) {
            console.error("Error purging messages:", error);
            const reply = await message.reply(
                "<:X_1:1439403896039805019> An ****error**** occurred while trying to purge messages."
            );
            setTimeout(() => reply.delete().catch(() => {}), 5000);
        }
    },
};
