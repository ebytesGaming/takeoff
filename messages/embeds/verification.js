const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    name: 'verify', 
    description: 'Sends the verification embed with buttons.',
    cooldown: 5,
    async execute(message) {
        // Delete the user's command message
        try {
            await message.delete();
        } catch (e) {
            console.error("Could not delete message:", e);
        }

        // --- 1. Create the Verification Embed ---
        const banner = new EmbedBuilder()
            .setColor('#393939')
            .setImage('https://media.discordapp.net/attachments/1322790611383750707/1416105246807035955/image.png?ex=69248e48&is=69233cc8&hm=2bdb3557359af00c8b71254214d8919ab01973aefcd9e78b0fe8499d93719bcf&=&format=webp&quality=lossless&width=2844&height=936');

        const verificationEmbed = new EmbedBuilder()
            .setColor('#393939')
            .setTitle('Verification')
            .setDescription(
                'Verification in **Takeoff Studios** is required to gain full access to the server and its features.\n\n' +
                'Completing verification helps protect our community and ensures everyone enjoys a safe, smooth experience.'
            )
            .setImage('https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=69248e6e&is=69233cee&hm=23b11315b8e5ccc0664390c369f91b0eab516b6157ac505af67ebffb7ea82404&=&format=webp&quality=lossless&width=2844&height=56');

        // --- 2. Create Buttons ---
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify_user') 
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success); 

        const unableVerifyButton = new ButtonBuilder()
            .setLabel('Unable to verify')
            .setStyle(ButtonStyle.Link)
            .setURL('https://blox.link/dashboard/user/verifications'); 

        // --- 3. Create Action Row ---
        const buttonRow = new ActionRowBuilder().addComponents(verifyButton, unableVerifyButton);

        // --- 4. Send Message ---
        try {
            await message.channel.send({
                embeds: [banner, verificationEmbed],
                components: [buttonRow]
            });
        } catch (error) {
            console.error("Error sending verification embed:", error);
        }
    }
}
