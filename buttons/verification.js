const { ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, MediaGalleryBuilder, ThumbnailBuilder, ContainerBuilder, SeparatorBuilder, MessageFlags, TextDisplayBuilder } = require('discord.js');
const { getRobloxAccount } = require('../utils/BloxlinkApi.js');
const fetch = require('node-fetch');

module.exports = {
    customID: 'verify_user',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        try {
            const robloxAccount = await getRobloxAccount(guildId, userId);

            if (robloxAccount) {
                // Fetch Roblox avatar thumbnail
                let avatarUrl = null;
                try {
                    const thumbRes = await fetch(
                        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxAccount.id}&size=48x48&format=Png&isCircular=true`
                    );
                    const thumbData = await thumbRes.json();
                    if (thumbData.data && thumbData.data[0] && thumbData.data[0].imageUrl) {
                        avatarUrl = thumbData.data[0].imageUrl;
                    }
                } catch (e) {
                    console.error('Failed to fetch Roblox avatar:', e);
                }


                const Text = new TextDisplayBuilder().setContent('### Roblox Verification')
                const Text2 = new TextDisplayBuilder().setContent(`You already have the Roblox account [${robloxAccount.username}](https://www.roblox.com/users/${robloxAccount.id}/profile) linked.`)
                const Text3 = new TextDisplayBuilder().setContent('If you want to switch to a different account, click **Change Account** below.\n\n')
                const Text4 = new TextDisplayBuilder().setContent('If you’d like to continue using your current account, click **Continue.**')


                const media = new MediaGalleryBuilder()
      .addItems([
        {media: {url: 'https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=693af7ee&is=6939a66e&hm=8a279b553bbba0f063344f3c99b2b720e1ffbb70f3a6362cc3ec7280f2ded09c&=&format=webp&quality=lossless&width=2844&height=56'}}
      ])
                
                const seperator = new SeparatorBuilder();

                const thumbnail = new ThumbnailBuilder({
        media: {
            url: avatarUrl
        }
      })


                const button = new ButtonBuilder()
        .setLabel('Change Account')
        .setStyle(ButtonStyle.Link)
        .setURL('https://blox.link/')

        const continue1 = new ButtonBuilder()
        .setLabel('Continue')
        .setStyle(ButtonStyle.Success)
        .setCustomId('continue_account')


        const actionRow = new ActionRowBuilder().addComponents(button, continue1);

        const container = new ContainerBuilder()
       
      .addTextDisplayComponents(Text)
      .addTextDisplayComponents(Text2)
      .addTextDisplayComponents(Text3)
      .addTextDisplayComponents(Text4)
      .addSeparatorComponents(seperator)
      .addActionRowComponents(actionRow) 
      .addSeparatorComponents(seperator)
      .addMediaGalleryComponents(media)

                await interaction.reply({ 
                     flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                     components: [container]
                     
                });

                // Auto-delete after 15 seconds
                setTimeout(async () => {
                    try { await interaction.deleteReply(); } catch {}
                }, 15000);

            } else {
                const embed = new EmbedBuilder()
                    .setColor('#F8365E')
                    .setTitle('Roblox Verification')
                    .setDescription(
                        `We were unable to verify your account.\n\nPlease press the **Unable to Verify** button below to try again.`
                    )
                    .setImage('https://media.discordapp.net/attachments/1423154720884916394/1444773550287487037/image.png?ex=692dedb8&is=692c9c38&hm=d14dcada57b2a3c33c9e9c91b1c649eec46e8c76f54506880c43c0ff12c56c74&=&format=webp&quality=lossless&width=2560&height=128');

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Unable to Verify')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://blox.link/')
                );

                await interaction.reply({ embeds: [embed], components: [row], flags: 64 });

                setTimeout(async () => {
                    try { await interaction.deleteReply(); } catch {}
                }, 15000);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while verifying.', flags: 64 });
        }
    }
};
