const {
    ButtonBuilder,
    ButtonStyle,
    TextDisplayBuilder,
    MessageFlags,
    SeparatorBuilder,
    ContainerBuilder,
    MediaGalleryBuilder,
    ActionRowBuilder,
    // New imports for the select menu
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder 
  } = require("discord.js");
  
  module.exports = {
    name: "obease",
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

      const Text = new TextDisplayBuilder().setContent('TAKEOFF — Where Your Ideas Leave the Ground. At TAKEOFF, we don’t just dream — we launch. Whatever you imagine, we make it real. Explore our designers creations in the portfolios channel and see what’s possible. Ready to lift off? Place your order to orbit!
')
      const Text2 = new TextDisplayBuilder().setContent('ㅤ')
      const Text3 = new TextDisplayBuilder().setContent('<:star2:1437985855154163722> Use the **Help** if you wish to appeal any further accusations about our community')

      const media = new MediaGalleryBuilder()
      .addItems([
        {media: {url: 'https://media.discordapp.net/attachments/1322790611383750707/1416105246807035955/image.png?ex=693af7c8&is=6939a648&hm=733ae39cdaea16b1072be719a2bacb335f2afcfe7f69ec75077c81821a4eaff5&=&format=webp&quality=lossless&width=2844&height=936'}}
      ])

      const media2 = new MediaGalleryBuilder()
      .addItems([
        {media: {url: 'https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=693af7ee&is=6939a66e&hm=8a279b553bbba0f063344f3c99b2b720e1ffbb70f3a6362cc3ec7280f2ded09c&=&format=webp&quality=lossless&width=2844&height=56'}}
      ])

      const seperator = new SeparatorBuilder();

      // Button Definition
      const button = new ButtonBuilder()
        .setLabel('Contact Support')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('dashboardHelp')
      
      const group = new ButtonBuilder()
        .setLabel('Roblox Group')
        .setStyle(ButtonStyle.Link)
        .setURL('https://www.roblox.com/share/g/34408427/Takeoff-Studios')
      // Button Action Row
      const buttonRow = new ActionRowBuilder().addComponents(button, group);

       // Select Menu Definition
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("navigate_menu")
      	.setDisabled(true)
        .setPlaceholder("Make a selection.")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Server Guidelines")
            .setValue("server_guidelines")
          // You can add more options here if needed:
          // new StringSelectMenuOptionBuilder().setLabel("Support Channel").setValue("support")
        );

      // Select Menu Action Row (Must be its own row)
      const selectMenuRow = new ActionRowBuilder().addComponents(selectMenu);


      // --- Container Building ---
      const container = new ContainerBuilder()
      .addMediaGalleryComponents(media)
      .addSeparatorComponents(seperator)
      .addTextDisplayComponents(Text)
      .addSeparatorComponents(seperator)
      
      // Add the Button Row
      

      // Add a separator before the select menu for cleaner spacing

      // Add the Select Menu Row
      .addActionRowComponents(selectMenuRow)
      .addActionRowComponents(buttonRow) 
      
      // Add the final separator and footer media
      .addSeparatorComponents(seperator)
      .addMediaGalleryComponents(media2)
      
      
      try {
        await message.channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        });
      } catch (error) {
        console.error("Error sending embed message", error);
      }
    },
  };