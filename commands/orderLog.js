const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('order-log')
        .setDescription('Log an order with customer, product, and price details.')
        .addUserOption(option =>
            option.setName('customer')
                .setDescription('The customer making the order.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('product')
                .setDescription('Product being ordered.')
                .setRequired(true)
                .addChoices(
                    { name: 'Liveries', value: 'Liveries' },
                    { name: 'Clothing', value: 'Clothing' },
                    { name: 'Graphics', value: 'Graphics' },
                    { name: 'Discord', value: 'Graphics' },
                    { name: 'Other', value: 'Graphics' },
                ))
        .addNumberOption(option =>
            option.setName('price')
                .setDescription('Price of the product **WITHOUT** tax.')
                .setRequired(true)),

    async execute(interaction) {
        const requiredRoleId = '1436158187924488344'; // Role required to use the command
  
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
          return interaction.reply({
            content: '<:X_1:1439403896039805019> You do not have **permission** to use this command.',
          });
        }

        try {
            const customer = interaction.options.getUser('customer');
            const product = interaction.options.getString('product');
            const price = interaction.options.getNumber('price');

            const channel = interaction.guild?.channels?.cache?.get('1413244839612649514') || null; // Channel id (cache-only)
            if (!channel) {
                return await interaction.reply({ content: 'Could not find the order log channel in cache.', ephemeral: true });
            }

            if (isNaN(price) || price <= 0) {
                return await interaction.reply({ content: 'Please enter a valid, positive price.', ephemeral: true });
            }

            const robloxTaxRate = 0.3;
            const fullPrice = Math.round(price / (1 - robloxTaxRate));
            const designerEarnings = Math.round(price * 0.6);

            const embed = new EmbedBuilder()
                .setColor("#393939")
                .setTitle(`New Order Logged`)
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .addFields(
                    { name: 'Customer:', value: `<@${customer.id}>`, inline: true },
                    { name: 'Designer:', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Product:', value: product, inline: true },
                    { name: 'Full Price (including tax):', value: `${fullPrice}`, inline: true },
                )
                .setImage('https://media.discordapp.net/attachments/1413148427709186261/1437978034165514402/image.png?ex=6919d227&is=691880a7&hm=462c52ecab49bdb19c70ed40a18a1292645a2508fc6ae686a2ce451c810180de&=&format=webp&quality=lossless&width=2820&height=140') // image url

            const paidButton = new ButtonBuilder()
                .setCustomId('paid')
                .setLabel('Mark Paid')
                .setStyle(ButtonStyle.Secondary)

            const row = new ActionRowBuilder().addComponents(paidButton);

            await channel.send({ 
                embeds: [embed], 
                components: [row] 
            });

            await interaction.reply({ content: `Your order has been logged successfully.`, ephemeral: true });

        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({ content: 'There was an error logging the order. Please try again later.', ephemeral: true });
        }
    },
};
