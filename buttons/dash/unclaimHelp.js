const { 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder 
} = require('discord.js');
const DashboardHelpTicket = require('../../models/dashboardHelpSchema');

module.exports = {
  customID: 'unclaimHelp',
  async execute(interaction) {
    try {
      const channel = interaction.channel;
      const ticket = await DashboardHelpTicket.findOne({ channelId: channel.id });

      if (!ticket) {
        return interaction.reply({
          content: 'No ticket data found for this channel.',
          ephemeral: true
        });
      }

      // Allow the claimer, support role, guild owner, or administrators to unclaim
      const supportRoleId = '1364423646721998948';
      const isOwner = interaction.guild && interaction.guild.ownerId === interaction.user.id;
      const isAdmin = interaction.member && interaction.member.permissions && interaction.member.permissions.has && interaction.member.permissions.has('Administrator');
      if (ticket.claimedBy !== interaction.user.id && !interaction.member.roles.cache.has(supportRoleId) && !isOwner && !isAdmin) {
        return interaction.reply({
          content: `You can't unclaim a ticket you didn't claim.`,
          ephemeral: true
        });
      }

      ticket.claimedBy = null;
      await ticket.save();

      const embed = new EmbedBuilder()
        .setDescription(`This ticket has been unclaimed.`)
        .setColor('#242429');

      const claimButton = new ButtonBuilder()
        .setCustomId('claimHelp')
        .setLabel('Claim')
        .setStyle(ButtonStyle.Secondary);

      const closeButton = new ButtonBuilder()
        .setCustomId('closeHelp')
        .setLabel('Close')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

      await interaction.update({ components: [row] });
      await channel.send({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error unclaiming ticket:', error);
      await interaction.reply({ content: 'An error occurred while unclaiming the ticket.', ephemeral: true });
    }
  }
};