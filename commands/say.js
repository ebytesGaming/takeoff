const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Says your message')
        .addStringOption(option => option.setName('message').setDescription('The message you want the bot to say.').setRequired(true)),

    async execute(interaction) {
        const requiredRoleId = '1416514299483914250'; // Role required to use the command
  
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
          return interaction.reply({
            content: 'You do not have permission to use this command.',
          });
        }
          
        const message = interaction.options.getString('message');
        await interaction.reply({ content: `Your message has been sent!`, ephemeral: true });
        await interaction.channel.send({ content: message });
    },
};