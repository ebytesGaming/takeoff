const { Events, ActivityType, Client, PermissionsBitField, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
// 1. IMPORT NOBLOX.JS
const noblox = require('noblox.js');
// 2. IMPORT THE MONITOR FUNCTION
const monitorTransactions = require('./utils/monitorTransactions.js');

const client = new Client({
    intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildPresences",
        "DirectMessages",
        "MessageContent"
    ]
});

client.config = require('./config.json');
client.cooldowns = new Map();
client.cache = new Map();
client.messages = new Map();

require('./utils/ComponentLoader.js')(client);
require('./utils/EventLoader.js')(client);
require('./utils/RegisterCommands.js')(client);

// --- START ROBlox LOGIN / DB Connection ---
(async function() {
    // Attempt Noblox login first
    try {
        if (!client.config.ROBLOXTOKEN || client.config.ROBLOXTOKEN === 'YOUR_ROBLOX_SECURITY_COOKIE_HERE') {
            console.warn('Skipping Roblox login: ROBLOXTOKEN is not set in config.json.');
        } else {
            // Log in using the ROBLOXTOKEN from the config
            await noblox.setCookie(client.config.ROBLOXTOKEN);
            console.log('Noblox logged in successfully to Roblox.');
        }
    } catch (err) {
        console.error('Failed to log in to Roblox using the provided ROBLOXTOKEN:', err);
    }
    
    // Database connection next
    if (!client.config.mongoURL) {
        console.warn('Skipping database connection');
    } else {
        await mongoose.connect(client.config.mongoURL);
        console.log('I have connected to the database succesfully');
    }
})();
// --- END Roblox LOGIN / DB Connection ---

// --- NEW LOGGING CONSTANTS AND FUNCTION ---
const COMMAND_LOG_CHANNEL_ID = '1434351351881535580';

/**
 * Logs command execution details to a designated channel.
 * @param {import('discord.js').Client} client - The Discord client.
 * @param {import('discord.js').Interaction|import('discord.js').Message} source - The interaction or message object.
 * @param {string} commandName - The name of the command executed.
 * @param {string} commandType - 'Slash' or 'Prefix'
 * @param {string} optionsString - Formatted string of options/arguments.
 */
async function LogCommandExecution(client, source, commandName, commandType, optionsString) {
    const user = source.user || source.author;
    const channel = source.channel;

    const embed = new EmbedBuilder()
        .setTitle(`\`${commandName}\` Command Run (${commandType})`)
        .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=690a312d&is=6908dfad&hm=84da8544c9601b08609eb1eb1e77f60b4941bb2f6102ec5d4c700c9c9b46af18&=&format=webp&width=2844&height=186')
        .setDescription(`<@${user.id}> (${user.id}), has ran the \`${commandName}\` command.`)
        .setColor(`#176EFE`)
        .addFields(
            { 
                name: 'User', 
                value: `${user.tag} (\`${user.id}\`)`, 
                inline: true 
            },
            { 
                name: 'Channel', 
                value: channel ? `#${channel.name} (\`${channel.id}\`)` : 'DM', 
                inline: true 
            },
            { 
                name: 'Time', 
                value: `<t:${Math.floor(Date.now() / 1000)}:F>`, // Display full timestamp
                inline: true 
            },
            { 
                name: 'Options/Arguments', 
                value: optionsString || 'None provided.', 
                inline: false 
            }
        )
        .setTimestamp();

    try {
        // Resolve the log channel from cache to avoid API fetch
        const logChannel = client.channels.cache.get(COMMAND_LOG_CHANNEL_ID) || null;
        if (logChannel && logChannel.isTextBased()) {
            await logChannel.send({ embeds: [embed] }).catch(() => {});
        }
    } catch (e) {
        console.error('Failed to send command log:', e.message);
    }
}
// --- END NEW LOGGING FUNCTION ---


client.login(client.config.TOKEN);

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Watching Saturn Studios', { type: ActivityType.Custom });
    
    // 3. CALL THE MONITOR FUNCTION AFTER DISCORD IS READY
    // This starts the transaction checking interval process.
    monitorTransactions(client); 
});


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = client.config.prefix;
    if (!prefix || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.messages.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args, client);

        // --- NEW: LOG PREFIX COMMAND EXECUTION ---
        const optionsString = args.length > 0 ? `\`${args.join(' ')}\`` : '';
        await LogCommandExecution(client, message, commandName, 'Prefix', optionsString);
        // --- END NEW LOGGING ---

    } catch (error) {
        console.error(error);
        message.reply(`There was an error running this command:\n\`\`\`${error.message || error}\`\`\``);
    }
});

async function InteractionHandler(interaction, type) {
    let customId = interaction.customId ?? interaction.commandName;

    // FIX ADDED HERE: If it's a modal, we only use the prefix of the customId 
    // (e.g., 'channel_modal_submit' from 'channel_modal_submit:general_support') 
    // to find the correct handler file.
    if (interaction.isModalSubmit()) {
        customId = customId.split(':')[0]; 
    }

    const component = client[type].get(customId);
    if (!component) return;
    try {
        await component.execute(interaction, client);
        
        // --- NEW: LOG SLASH COMMAND EXECUTION ---
        if (interaction.isCommand()) {
            const commandName = interaction.commandName;
            
            // Format options for logging
            let optionsString = interaction.options.data.map(option => 
                `\`${option.name}\`: ${option.value}`
            ).join('\n');

            await LogCommandExecution(client, interaction, commandName, 'Slash', optionsString);
        }
        // --- END NEW LOGGING ---

    } catch (error) {
        console.error(error);
        await interaction.deferReply({ ephemeral: true }).catch(() => {});
        await interaction.editReply({
            content: `There was an error while executing this command!\n\`\`\`${error}\`\`\``,
            embeds: [],
            components: [],
            files: []
        }).catch(() => {});
    }
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) return InteractionHandler(interaction, 'commands');
    if (interaction.isButton()) return InteractionHandler(interaction, 'buttons');
    if (interaction.isStringSelectMenu()) return InteractionHandler(interaction, 'dropdowns');
    if (interaction.isModalSubmit()) return InteractionHandler(interaction, 'modals');
});
