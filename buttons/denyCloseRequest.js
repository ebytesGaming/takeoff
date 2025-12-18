module.exports = {
  customID: 'p_232186922779283461',

  async execute(interaction) {
    try {
      // Delete the message containing the close request buttons (if possible)
      const message = interaction.message || null;
      if (message && message.deletable) {
        await message.delete().catch(() => null);
      }

      // Inform the channel that the close request was denied
      await interaction.channel.send({ content: 'Ticket Close Request Was Denied' }).catch(() => null);

      // Acknowledge the button interaction (ephemeral reply to the clicker)
      await interaction.reply({ content: 'Close request denied.', ephemeral: true }).catch(() => {});
    } catch (err) {
      console.error('Error handling deny close request button:', err);
      await interaction.reply({ content: 'An error occurred while denying the close request.', ephemeral: true }).catch(() => {});
    }
  }
};
