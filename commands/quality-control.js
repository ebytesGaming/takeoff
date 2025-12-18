const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quality-control')
        .setDescription('Request quality control')
        .addAttachmentOption(option => 
            option.setName('image')
                .setDescription('Image to be reviewed')
                .setRequired(false)
        ),
        
    async execute(interaction) {
        const requiredRoleId = '1307537719018262593'; // Role required to use the command
  
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
          return interaction.reply({
            content: 'You do not have permission to use this command.',
          });
        }

        const qualityControlRoleId = '1307537719081304175'; // qc role id for ping

        const channel = interaction.guild?.channels?.cache?.get('1372182549102858301') || null; // Channel id (cache-only)
        if (!channel) {
            return await interaction.reply({ content: 'Could not find the promotion log channel in cache.', ephemeral: true });
        }

        const user = interaction.user; 
        const roleToPing = `<@&${qualityControlRoleId}>`;
        const userToPing = `<@${user.id}>`;
        const imageAttachment = interaction.options.getAttachment('image');

        const embed = new EmbedBuilder()
            .setTitle('Quality Control Request')
            .setColor("#393939")
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`${userToPing} has requested Quality Control`)
            .setImage('https://media.discordapp.net/attachments/1322790611383750707/1416105405087748178/image.png?ex=69330eee&is=6931bd6e&hm=37c5dc24048ae612e0a940daba2471fa1d1af078ceb36da86acd7bdce1d683dc&=&format=webp&quality=lossless&width=2844&height=56') // image url

        const acceptButton = new ButtonBuilder()
            .setCustomId('accept')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success);

        const denyButton = new ButtonBuilder()
            .setCustomId('deny')
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(acceptButton, denyButton);

        try {
            const message = await channel.send({ content: roleToPing, embeds: [embed], components: [row] });

            const thread = await message.startThread({
                name: 'Quality Control Feedback',
                reason: `Result on ${user.username}'s work.`,
                autoArchiveDuration: 60,
            });

            if (imageAttachment) {
                await thread.send({ content: `${userToPing} A thread has been created for you to discuss about your work with quality ensurance members.`, files: [imageAttachment.url] });
            } else {
                await thread.send({ content: `${userToPing} A thread has been created for you to discuss about your work with quality ensurance members.` });
            }

            await interaction.reply({ content: 'Quality control has been requested.', ephemeral: true });

        } catch (error) {
            console.error('Error creating thread:', error);
            await interaction.reply({ content: 'There was an error creating the quality control thread.', ephemeral: true });
        }
    },
};