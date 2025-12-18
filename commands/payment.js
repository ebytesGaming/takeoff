const config = require('../config.json');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const noblox = require('noblox.js');
const axios = require('axios');

const cooldowns = new Map();

async function getCsrfToken() {
    try {
        const response = await axios.post('https://auth.roblox.com/v2/login', {}, {
            headers: {
                Cookie: `.ROBLOSECURITY=${config.ROBLOXTOKEN}`
            }
        });
        if (response.headers['x-csrf-token']) {
            return response.headers['x-csrf-token'];
        }
    } catch (error) {
        if (error.response && error.response.headers['x-csrf-token']) {
            return error.response.headers['x-csrf-token'];
        } else {
            console.error('Failed to retrieve CSRF token:', error.response ? error.response.data : error.message);
            return null;
        }
    }
}

async function updateGamepass(price, collectibleId) {
    const url = `https://itemconfiguration.roblox.com/v1/collectibles/${collectibleId}`;
    let csrfToken = await getCsrfToken();
    if (!csrfToken) return false;

    const headers = {
        Cookie: `.ROBLOSECURITY=${config.ROBLOXTOKEN}`,
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
    };

    const data = {
        saleLocationConfiguration: { saleLocationType: 1, places: [] },
        saleStatus: 0,
        quantityLimitPerUser: 0,
        resaleRestriction: 2,
        priceInRobux: price,
        priceOffset: 0,
        isFree: false,
    };

    try {
        const response = await axios.patch(url, data, { headers });
        return response.status === 200;
    } catch (error) {
        if (error.response && error.response.status === 403 && error.response.headers['x-csrf-token']) {
            console.warn('CSRF token expired, retrying...');
            csrfToken = error.response.headers['x-csrf-token'];
            headers['X-CSRF-TOKEN'] = csrfToken;
            try {
                const retryResponse = await axios.patch(url, data, { headers });
                return retryResponse.status === 200;
            } catch (retryError) {
                console.error('Retry failed:', retryError.response ? retryError.response.data : retryError.message);
            }
        }
        console.error('Error updating gamepass price:', error.response ? error.response.data : error.message);
        return false;
    }
}module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit-payment')
        .setDescription('Change the price of a payment option.')
        .addStringOption(option =>
            option.setName('payment')
                .setDescription('Select a payment option')
                .setRequired(true)
                .addChoices(
                    { name: 'Payment 1', value: '115032721810358|e34f9e8c-306c-4165-a0a7-82197b61a186' },
                    { name: 'Payment 2', value: '80286820604929|192791c2-99d7-48d3-816a-8f8387781473' },
                    { name: 'Payment 3', value: '92620238502454|92620238502454|5fd344c6-c459-491d-a485-80fc2e128801' },
                    { name: 'Payment 4', value: '138579244768698|c9b2bcf2-1973-4c65-8999-6f0fb2123999' },
                    { name: 'Payment 5', value: '98992105094178|93d7de97-8d69-4711-b950-80b8da0f7c7c' },
                )
        )
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('New price to change the Gamepass to.')
                .setRequired(true)
        ),

    async execute(interaction, client) {
            const requiredRoleId = "1434350997752516800";
    const requiredRole = interaction.guild.roles.cache.get(requiredRoleId);

    if (!requiredRole) {
      return interaction.reply({
        content: "Configured role is invalid.",
        ephemeral: true
      });
    }

    if (!interaction.member.roles.cache.has(requiredRoleId)) {
        return interaction.reply({
          content: `You don't have permission to use this command.`,
          ephemeral: true
        });
      }     
      
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownTime = 3 * 60 * 1000;

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownTime;
            if (now < expirationTime) {
                const remainingTime = Math.ceil((expirationTime - now) / 1000);
                return interaction.reply({ content: `Please wait ${remainingTime} seconds before changing the price again.`, ephemeral: true });
            }
        }

        cooldowns.set(userId, now);
        setTimeout(() => cooldowns.delete(userId), cooldownTime);

        const paymentOption = interaction.options.getString('payment');
        const price = interaction.options.getInteger('price');
        const [productId, collectibleId] = paymentOption.split('|');

        await interaction.deferReply({ ephemeral: false });

        const updateSuccess = await updateGamepass(price, collectibleId);
        if (updateSuccess) {
            try {
                const productInfo = await noblox.getProductInfo(productId);
                const productName = productInfo.Name;

                await interaction.editReply({
                    content: `<:ROBLOX:1409418668882006099>  You have **successfully** changed \_\_\[${productName}](https://www.roblox.com/catalog/${productId})\_\_\ to **R$${price}**.`
                });

            } catch (error) {
                await interaction.editReply({ content: 'An error occurred.' });
            }
        } else {
            await interaction.editReply({ content: 'An error occurred.' });
        }
    }
};