const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const AssistanceModel = require('../models/AssistanceModel');
const orderStatus = require('../Database/order.js');

module.exports = {
    customID: 'order:menu',
    execute: async function (interaction, client, args) {
        const type = interaction.values[0];

        // Initial loading reply
        await interaction.reply({ 
            content: "<a:loading:1442378094110441584> Your order is being **created**.", 
            ephemeral: true 
        });

        // Wait 5 seconds before continuing
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check order status
        const status = orderStatus[type];
        if (status === "closed") {
            await interaction.editReply(
                "<:offline:1325808343348150333> The service you have selected is currently **closed**. Please check back later."
            );
            return;
        }

        let categoryId, designerRole;
        switch (type) {
            case 'clothing':
                categoryId = '1368363411808845964';
                designerRole = '1372543856872128586';
                break;
            case 'livery':
                categoryId = '1393828800286035968';
                designerRole = '1372543765599748117';
                break;
            case 'graphics':
                categoryId = '1393968819612942357';
                designerRole = '1373994721692618792';
                break;
            case 'discord':
                categoryId = '1394013196246843605';
                designerRole = '1389199853053149214';
                break;
            case 'photography':
                categoryId = '1393968819612942357';
                designerRole = '1373994721692618792';
                break;
        }

        // Create channel
        const channel = await interaction.guild.channels.create({
            name: `🔴・unclaimed`,
            parent: categoryId,
            type: 0,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.AttachFiles],
                    deny: [PermissionFlagsBits.SendMessages]
                },
                {
                    id: designerRole,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.AttachFiles
                    ]
                }
            ]
        });

        await AssistanceModel.create({
            userId: interaction.user.id,
            channelId: channel.id,
            type
        });

        const hrRoles = ['1425109106875695235', '1307537719081304176'];
        await Promise.all(
            hrRoles.map(roleId =>
                channel.permissionOverwrites.edit(roleId, {
                    ViewChannel: true,
                    SendMessages: true,
                    AttachFiles: true
                })
            )
        );

        // Main order message
        const mainMessage = await channel.send({
            content: `<@&${designerRole}> | ${interaction.user}`,
            embeds: [
                new EmbedBuilder()
                    .setColor('#393939')
                    .setImage('https://media.discordapp.net/attachments/1322790611383750707/1416512184132964483/image.png?ex=6931e6c6&is=69309546&hm=66f7a14286853a43c1c3afa9acebd02ca650dc53470f27238ba95e69b746dd29&=&format=webp&quality=lossless&width=2844&height=936'),
                new EmbedBuilder()
                    .setTitle(`Thank You For Choosing Takeoff Studios`)
                    .setDescription(`Thank you for choosing **Takeoff Studios!** You’ve successfully placed an order for **${type}**. While you wait for a designer to claim your request, please review the Terms of Service below to continue.`)
                    .setColor('#393939')
                    .setImage('https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=6931bd6e&is=69306bee&hm=c5e8470d00ae0940bfcbd5ed3f2e9ddd4e3b4fd15291eb7c628d74ce6d13a634&=&format=webp&quality=lossless&width=2844&height=56')
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('claim:button')
                        .setLabel('Claim')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('close2')
                        .setLabel('Close')
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        });

        await mainMessage.pin();

        // TOS embed
        const tosEmbed = new EmbedBuilder()
            .setColor('#393939')
            .setTitle("Agree To Terms of Service")
            .setDescription(
                "To continue with your order, you must first agree to the **Takeoff Studios** Terms of Service. These terms outline important details regarding payment, delivery timelines, revision policies, and expected client conduct. By proceeding, you confirm that you have read, understood, and accepted all conditions. Failure to comply may result in delays or cancellation of your order."
            )
            .setImage('https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=6931bd6e&is=69306bee&hm=c5e8470d00ae0940bfcbd5ed3f2e9ddd4e3b4fd15291eb7c628d74ce6d13a634&=&format=webp&quality=lossless&width=2844&height=56');

        const agreeButton = new ButtonBuilder()
            .setCustomId("p_195610463227088901")
            .setLabel("Agree")
            .setStyle(ButtonStyle.Secondary);

        const exitButton = new ButtonBuilder()
            .setCustomId("p_195610463402773200")
            .setLabel("Exit")
            .setStyle(ButtonStyle.Danger);

        const tosButton = new ButtonBuilder()
            .setCustomId("p_167454270457647108")
            .setLabel("Terms of Service")
            .setStyle(ButtonStyle.Secondary);

        await channel.send({
            embeds: [tosEmbed],
            components: [
                new ActionRowBuilder().addComponents(agreeButton, exitButton),
            ]
        });

        // Final confirmation edit after 5s loading
        await interaction.editReply(`Your order has been **created**, please head to this the ${channel} channel.`);
    }
};
