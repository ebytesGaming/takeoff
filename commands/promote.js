const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, Component } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Record a promotion.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to promote')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('new_rank')
                .setDescription('New rank of the user')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the promotion')
                .setRequired(true)),

    async execute(interaction) {
        const requiredRoleId = '1434350976302845962'; // Role required to use the command
        const uwumember = interaction.member;

        if (!interaction.member.roles.cache.has(requiredRoleId)) {
          return interaction.reply({
            content: 'You do not have permission to use this command.',
          });
        }

        try {
            const user = interaction.options.getUser('user');
            const newRank = interaction.options.getRole('new_rank');
            const reason = interaction.options.getString('reason');

            const channel = interaction.guild?.channels?.cache?.get('1434351319988179226') || null; // Channel id (cache-only)
            if (!channel) {
                return await interaction.reply({ content: 'Could not find the promotion log channel in cache.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor("#176EFE")
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })                
                .setTitle('Staff Promotion')
                .addFields(
                    { name: 'Staff', value: `${user}`, inline: true },
                    { name: 'New Rank', value: `${newRank}`, inline: true },
                    { name: 'Reason', value: `${reason}`, inline: false },
                )
                .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=690836ed&is=6906e56d&hm=73ea1cdb4faf2ebd0b51bce81aa46f1e2265fa7d14fdacec724f229eb87c75dd&=&format=webp') // image url
                 
            
                
            await channel.send({
                content: `<@${user.id}>`,
                embeds: [embed],
            });

            await interaction.reply({ content: `Your promotion has been submitted.`, ephemeral: true });
        } catch (error) {
            console.error('Error processing promotion:', error);
            await interaction.reply({ content: 'There was an error processing the promotion. Please try again later.', ephemeral: true });
        }
    },
};
