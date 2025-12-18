const noblox = require('noblox.js');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const PurchaseModel = require('../models/PurchaseModel.js'); 
const config = require('../config.json'); // Still needed for ROBLOXTOKEN and CHANNEL_ID

/**
 * Gets the X-CSRF-TOKEN using a patch request and the Roblox security cookie.
 * @param {string} robloxCookie The .ROBLOX_SECURITY_COOKIE (ROBLOXTOKEN from config)
 * @returns {Promise<string>} The CSRF token.
 */
async function getCsrfToken(robloxCookie) {
  try {
    // Attempting a request that typically fails with a CSRF error, allowing us to capture the token.
    await axios.patch(
      'https://itemconfiguration.roblox.com/v1/collectibles/RANDOM_COLLECTIBLE_ID_IG',
      {
        saleLocationConfiguration: { saleLocationType: 1, places: [] },
        saleStatus: 0,
        quantityLimitPerUser: 0,
        resaleRestriction: 2,
        priceOffset: 0,
        isFree: false
      },
      {
        headers: {
          // Use the provided cookie
          Cookie: `.ROBLOSECURITY=${robloxCookie}`
        }
      }
    );
  } catch (error) {
    if (
      error.response &&
      error.response.headers &&
      error.response.headers['x-csrf-token']
    ) {
      return error.response.headers['x-csrf-token'];
    } else {
      // It's important to log the error for debugging if the CSRF token isn't found
      console.error("Couldn't get the CSRF token. Response Status:", error.response?.status, error.response?.data);
      throw new Error("Couldn't get the CSRF token.");
    }
  }
}

/**
 * Fetches the current minimum price of a collectible item using its asset ID.
 * @param {string} assetId The ID of the Roblox asset.
 * @param {string} TOKEN The .ROBLOX_SECURITY_COOKIE (ROBLOXTOKEN from config).
 * @param {string} csrf The X-CSRF-TOKEN required for authenticated requests.
 * @returns {Promise<number>} The minimum price of the item.
 */
async function getItemPrice(assetId, TOKEN, csrf) {
  // First request to get the collectibleItemId
  const res = await axios.get(
    `https://itemconfiguration.roblox.com/v1/collectibles/0/${assetId}`,
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrf,
        Cookie: `.ROBLOSECURITY=${TOKEN}`
      }
    }
  );

  const collectibleId = res.data.collectibleItemId;

  // Second request to get the dynamic price configuration
  const response = await axios.get(
    `https://itemconfiguration.roblox.com/v1/collectibles/item-configuration/${collectibleId}`,
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrf,
        Cookie: `.ROBLOSECURITY=${TOKEN}`
      }
    }
  );

  return response.data.dynamicPriceConfiguration.minimumPrice;
}

async function monitorTransactions(client) {
  // Log successful start
  if (client.logs && client.logs.custom) {
    client.logs.custom(
      'Transaction Monitor is now active successfully.',
      0x2b2d31
    );
  } else {
    console.log('Transaction Monitor is now active successfully.');
  }

  // HARDCODED VALUE: Group ID 321197326
  const groupId = '1075887787'; 

  // No need for the check, as the ID is guaranteed to be set now.

  setInterval(async () => {
    try {
      // noblox.js uses the token for this automatically if you've logged in
      let transactions = await noblox.getGroupTransactions(groupId, 'Sale', 10);

      // Sort oldest to newest to ensure we process them in the correct order
      transactions = transactions.sort(
        (a, b) => new Date(a.created) - new Date(b.created)
      );

      for (const transaction of transactions) {
        const { details, currency, agent } = transaction;

        // Skip GamePass transactions if you are only tracking collectibles/assets
        //if (details.type === 'GamePass') {
        //  continue;
        //}

        // Use the transaction's unique ID/hash for MongoDB lookup
        const existingPurchase = await PurchaseModel.findOne({
          _id: transaction.idHash
        });

        if (!existingPurchase) {
          // Get price details before saving
          const csrf = await getCsrfToken(config.ROBLOXTOKEN);
          const price = await getItemPrice(
            details.id.toString(),
            config.ROBLOXTOKEN,
            csrf
          );

          const newPurchase = new PurchaseModel({
            _id: transaction.idHash,
            amount: price,
            user: {
              id: agent.id.toString(),
              name: agent.name
            },
            details: {
              id: details.id.toString(),
              name: details.name
            },
            hash: transaction.purchaseToken,
            purchased: new Date(transaction.created)
          });
          await newPurchase.save();

          // --- Discord Logging ---
          const buyerName = await noblox.getUsernameFromId(agent.id);
          const itemName = details.name;

          const channel = client.channels.cache.get(config.TRANSACTION_LOG_CHANNEL_ID); 
          if (channel) {
            const embed = new EmbedBuilder()
              .setTitle('New Purchase')
              .setTimestamp()
              .setImage('https://media.discordapp.net/attachments/1413148427709186261/1437978034165514402/image.png?ex=6919d227&is=691880a7&hm=462c52ecab49bdb19c70ed40a18a1292645a2508fc6ae686a2ce451c810180de&=&format=webp&quality=lossless&width=2820&height=140')
              .setDescription(
                `[**${itemName}**](https://www.roblox.com/catalog/${details.id}) was purchased by [${buyerName}](https://roblox.com/users/${agent.id})`
              )
              .setColor('#2d2d31')
              .addFields(
                {
                  name: 'Item',
                  value: `${itemName}`,
                  inline: true
                },
                {
                  name: 'Price',
                  value: `${price} R$`,
                  inline: true
                },
                {
                  name: 'Buyer',
                  value: `${buyerName} (ID: ${agent.id})`,
                  inline: true
                }
              );

            await channel.send({ embeds: [embed] });
          } else {
            console.error('Channel not found. Ensure TRANSACTION_LOG_CHANNEL_ID is set in config.json.');
          }
        }
      }
    } catch (err) {
      console.error('Error during transaction monitoring:', err.message);
    }
  }, 10 * 1000); // Check every 10 seconds
}

module.exports = monitorTransactions;
