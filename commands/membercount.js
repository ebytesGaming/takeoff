const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Sends information on total membercount, online members and server boosts."),

  async execute(interaction) {
    const { guild } = interaction;

    // Avoid using guild.members.fetch() to prevent API calls; use cached counts where possible
    const totalMembers = guild.memberCount;

    const onlineMembers = guild.members.cache.filter(
      (member) => member.presence && member.presence.status !== "offline"
    ).size;

    const boostCount = guild.premiumSubscriptionCount || 0;

    const embed = new EmbedBuilder()
      .setTitle("Member Count")
      .setImage('https://media.discordapp.net/attachments/1413148427709186261/1437978034165514402/image.png?ex=6919d227&is=691880a7&hm=462c52ecab49bdb19c70ed40a18a1292645a2508fc6ae686a2ce451c810180de&=&format=webp&quality=lossless&width=2820&height=140')
      .setColor("#393939")
      .addFields(
        { name: "Total Members", value: totalMembers.toString(), inline: true },
        { name: "Online Members", value: onlineMembers.toString(), inline: true },
        { name: "Server Boosts", value: boostCount.toString(), inline: true }
      )

    await interaction.reply({ embeds: [embed] });
  },
};