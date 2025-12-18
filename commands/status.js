const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- CONFIG ---
const SERVICE_CHANNEL_ID = '1416511879572099327'; 
const SERVICE_MESSAGE_ID = '1442378492640755877'; 

const STATUS_EMOJIS = {
    'closed': '<:close1:1437658067629248512><:close2:1437658130212323389>',
    'premium': '<:L1:1434365353131118694><:L2:1434365355773395064><:L3:1434365358302564493>',
    'delayed': '<:D1:1434365219248799908><:D2:1434365226467459303><:D3:1434365350320930836>',
    'opened': '<:opened1:1437658189394083881><:opened2:1437658225708236871>',
};

const SERVICE_FIELDS = [
    { name: 'liveries', title: 'Liveries' },
    { name: 'graphics', title: 'Graphics' },
    { name: 'clothing', title: 'Clothing' },
    { name: 'discord', title: 'Discord' },
    { name: 'photography', title: 'Photography' },
    { name: 'bots', title: 'Discord Bots' }
];

const STATUS_FILE_PATH = path.join(process.cwd(), 'database', 'order.js');

function loadStatusData() {
    if (!fs.existsSync(STATUS_FILE_PATH)) {
        const defaultStatus = {};
        SERVICE_FIELDS.forEach(field => { defaultStatus[field.name] = 'opened'; });
        const fileContent = `module.exports = ${JSON.stringify(defaultStatus, null, 4)};\n`;
        fs.mkdirSync(path.dirname(STATUS_FILE_PATH), { recursive: true });
        fs.writeFileSync(STATUS_FILE_PATH, fileContent);
        return defaultStatus;
    }
    delete require.cache[require.resolve(STATUS_FILE_PATH)];
    return require(STATUS_FILE_PATH);
}

function saveStatusData(statusData) {
    const fileContent = `module.exports = ${JSON.stringify(statusData, null, 4)};\n`;
    fs.writeFileSync(STATUS_FILE_PATH, fileContent);
}

// --- COMMAND ---
module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Manages the live service status message.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('change')
                .setDescription('Update the status emojis for one or more service fields.')
                .addStringOption(option => option.setName('liveries').setDescription('Set status for Liveries.')
                    .addChoices({ name: 'Opened', value: 'opened' }, { name: 'Delayed', value: 'delayed' }, { name: 'Premium', value: 'premium' }, { name: 'Closed', value: 'closed' }))
                .addStringOption(option => option.setName('graphics').setDescription('Set status for Graphics.')
                    .addChoices({ name: 'Opened', value: 'opened' }, { name: 'Delayed', value: 'delayed' }, { name: 'Premium', value: 'premium' }, { name: 'Closed', value: 'closed' }))
                .addStringOption(option => option.setName('clothing').setDescription('Set status for Clothing.')
                    .addChoices({ name: 'Opened', value: 'opened' }, { name: 'Delayed', value: 'delayed' }, { name: 'Premium', value: 'premium' }, { name: 'Closed', value: 'closed' }))
                .addStringOption(option => option.setName('discord').setDescription('Set status for Discord.')
                    .addChoices({ name: 'Opened', value: 'opened' }, { name: 'Delayed', value: 'delayed' }, { name: 'Premium', value: 'premium' }, { name: 'Closed', value: 'closed' }))
                .addStringOption(option => option.setName('photography').setDescription('Set status for Photography.')
                    .addChoices({ name: 'Opened', value: 'opened' }, { name: 'Delayed', value: 'delayed' }, { name: 'Premium', value: 'premium' }, { name: 'Closed', value: 'closed' }))
                .addStringOption(option => option.setName('bots').setDescription('Set status for Discord Bots.')
                    .addChoices({ name: 'Opened', value: 'opened' }, { name: 'Delayed', value: 'delayed' }, { name: 'Premium', value: 'premium' }, { name: 'Closed', value: 'closed' }))
        ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() !== 'change') return;

        // Defer immediately to avoid "Unknown interaction"
        await interaction.deferReply({ flags: 64 });

        const incomingUpdates = SERVICE_FIELDS.map(field => ({
            name: field.name,
            title: field.title,
            status: interaction.options.getString(field.name)
        })).filter(item => item.status);

        if (incomingUpdates.length === 0) {
            return interaction.editReply({ content: '<:TAKEOFFSTUIDOSx_:1397886067008344167> You must specify at least one service status to update.' });
        }

        try {
            const currentStatusData = loadStatusData();
            let hasUpdated = false;

            for (const update of incomingUpdates) {
                if (currentStatusData[update.name] !== update.status) {
                    currentStatusData[update.name] = update.status;
                    hasUpdated = true;
                }
            }

            if (!hasUpdated) {
                return interaction.editReply({ content: '<:TAKEOFFSTUIDOSx_:1397886067008344167> All specified services are already set to the chosen status. No changes were made.' });
            }

            saveStatusData(currentStatusData);

            const targetChannel = await interaction.client.channels.fetch(SERVICE_CHANNEL_ID);
            const targetMessage = await targetChannel.messages.fetch(SERVICE_MESSAGE_ID).catch(() => null);

            if (!targetMessage || targetMessage.embeds.length < 2) {
                return interaction.editReply({ content: "<:TAKEOFFSTUIDOSx_:1397886067008344167> I was unable to edit the service statuses. Please contact the bot developer." });
            }

            const bannerEmbed = EmbedBuilder.from(targetMessage.embeds[0]);
            const serviceEmbed = EmbedBuilder.from(targetMessage.embeds[1]);

            const newFields = SERVICE_FIELDS.map(field => {
                const status = currentStatusData[field.name] || 'closed';
                return {
                    name: field.title,
                    value: `${STATUS_EMOJIS[status]}  `,
                    inline: true
                };
            });

            serviceEmbed.setFields(newFields);

            await targetMessage.edit({
                embeds: [bannerEmbed, serviceEmbed],
                components: targetMessage.components
            });

            await interaction.editReply({ content: `<:TAKEOFFSTUIDOScheck:1397886102723100754> Service statuses have successfully been updated.` });

        } catch (error) {
            console.error('Error executing status command:', error);
            if (error.code === 50001) {
                return interaction.editReply({ content: `<:TAKEOFFSTUIDOSx_:1397886067008344167> The bot is missing permissions (e.g., \`VIEW_CHANNEL\`, \`READ_MESSAGE_HISTORY\`).` });
            }
            return interaction.editReply({ content: `An unexpected error occurred: ${error.message}` });
        }
    }
};
