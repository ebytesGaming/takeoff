const { EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

const requiredRoles = ['1416514299483914250']; // the roles required to use this command
const channelId = '1416511879572099327'; // the channel to send the message to

module.exports = {
	name: 'order',
	description: 'Sends the order panel embed.',
	execute: async function (message, args, client) {
		if (!message.member || !message.member.roles.cache.some(role => requiredRoles.includes(role.id))) {
			return message.reply({ content: 'You do not have permission to run this command.', allowedMentions: { repliedUser: false } }).catch(() => {});
		}

		// FIX: Using 'message.client' instead of the function parameter 'client'
		// Use the passed `client` parameter (matches how the handler calls execute: execute(message, args, client))
		// and fall back to message.client if for some reason client isn't provided.
		const botClient = client || message.client;
		// Use cache-only lookup to avoid calling API fetch
		const channel = botClient?.channels?.cache?.get(channelId) || message.client?.channels?.cache?.get(channelId) || null;
		
		if (!channel || !channel.isSendable()) 
			return await message.reply('Channel not found or invalid');

		const embed1 = new EmbedBuilder()
						.setColor('#393939')
						.setImage('https://media.discordapp.net/attachments/1322790611383750707/1416512184132964483/image.png?ex=6924b7c6&is=69236646&hm=24b9a9e92df95477daf4a28396fa66885e5f3482e9ff6a47631aedee48b14b4a&=&format=webp&quality=lossless&width=2844&height=936');
		const embed2 = new EmbedBuilder()
			.setColor('#393939')
						.setDescription("Welcome to our ordering panel. Our team creates the highest quality products so you can improve your community. Select the button below that matches your needs.")
						.setImage('https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=69248e6e&is=69233cee&hm=23b11315b8e5ccc0664390c369f91b0eab516b6157ac505af67ebffb7ea82404&=&format=webp&quality=lossless&width=2844&height=56')
						.addFields(
							{ name: "Liveries", value: "<:close1:1437658067629248512><:close2:1437658130212323389>", inline: true },
							{ name: "Graphics", value: "<:close1:1437658067629248512><:close2:1437658130212323389>", inline: true },
							{ name: "Clothing", value: "<:close1:1437658067629248512><:close2:1437658130212323389>", inline: true },
							{ name: "Discord", value: "<:close1:1437658067629248512><:close2:1437658130212323389>", inline: true },
							{ name: "Photography", value: "<:close1:1437658067629248512><:close2:1437658130212323389>", inline: true },
							{ name: "Discord Bots", value: "<:close1:1437658067629248512><:close2:1437658130212323389>", inline: true }
						);
		const tos = new ButtonBuilder()
				.setCustomId("p_167454270457647108")
				.setLabel("Terms of Service")
				.setDisabled(true)
				.setStyle(ButtonStyle.Secondary);

		const pricing = new ButtonBuilder()
				.setCustomId("p_167454264816308226")
				.setLabel("Prices")
				.setDisabled(true)
				.setStyle(ButtonStyle.Secondary);
			
		const menu = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('order:menu')
				.setDisabled(false)
				.setPlaceholder('Place an order!')
				.setOptions(
					new StringSelectMenuOptionBuilder()
						.setValue('clothing')
						.setLabel('Clothing'),
					new StringSelectMenuOptionBuilder()
						.setValue('livery')
						.setLabel('Livery'),
					new StringSelectMenuOptionBuilder()
						.setValue('graphics')
						.setLabel('Graphics'),
					new StringSelectMenuOptionBuilder()
						.setValue('discord')
						.setLabel('Discord'),
					new StringSelectMenuOptionBuilder()
						.setValue('photography')
						.setLabel('Photography'),
				)
		);
		
		const row1 = new ActionRowBuilder().addComponents(tos, pricing);

		await channel.send({
			embeds: [embed1, embed2],
			components: [menu, row1]
		});
		await message.delete();
	}
};