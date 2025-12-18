const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'messageCreate',
  once: false,

  async execute(...args) {
    try {
      // Find the Message object (supports various loader signatures)
      let message = args.find(a => a && typeof a === 'object' && a.author && a.channel) || args[0];
      if (!message || !message.author) return;
      if (message.author.bot) return;
      if (!message.guild) return;

      // Keep this embed (unchanged)
      const antiPingEmbed = new EmbedBuilder()
        .setColor('#393939') // Orange warning color
        .setTitle('<:TAKEOFFStudios:1419840091651575910> Anti Ping')
        .setDescription(
          'The user you tried to ping/mention/reply has a role that is blocked from being pinged.\n\n' +
          'Please refrain from pinging this user. If you are using Discord’s reply feature, ensure the "Mention" option is disabled.'
        )
        .setImage('https://media.discordapp.net/attachments/1322790611383750707/1413724988149600349/Untitled_design_33.png?ex=6925c8be&is=6924773e&hm=28f4a7308715614c3c4cdd26941ddbad092c8279e7c70c71d975794bf6e368f4&=&format=webp&quality=lossless&width=2844&height=56');

      // Forward behavior for the specific target mention
      const TARGET_ID = '1396979947284729856';
      const hasLiteralMention = typeof message.content === 'string' && message.content.includes(`<@${TARGET_ID}>`);
      const hasResolvedMention = Boolean(message.mentions && message.mentions.users && message.mentions.users.has && message.mentions.users.has(TARGET_ID));

      if (hasLiteralMention || hasResolvedMention) {
        // Forward the mention and original content, then post the embed
        await message.channel.send({ embeds: [antiPingEmbed], content [`${message.author}`] }).catch(() => {});
      }
    } catch (err) {
      console.error('ping event handler error:', err);
    }
  }
};