const { EmbedBuilder } = require('discord.js');

module.exports = {
    customID: 'navigate_menu',

    async execute(interaction) {
        const requiredRoleId = "1413241782929588365";

        const SERVER_RULES_TEXT = `Compliance with **Orbit Studios** community rules is mandatory for all members. Failure to follow these guidelines will result in appropriate moderation actions. We value a respectful and positive environment and appreciate your commitment to maintaining these standards.

1. **Use Common Sense**
> Treat others how you would want to be treated. Avoid behavior you know is against the rules.

2. **NSFW**
> Do not post disturbing or inappropriate content. Violations may result in permanent removal.

3. **Disrespect**
> Rudeness or harassment toward community members will lead to swift moderation.

4. **Advertising**
> Promoting other servers or services here is not permitted and will be moderated.

5. **Languages**
> All communication must be in English. This ensures staff can effectively moderate discussions.

6. **Spamming**
> Avoid spam or off-topic posts that disrupt conversation. Keep discussions focused and constructive.

7. **Avoiding Moderation**
> Leaving the server to evade moderation or using alternate accounts to bypass restrictions is prohibited.

8. **Swearing**
> Profanity is not allowed. We strive to maintain a respectful and welcoming environment for everyone.

9. **Not Listed**
> Staff may take action even if a rule is not explicitly listed. All members are expected to follow the spirit of the rules and respect staff decisions.`;

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
                content: `[EMERGENCY] Please contact a developer **as soon as possible*.`,
                ephemeral: true,
            });
        }

        const selectedValue = interaction.values[0];
        let embed, banner;

        if (selectedValue === 'server_guidelines') {
            banner = new EmbedBuilder()
                .setColor('#393939')
                .setImage('https://media.discordapp.net/attachments/1413239124542099466/1437968175886106694/image.png?ex=69152bb9&is=6913da39&hm=f8eb7e6a21e8e6240138048ed9c8635466a0d782d900c5cca7e70595f1901a49&=&format=webp&quality=lossless&width=2560&height=716');

            embed = new EmbedBuilder()
                .setDescription(SERVER_RULES_TEXT)
                .setImage('https://media.discordapp.net/attachments/1413148427709186261/1437978034165514402/image.png?ex=691534e7&is=6913e367&hm=76aa1021d6d4998a2ea059077826da39f2eee19be4dc90c66cd1bdc8308eee9c&=&format=webp&quality=lossless&width=2820&height=140')
                .setColor('#393939');
        }

        await interaction.reply({
            embeds: [banner, embed],
            ephemeral: true
        });
    }
};
