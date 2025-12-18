const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infract')
        .setDescription('Record an infraction.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to punish')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('punishment')
                .setDescription('Type of punishment')
                .setRequired(true)
                .addChoices(
                    { name: 'Warning', value: 'Warning' },
                    { name: 'Strike 1', value: 'Strike 1' },
                    { name: 'Strike 2', value: 'Strike 2' },
                    { name: 'Strike 3', value: 'Strike 3' },
                    { name: 'Suspension', value: 'Suspension' },
                    { name: 'Termination', value: 'Termination' },
                ))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for infraction')
                .setRequired(true)),
    
    async execute(interaction) {
        const requiredRoleId = '1434350976302845962'; // Role required to use the command
  
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
          return interaction.reply({
            content: 'You do not have permission to use this command.',
          });
        }
        

        try {
            const user = interaction.options.getUser('user');
            const punishment = interaction.options.getString('punishment');
            const reason = interaction.options.getString('reason');

            const channel = interaction.guild?.channels?.cache?.get('1434351321628151939') || null; // Channel id (cache-only)
            if (!channel) {
                return await interaction.reply({ content: 'Could not find the infraction log channel in cache.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor("#176EFE")
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })                
                .setTitle('Staff Infraction')
                .addFields(
                    { name: 'Staff', value: `${user}`, inline: true },
                    { name: 'Punishment', value: `${punishment}`, inline: true },
                    { name: 'Reason', value: `${reason}`, inline: false },
                )
                .setImage('https://media.discordapp.net/attachments/1434351345003135127/1434406793840295936/EmbedBottomBanner.webp?ex=690836ed&is=6906e56d&hm=73ea1cdb4faf2ebd0b51bce81aa46f1e2265fa7d14fdacec724f229eb87c75dd&=&format=webp') // image url

            await channel.send({
                content: `<@${user.id}>`,
                embeds: [embed],
            });

            await interaction.reply({ content: `Your infraction has been submitted!`, ephemeral: true });
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({ content: 'There was an error executing the command!', ephemeral: true });
        }
    }
};
