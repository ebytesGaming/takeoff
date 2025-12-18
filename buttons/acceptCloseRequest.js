const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
  const DiscordTranscripts = require('discord-html-transcripts');
  // NOTE: Keeping the relative path based on your existing file structure
  const DashboardHelpTicket = require('../models/dashboardHelpSchema');
  
  const LOG_CHANNEL_ID = '1434351353601331485'; // Replace with transcript channel id
  
  module.exports = {
    customID: 'closerequest_accept', // UPDATED: New custom ID for the button
  
    async execute(interaction) {
      console.log(`acceptCloseRequest invoked by ${interaction.user?.id} in channel ${interaction.channel?.id}`);
      // Defer the reply, as transcript and deletion can take a moment
      await interaction.deferReply({ ephemeral: true }); 

      const channel = interaction.channel;
      const closer = interaction.user;
      
      // FIXED: Since this is a button, we set a default reason instead of reading modal input.
      const reason = 'Close request accepted and processed by staff.'; 
  
      try {
        const ticket = await DashboardHelpTicket.findOne({ channelId: channel.id });
        if (!ticket) {
          return interaction.editReply({ content: 'Ticket not found in database.', ephemeral: true });
        }
  
        // 1. Update Database Status
        await DashboardHelpTicket.findOneAndUpdate(
          { channelId: channel.id },
          {
            status: 'closed',
            closedBy: closer.id,
            closeReason: reason,
          }
        );
  
        // 2. Generate Transcript
        const transcript = await DiscordTranscripts.createTranscript(channel, {
          limit: -1,
          returnType: 'buffer',
          filename: `${ticket.username}-${ticket.ticketId}.html`,
          saveImages: true
        });
  
        const transcriptFile = new AttachmentBuilder(transcript, {
          name: `${ticket.username}-${ticket.ticketId}.html`,
        });
  
        // 3. Prepare Embeds
        const dmEmbed = new EmbedBuilder()
          .setTitle('<:Ticket:1409269775300825138> Ticket Closed')
          .setColor('#176EFE')
          .setDescription(`- Your ticket in **Saturn** has been closed. We **appreciate** you taking the time to reach out to our team regarding your concern. Your communication helps us** better support our community and address issues effectively.** If you need any further assistance, please feel free to open a new ticket at any time.`)
          .addFields(
            { name: 'Closure Reason', value: reason, inline: true },
            { name: 'Closed By', value: `<@${closer.id}>`, inline: true }
          )
          .setFooter({ text: `Ticket ID: ${ticket.ticketId}` })
          .setImage('https://media.discordapp.net/attachments/1400355826773921812/1437161924134699149/EmbedBottomBanner.webp?ex=69123cd7&is=6910eb57&hm=b61ac4bb9028d2f1d03bc4c14cb649d4c6b00584318ba6a9b9503c75a670e9a7&=&format=webp&width=2844&height=186');
  
        const logEmbed = new EmbedBuilder()
          .setTitle('Support Ticket Closed')
          .setColor('#176EFE')
          .setImage('https://media.discordapp.net/attachments/1400355826773921812/1437161924134699149/EmbedBottomBanner.webp?ex=69123cd7&is=6910eb57&hm=b61ac4bb9028d2f1d03bc4c14cb649d4c6b00584318ba6a9b9503c75a670e9a7&=&format=webp&width=2844&height=186')
          .addFields(
            { name: 'Closure Reason', value: reason, inline: true },
            { name: 'Closed By', value: `<@${closer.id}>`, inline: true },
          )
          .setFooter({ text: `User ID: ${ticket.userId} | Ticket ID: ${ticket.ticketId}` });
  
        // 4. Log and DM Transcript
        const logChannel = await interaction.client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);

        if (logChannel?.isTextBased()) {
          await logChannel.send({
            embeds: [logEmbed],
            files: [transcriptFile]
          });
        }
  
        const user = await interaction.client.users.fetch(ticket.userId).catch(() => null);
        if (user) {
          await user.send({ embeds: [dmEmbed] }).catch(() => null);
        }
  
        // 5. Delete Channel
        await channel.delete();
  
      } catch (error) {
        console.error('Error closing ticket:', error);
        await interaction.editReply({ 
            content: '❌ An error occurred while closing the ticket. Check the console for details.',
            ephemeral: true
        });
      }
    }
  };