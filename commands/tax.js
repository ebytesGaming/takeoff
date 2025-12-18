const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tax')
    .setDescription('Calculate price to receive a specific Robux amount after tax.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of Robux you want to receive after tax')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const requiredRoleId = '1434351019499716618'; // Role required to use the command
  
    if (!interaction.member.roles.cache.has(requiredRoleId)) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
      });
    }
    
    const amount = interaction.options.getInteger('amount');
    // Calculate the required gross price (untaxed amount) to receive 'amount' net
    const taxed = Math.round(amount / 0.7); 

    // The calculated 'taxed' variable is the GROSS price (UNTAXED AMOUNT)
    // The input 'amount' variable is the NET amount (TAXED AMOUNT)
    await interaction.reply({ 
        content: `<:Calculator:1434367215263682580> You entered the price of **${amount}** and the total after tax is **${taxed}**` 
    });
  },
};
