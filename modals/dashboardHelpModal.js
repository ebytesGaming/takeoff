const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');
const Ticket = require('../models/dashboardHelpSchema');
const { getRobloxAccount } = require('../utils/BloxlinkApi');

module.exports = {
  customID: 'dashboardHelpModal',

  async execute(interaction) {
    try {
      const reason = interaction.fields.getTextInputValue('dashboardInquiryReason');

      // Initial reply
      await interaction.reply({ content: '<a:loading:1442378094110441584> Your ticket is being created.', ephemeral: true });

      const roblox = await getRobloxAccount(interaction.guild.id, interaction.user.id) || 'No Linked Account';

      const guild = interaction.guild;
      const opener = interaction.user;
      const supportRoleId = '1364423646721998948'; // Support role ID
      const ticketCategoryId = '1365465029440442469'; // Ticket category ID
      const channelName = `${opener.username}-ticket`;

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketCategoryId,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: opener.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          },
          {
            id: supportRoleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }
        ]
      });

      const ticketId = ticketChannel.id;

      // Large banner embed
      const imageEmbed = new EmbedBuilder()
        .setImage('https://media.discordapp.net/attachments/1322790611383750707/1416105246807035955/image.png?ex=69248e48&is=69233cc8&hm=2bdb3557359af00c8b71254214d8919ab01973aefcd9e78b0fe8499d93719bcf&=&format=webp&quality=lossless&width=2844&height=936')
        .setColor('#393939');

      // Help embed with small banner
      const helpEmbed = new EmbedBuilder()
        .setDescription(`Thank you for contacting **Takeoff Studios** support. A staff member has been notified and will assist you shortly.`)
        .addFields(
          { name: 'Inquiry', value: reason, inline: true },
          { name: 'Roblox Information', value: typeof roblox === 'string' ? roblox : roblox.format, inline: true }
        )
        .setColor('#393939')
        .setImage('https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=69248e6e&is=69233cee&hm=23b11315b8e5ccc0664390c369f91b0eab516b6157ac505af67ebffb7ea82404&=&format=webp&quality=lossless&width=2844&height=56');

      const claimButton = new ButtonBuilder()
        .setLabel('Claim')
        .setCustomId('claimHelp')
        .setStyle(ButtonStyle.Secondary);

      const closeButton = new ButtonBuilder()
        .setLabel('Close')
        .setCustomId('closeHelp')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

      await ticketChannel.send({
        content: `<@${opener.id}> | @here`,
        embeds: [imageEmbed, helpEmbed],
        components: [row]
      });

      await Ticket.create({
        userId: opener.id,
        username: opener.username,
        channelId: ticketChannel.id,
        reason,
        status: 'open',
        createdAt: new Date(),
        claimedBy: null,
        closedBy: null,
        ticketId
      });

      await interaction.editReply({ content: `<:TAKEOFFSTUIDOSarrow:1429657493713453087> Your ticket has been successfully created - <#${ticketChannel.id}>` });

    } catch (error) {
      console.error('Error creating ticket from modal:', error);
      await interaction.editReply({ content: 'An error occurred while creating the ticket.', ephemeral: true });
    }
  }
};
