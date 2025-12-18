const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
  const DiscordTranscripts = require('discord-html-transcripts');
  const DashboardHelpTicket = require('../models/dashboardHelpSchema');
  
  const LOG_CHANNEL_ID = '1307537720712757302'; // Replace with transcript channel id
  
  module.exports = {
    customID: 'closeModal',
  
    async execute(interaction) {
      const channel = interaction.channel;
      const closer = interaction.user;
      const reason = interaction.fields.getTextInputValue('closeReason') || 'No reason provided.';
  
      try {
        await interaction.reply({
          content: 'This ticket is being closed.',
          ephemeral: true,
        });
  
        const ticket = await DashboardHelpTicket.findOne({ channelId: channel.id });
        if (!ticket) {
          return interaction.editReply({ content: 'Ticket not found in database.', ephemeral: true });
        }
  
        await DashboardHelpTicket.findOneAndUpdate(
          { channelId: channel.id },
          {
            status: 'closed',
            closedBy: closer.id,
            closeReason: reason,
          }
        );
  
        const transcript = await DiscordTranscripts.createTranscript(channel, {
          limit: -1,
          returnType: 'buffer',
          filename: `${ticket.username}-${ticket.ticketId}.html`,
          saveImages: true
        });
  
        const transcriptFile = new AttachmentBuilder(transcript, {
          name: `${ticket.username}-${ticket.ticketId}.html`,
        });
  
        const dmEmbed = new EmbedBuilder()
          .setTitle('<:Ticket:1409269775300825138> Ticket Closed') // Your Title
          .setColor('#393939') // Your custom hex color
          .setDescription(`- Your ticket in **Takeoff Studios** has been closed. We **appreciate** you taking the time to reach out to our team regarding your concern. Your communication helps us** better support our community and address issues effectively.** If you need any further assistance, please feel free to open a new ticket at any time.`) // Your description
          .addFields(
            { name: 'Closure Reason', value: reason, inline: true },
            { name: 'Closed By', value: `<@${closer.id}>`, inline: true }
          )
          .setFooter({ text: `Ticket ID: ${ticket.ticketId}` })
          .setImage("https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=69248e6e&is=69233cee&hm=23b11315b8e5ccc0664390c369f91b0eab516b6157ac505af67ebffb7ea82404&=&format=webp&quality=lossless&width=2844&height=56");
  
        const logEmbed = new EmbedBuilder()
          .setTitle('Support Ticket Closed') // Your Title
          .setColor('#393939') // Your custom hex color
          .setImage("https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=69248e6e&is=69233cee&hm=23b11315b8e5ccc0664390c369f91b0eab516b6157ac505af67ebffb7ea82404&=&format=webp&quality=lossless&width=2844&height=56") // Your image url
          .addFields(
            { name: 'Closure Reason', value: reason, inline: true },
            { name: 'Closed By', value: `<@${closer.id}>`, inline: true },
          )
          .setFooter({ text: `User ID: ${ticket.userId} | Ticket ID: ${ticket.ticketId}` });
  
        // Use cache-only lookups to avoid calling API fetch
        const logChannel = interaction.client?.channels?.cache?.get(LOG_CHANNEL_ID) || null;

        if (logChannel?.isTextBased()) {
          await logChannel.send({
            embeds: [logEmbed],
            files: [transcriptFile]
          }).catch(() => null);
        }

        const user = interaction.client?.users?.cache?.get(ticket.userId) || null;
        if (user) {
          await user.send({ embeds: [dmEmbed] }).catch(() => null);
        }
  
        await channel.delete();
  
      } catch (error) {
        console.error('Error closing ticket:', error);
      }
    }
  };
  