module.exports = {
  getChannelFromClient(client, id) {
    if (!client || !client.channels) return null;
    return client.channels.cache.get(id) || null;
  },
  getChannelFromGuild(guild, id) {
    if (!guild || !guild.channels) return null;
    return guild.channels.cache.get(id) || null;
  },
  getUser(client, id) {
    if (!client || !client.users) return null;
    return client.users.cache.get(id) || null;
  },
  getMessageFromChannel(channel, id) {
    if (!channel || !channel.messages) return null;
    return channel.messages.cache.get(id) || null;
  },
  getGuildMemberCount(guild) {
    if (!guild) return null;
    return typeof guild.memberCount === 'number' ? guild.memberCount : (guild.members && guild.members.cache ? guild.members.cache.size : null);
  }
};
