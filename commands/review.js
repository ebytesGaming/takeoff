const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('review')
        .setDescription('Leave a review for a developer')
        .addUserOption(option =>
            option.setName('developer')
                .setDescription('The developer you are reviewing')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('product')
                .setDescription('Product developed')
                .setRequired(true)
                .addChoices(
                    { name: 'Livery', value: 'Livery' },
                    { name: 'Photography', value: 'Photography' },
                    { name: 'Discord Bot', value: 'Bot' },
                    { name: 'Discord', value: 'Discord' },
                    { name: 'Uniforms', value: 'Uniforms' },
                    { name: 'Graphics', value: 'Graphics' },
                ))
        .addStringOption(option =>
            option.setName('review')
                .setDescription('Star rating of the service')
                .setRequired(true)
                .addChoices(
                    { name: '⭐', value: '1' },
                    { name: '⭐⭐', value: '2' },
                    { name: '⭐⭐⭐', value: '3' },
                    { name: '⭐⭐⭐⭐', value: '4' },
                    { name: '⭐⭐⭐⭐⭐', value: '5' },
                ))
        .addStringOption(option =>
            option.setName('feedback')
                .setDescription('Feedback about the service')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const requiredRoleId = '1323743444858044427'; // Role required to use the command

            // Permission check
            if (!interaction.member.roles.cache.has(requiredRoleId)) {
                return interaction.reply({
                    content: 'You do not have permission to use this command.',
                    ephemeral: true
                });
            }

            const developer = interaction.options.getUser('developer');
            const product = interaction.options.getString('product');
            const ratingInput = interaction.options.getString('review');
            const feedback = interaction.options.getString('feedback');

            // Map rating to stars
            const starEmoji = '<:TAKEOFFSTUIDOSstar:1423058797177606285>';
            const review = starEmoji.repeat(Number(ratingInput));

            // Fetch review channel properly
            const reviewChannelId = '1386183731542229042';
            const reviewChannel = await interaction.guild.channels.fetch(reviewChannelId).catch(() => null);

            if (!reviewChannel) {
                return interaction.reply({ content: 'Could not find the review channel.', ephemeral: true });
            }

            
            const embed = new EmbedBuilder()
                .setColor('#393939')
                .setDescription('> Thank you for taking your time to tell us your experience! Come back again to “TAKEOFF your server!” <:TAKEOFFStudios:1419840091651575910>')
                .setTitle('New Review')
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .addFields(
                    { name: 'Developer', value: `<@${developer.id}>`, inline: true },
                    { name: 'Product', value: product, inline: true },
                    { name: 'Rating', value: review, inline: true },
                    { name: 'Feedback', value: feedback },
                )
                .setImage('https://media.discordapp.net/attachments/1322790611383750707/1442309586559172658/image.png?ex=6924f6fa&is=6923a57a&hm=b9af3f8427c34cb9a0f2a25003c06f24b3cf3115458547cd83ee1e445a020d3a&=&format=webp&quality=lossless&width=2844&height=56');

            // Send embed to review channel
            await reviewChannel.send({ embeds: [embed] });

            // Confirm to user
            await interaction.reply({ content: 'Your review has been submitted successfully!', ephemeral: true });

        } catch (err) {
            console.error('Error submitting review:', err);
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error submitting the review. Please try again later.', ephemeral: true });
            }
        }
    }
};
