const {
    ButtonBuilder,
    ButtonStyle,
    TextDisplayBuilder,
    MessageFlags,
    SeparatorBuilder,
    ContainerBuilder,
    MediaGalleryBuilder,
    ActionRowBuilder,
    SectionBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder // Note: V1 components can be mixed in V2 containers via ActionRowBuilder
} = require("discord.js");
 
module.exports = {
    name: "order3",
    cooldown: 5,
    async execute(message) {
        // Deletes the command message
        await message.delete()
        const requiredRoleId = "1416514299483914250";
        
        // Security Check
        if (!message.member.roles.cache.has(requiredRoleId)) {
            return;
        } 
        
        // --- Component Definitions ---

        // V2 Text Display: Welcome message
        const Text = new TextDisplayBuilder().setContent('Welcome to our ordering panel. Our team creates the highest quality products so you can improve your community. Select the button below that matches your needs.')
        const Text2 = new TextDisplayBuilder().setContent('**Clothing**ㅤㅤㅤㅤㅤㅤ**Liveries**ㅤㅤㅤㅤㅤ **Graphics**ㅤㅤㅤㅤㅤ **Discord**ㅤㅤㅤㅤ **Photography**')
        const Text3 = new TextDisplayBuilder().setContent('<:close1:1437658067629248512><:close2:1437658130212323389>ㅤㅤㅤㅤㅤㅤㅤㅤ<:close1:1437658067629248512><:close2:1437658130212323389>ㅤㅤㅤㅤㅤㅤㅤㅤ<:close1:1437658067629248512><:close2:1437658130212323389>ㅤㅤㅤ<:close1:1437658067629248512><:close2:1437658130212323389>ㅤㅤㅤ<:close1:1437658067629248512><:close2:1437658130212323389>')

        // V2 Section: Service status list
        const s1 = new SectionBuilder().addTextDisplayComponents(
            // Component 1
            new TextDisplayBuilder().setContent('**Liveries**\n<:c1:1444052974908473525><:c2:1444052934945013761><:c3:1444052906197385346><:c4:1444052867068596284>'), 
            // Component 2
            new TextDisplayBuilder().setContent('**Graphics**\n<:c1:1444052974908473525><:c2:1444052934945013761><:c3:1444052906197385346><:c4:1444052867068596284>'), 
            // Component 3
            new TextDisplayBuilder().setContent('**Clothing**\n<:c1:1444052974908473525><:c2:1444052934945013761><:c3:1444052906197385346><:c4:1444052867068596284>'), 
        );

        // V2 Media Gallery (Header)
        const media = new MediaGalleryBuilder()
        .addItems([
            {media: {url: 'https://media.discordapp.net/attachments/1322790611383750707/1416512184132964483/image.png?ex=693d1b86&is=693bca06&hm=497aa50ca1312801cb9685d251300fd7ca4d25e62121f17083ba812cf08e8c0a&=&format=webp&quality=lossless&width=2844&height=936'}}
        ])

        // V2 Media Gallery (Footer)
        const media2 = new MediaGalleryBuilder()
        .addItems([
            {media: {url: 'https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=693d9aee&is=693c496e&hm=ff3e1f1928a06ccff1e2283dfc42745e3eeba3350adb7e1f4dedf435c94cff6e&=&format=webp&quality=lossless&width=2844&height=56'}}
        ])

        // V2 Separator
        const seperator = new SeparatorBuilder();

        // V1 Button Definitions
        const button = new ButtonBuilder()
            .setLabel('Terms of Service')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('p_167454270457647108')
            
        const group = new ButtonBuilder()
            .setLabel('Pricing')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('p_167454264816308226')

        // V1 Button Action Row
        const buttonRow = new ActionRowBuilder().addComponents(button, group);

        // V1 Select Menu Definition
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('order:menu')
            .setDisabled(false)
            .setPlaceholder('Place an order!')
            .setOptions(
                new StringSelectMenuOptionBuilder()
                    .setValue('clothing')
                    .setEmoji('<:tshirt:1442327624721367060>')
                    .setLabel('Clothing'),
                new StringSelectMenuOptionBuilder()
                    .setValue('livery')
                    .setEmoji('<:car1:1442327692866224138>')
                    .setLabel('Livery'),
                new StringSelectMenuOptionBuilder()
                    .setValue('graphics')
                    .setEmoji('<:scenery:1442327506786058251>')
                    .setLabel('Graphics'),
                new StringSelectMenuOptionBuilder()
                    .setValue('discord')
                    .setEmoji('<:discord2:1442327586054344745>')
                    .setLabel('Discord'),
                new StringSelectMenuOptionBuilder()
                    .setValue('photography')
                    .setEmoji('<:camera:1442327882780250213>')
                    .setLabel('Photography'),
            );

        // V1 Select Menu Action Row (Must be its own row)
        const selectMenuRow = new ActionRowBuilder().addComponents(selectMenu);


        // --- Container Building (Putting it all together) ---
        const container = new ContainerBuilder()
            // Header Image
            .addMediaGalleryComponents(media)
            .addSeparatorComponents(seperator)
            
            // Text Content & Services List
            .addTextDisplayComponents(Text)
        	
            .addSeparatorComponents(seperator)
        	.addTextDisplayComponents(Text2)
       		.addTextDisplayComponents(Text3)
        .addSeparatorComponents(seperator)
            
            // Interactive Components (V1 Action Rows)
            // 1. Select Menu for Order Placement
            .addActionRowComponents(selectMenuRow)
            // Add a separator for cleaner spacing before the information buttons
            .addSeparatorComponents(seperator) 
            // 2. Information Buttons
            .addActionRowComponents(buttonRow) 
            
            // Footer Image
            .addSeparatorComponents(seperator)
            .addMediaGalleryComponents(media2);
            
        
        try {
            await message.channel.send({
                flags: MessageFlags.IsComponentsV2, // Use V2 components
                components: [container]
            });
        } catch (error) {
            console.error("Error sending order2 message:", error);
        }
    },
};