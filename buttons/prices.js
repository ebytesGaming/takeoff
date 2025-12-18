const { EmbedBuilder } = require('discord.js');

// Define the custom color
const PRICE_COLOR = `393939`; // Hex value 393939

// Helper function to build the main Pricing content embed
function createPriceContentEmbed() {
    return new EmbedBuilder()
        .setDescription(
            "Welcome to the **Orbit Studios** pricing panel. Below you’ll find a clear overview of our services and their base rates. Please note that these prices are starting points and may be adjusted or negotiated directly with your assigned designer.\n"
        )
        .setColor(PRICE_COLOR)
        .setImage('https://media.discordapp.net/attachments/1413148427709186261/1437978034165514402/image.png?ex=691534e7&is=6913e367&hm=76aa1021d6d4998a2ea059077826da39f2eee19be4dc90c66cd1bdc8308eee9c&=&format=webp&quality=lossless&width=2820&height=140')
        .addFields(
            { 
                name: "Liveries", 
                value: "- **LEO:** 90+ Robux\n- **FD:** 100+ Robux\n- **Misc:** 90+ Robux", 
                inline: true 
            },
            { 
                name: "Clothing", 
                value: "- **Shirt:** 60+ Robux\n- **Pants:** 60+ Robux\n- **Full Set:** 120+ Robux", 
                inline: true 
            },
            { 
                name: "Graphics", 
                value: "- **GFX:** 300+ Robux\n- **Logo:** 115+ Robux\n- **Banners:** 125+ Robux", 
                inline: true 
            },
            { 
                name: "ELS", 
                value: "- **LEO:** 85+ Robux\n- **FD:** 90+ Robux\n- **Misc:** 85+ Robux", 
                inline: true 
            },
            { 
                name: "Photography", 
                value: "- **Edit Picture:** 50+ Robux\n- **Take & Edit:** 90+ Robux\n- **Photo Package:** 315+ Robux\nIncludes 5 fully taken and edited photos", 
                inline: true 
            },
            { 
                name: "Discord Services", 
                value: "- **Embeds:** 50+ Robux\n- **Server Package:** 675+ Robux", 
                inline: true 
            },
            { 
                name: "Discord Bots", 
                value: "- **Simple Commands:** Price determined by designer\n- **Complex Commands:** Price determined by designer", 
                inline: true 
            },
            { 
                name: "Notice", 
                value: "- All listed prices are base rates and do not include any taxes imposed by Roblox.\n- Discord Bots may also be available for purchase in USD, depending on the designer.", 
                inline: true 
            }
        );
}

// Helper function to build the banner embed
function createBannerEmbed() {
    return new EmbedBuilder()
        .setColor(PRICE_COLOR)
        .setImage('https://media.discordapp.net/attachments/1413239124542099466/1437968175886106694/image.png?ex=69152bb9&is=6913da39&hm=f8eb7e6a21e8e6240138048ed9c8635466a0d782d900c5cca7e70595f1901a49&=&format=webp&quality=lossless&width=2560&height=716');
}

module.exports = {
    customID: 'p_167454264816308226', 

    async execute(interaction) {
        const embeds = [
            createBannerEmbed(),
            createPriceContentEmbed()
        ];

        await interaction.reply({
            embeds: embeds,
            ephemeral: true 
        });
    }
};
