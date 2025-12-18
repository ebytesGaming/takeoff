const { SlashCommandBuilder, EmbedBuilder, ChannelType, ApplicationCommandOptionType } = require('discord.js');

// --- Configuration ---
// Forum Channel ID for Portfolio Showcase
const PORTFOLIO_FORUM_ID = '1434351301038309469'; 
// Banner Image URL provided by user
const PORTFOLIO_BANNER_IMAGE = 'https://media.discordapp.net/attachments/1434351345003135127/1434678990941196349/Screenshot_2025-07-22_at_11.35.35CAM.png?ex=6909346e&is=6907e2ee&hm=e9dec907af7dcb60ef46bab93ea2c386045fb239ba7ca191f0eb4df7500d8092&=&format=webp&quality=lossless&width=2358&height=1322';
const commonColor = 0x176EFE; // Standard embed color

// Map boolean options to their display names and corresponding Forum Tag IDs
const SERVICE_TAG_MAP = {
    livery: { display: '🚗 Liveries', tagId: '1434629734838304999' },
    uniforms: { display: '👕 Uniforms / Clothing', tagId: '1434629763540062250' },
    bot: { display: '🤖 Discord Bots', tagId: '1434629843168788572' },
    discord: { display: '⚙️ Discord Services', tagId: '1434629800965836931' },
    graphics: { display: '🖼️ Graphics', tagId: '1434629892481355896' },
    // photography has been removed as per the user request
};
// --- End Configuration ---

module.exports = {
    // Define the slash command structure
    data: new SlashCommandBuilder()
        .setName('portfolio')
        .setDescription('Staff command to create or manage staff portfolios.')
        .addSubcommand(subcommand => {
            subcommand
                .setName('create')
                .setDescription('Creates a new staff portfolio entry in the showcase forum.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The staff member whose portfolio is being created.')
                        .setRequired(true));
            
            // Dynamically add boolean options from the SERVICE_TAG_MAP keys
            Object.keys(SERVICE_TAG_MAP).forEach(key => {
                // Capitalize the first letter for the option name display
                const name = key.charAt(0).toUpperCase() + key.slice(1);
                
                subcommand.addBooleanOption(option =>
                    option.setName(key)
                        .setDescription(`Does the user offer ${name}?`)
                        .setRequired(true));
            });

            return subcommand;
        }),

    // Execute function for the command
    async execute(interaction) {
        // Defer the reply for an ephemeral message while processing
        await interaction.deferReply({ ephemeral: true });

        // Ensure the 'create' subcommand was used
        if (interaction.options.getSubcommand() !== 'create') {
            return interaction.editReply({ content: 'Invalid subcommand. Use `/portfolio create`.', ephemeral: true });
        }

        // 1. Get options and filter for offered services
        const targetUser = interaction.options.getUser('user');
        const appliedTagIDs = [];
        const offeredServicesList = [];
        
        // Iterate through the map to check options and build tags/display list
        Object.keys(SERVICE_TAG_MAP).forEach(key => {
            const isOffered = interaction.options.getBoolean(key);
            
            if (isOffered) {
                const service = SERVICE_TAG_MAP[key];
                // Add tag ID for the forum post
                appliedTagIDs.push(service.tagId);
                // Add display text for the embed
                offeredServicesList.push(`- ${service.display}`);
            }
        });

        const servicesField = offeredServicesList.length > 0
            ? offeredServicesList.join('\n')
            : '*(No services currently marked as offered)*';

        // 2. Build the Primary Embed (Portfolio Card)
        const primaryEmbed = new EmbedBuilder()
            .setColor(commonColor)
            .setTitle(`Portfolio: ${targetUser.username}`)
            .setDescription(`Welcome to the portfolio thread for **${targetUser.username}**! This staff member is authorized to take commissions for the services listed below.`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
            .setImage(PORTFOLIO_BANNER_IMAGE)
            .addFields(
                { name: 'Staff Member', value: `<@${targetUser.id}>`, inline: true },
                { name: 'Services Offered', value: servicesField, inline: false }
            )
            .setTimestamp();
        
        // 3. Build the Secondary Embed (Placeholder)
        const banner = new EmbedBuilder()
        .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406728757280939/SaturnStudiosBanner.png?ex=690836de&is=6906e55e&hm=1510d22496ee816d3d487cc02dc1b9ce0ee06490a192635849d61625f14ba9ec&=&format=webp&quality=lossless&width=1768&height=512')
        .setColor(commonColor);

        const secondaryEmbed = new EmbedBuilder()
            .setColor(commonColor)
            .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=690836ed&is=6906e56d&hm=73ea1cdb4faf2ebd0b51bce81aa46f1e2265fa7d14fdacec724f229eb87c75dd&=&format=webp')
            .setTitle(`Portfolio`)
            .setDescription(`<:awave:1409419834487214202> Hey! Below this message contains the portfolio for one of our amazing designers here at Saturn Studios. This allows you to see some of there work before ordering from them, to have the most effective order.`);


        // 4. Get the Forum Channel
        const forumChannel = interaction.guild.channels.cache.get(PORTFOLIO_FORUM_ID);

        // Basic validation for the channel
        if (!forumChannel || forumChannel.type !== ChannelType.GuildForum) {
            return interaction.editReply({ content: `Error: The configured Portfolio Forum Channel ID (\`${PORTFOLIO_FORUM_ID}\`) is invalid or not a forum channel. Please check the configuration.`, ephemeral: true });
        }
        
        // 5. Create the Forum Post (Thread)
        try {
            const newPost = await forumChannel.threads.create({
                name: `${targetUser.username}'s Portfolio`,
                // Apply the collected tags here
                appliedTags: appliedTagIDs, 
                message: {
                    content: PORTFOLIO_BANNER_IMAGE, 
                },
                reason: `New portfolio entry created by ${interaction.user.tag}.`
            });

            // 6. Send the secondary embed message immediately after
            await newPost.send({ embeds: [banner, secondaryEmbed] });

            // 7. Send success message
            await interaction.editReply({ 
                content: `✅ Successfully created **${targetUser.username}'s Portfolio** post: ${newPost.toString()}`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error creating portfolio post:', error);
            // Check for specific error related to invalid tags
            if (error.code === 40060) {
                 await interaction.editReply({ content: `❌ An error occurred: One or more of the specified tags (\`${appliedTagIDs.join(', ')}\`) are invalid, inactive, or not applicable in that forum channel. Please verify the tag IDs.`, ephemeral: true });
            } else {
                 await interaction.editReply({ content: `❌ An unexpected error occurred while creating the portfolio post. Please check the bot's permissions. Error: \`${error.message}\``, ephemeral: true });
            }
        }
    }
};
