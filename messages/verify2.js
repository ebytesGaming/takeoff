const {
    ButtonBuilder,
    ButtonStyle,
    TextDisplayBuilder,
    MessageFlags,
    SeparatorBuilder,
    ContainerBuilder,
    ThumbnailBuilder,
    MediaGalleryBuilder,
    // CRITICAL FIX: Need to import ActionRowBuilder for standard buttons
    ActionRowBuilder 
  } = require("discord.js");
  
  module.exports = {
    name: "verify2",
    cooldown: 5,
    async execute(message) {
      // Deletes the command message
      await message.delete()
      const requiredRoleId = "1307537719081304181";
    
      // Security Check
      if (!message.member.roles.cache.has(requiredRoleId)) {
          return;
      } 
      
      // --- Component Definitions ---

      const Text = new TextDisplayBuilder().setContent('### Verification')
      const Text2 = new TextDisplayBuilder().setContent(' Verification in **Takeoff Studios** is required to gain full access to the server and its features.')
      const Text3 = new TextDisplayBuilder().setContent('Completing verification helps protect our community and ensures everyone enjoys a safe, smooth experience.')

      const media = new MediaGalleryBuilder()
      .addItems([
        {media: {url: 'https://media.discordapp.net/attachments/1322790611383750707/1416105246807035955/image.png?ex=693af7c8&is=6939a648&hm=733ae39cdaea16b1072be719a2bacb335f2afcfe7f69ec75077c81821a4eaff5&=&format=webp&quality=lossless&width=2844&height=936'}}
      ])

      const media2 = new MediaGalleryBuilder()
      .addItems([
        {media: {url: 'https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=693af7ee&is=6939a66e&hm=8a279b553bbba0f063344f3c99b2b720e1ffbb70f3a6362cc3ec7280f2ded09c&=&format=webp&quality=lossless&width=2844&height=56'}}
      ])

      const seperator = new SeparatorBuilder();

      const thumbnail = new ThumbnailBuilder({
        media: {
            url: 'https://media.discordapp.net/attachments/1425858519327969381/1426635415024173118/LOGO_1.png?ex=68f72604&is=68f5d484&hm=3c289f653bcd5b297a7f0666d657a5160d43d940c6119d1d37b6aa25d59c8b3a&=&format=webp&quality=lossless&width=1480&height=1480'
        }
      })

      
      const button = new ButtonBuilder()
        .setLabel('Verify')
        .setStyle(ButtonStyle.Success)
        .setCustomId('verify_user')
      
      const button2 = new ButtonBuilder()
        .setLabel('Unable to Verify')
        .setStyle(ButtonStyle.Link)
        .setURL('https://blox.link/dashboard/user/verifications')

      // FIX: Wrap the button in a standard ActionRowBuilder
      const actionRow = new ActionRowBuilder().addComponents(button, button2);

      // --- Container Building ---
      const container = new ContainerBuilder()
      .addMediaGalleryComponents(media)
      .addSeparatorComponents(seperator)
      .addTextDisplayComponents(Text)
      .addTextDisplayComponents(Text2)
      .addTextDisplayComponents(Text3)
      .addSeparatorComponents(seperator)
      .addActionRowComponents(actionRow) 
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