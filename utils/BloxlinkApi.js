const fetch = require('node-fetch');
const BLOXLINK_API_KEY = "1ec19053-4964-4624-ad12-48c172253daa";

async function getRobloxAccount(guildId, userId) {
  const res = await fetch(
    `https://api.blox.link/v4/public/guilds/${guildId}/discord-to-roblox/${userId}`,
    { headers: { Authorization: BLOXLINK_API_KEY } }
  );

  const data = await res.json();

  if (!data.robloxID) {
    return null;
  }

  let username = 'Unknown';
  try {
    const userRes = await fetch(`https://users.roblox.com/v1/users/${data.robloxID}`);
    const userData = await userRes.json();
    if (userData.name) username = userData.name;
  } catch (e) {
    console.error('Failed to fetch Roblox username:', e);
  }

  const robloxAccount = `**[${username}](https://www.roblox.com/users/${data.robloxID}/profile)**  (${data.robloxID})`;
  const robloxName = `**[${username}](https://www.roblox.com/users/${data.robloxID}/profile)**`;

  return {
    id: data.robloxID,
    username,
    format: `**[${username}](https://www.roblox.com/users/${data.robloxID}/profile)**`,
    account: `**[${username}](https://www.roblox.com/users/${data.robloxID}/profile)** (${data.robloxID})`,
    link: `https://www.roblox.com/users/${data.robloxID}/profile`
  };
}

module.exports = { getRobloxAccount };