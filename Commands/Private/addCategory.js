const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits
} = require('discord.js');

const categoryPannel = require('../../Models/categoryPannel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcategory')
        .setDescription('Añadir una categoria')
        .addStringOption(option => option.setName('name')
            .setDescription('El nombre de la categoria')
            .setRequired(true))
        .addStringOption(option => option.setName('emoji')
            .setDescription('El emoji de la categoria')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client
     * 
    * */
    async execute(interaction, client) {
        try {
            const name = interaction.options.getString('name');
            const emoji = interaction.options.getString('emoji');


            const category = await categoryPannel.create({
                guildId: interaction.guild.id,
                nameCategory: name,
                emojiCategory: emoji
            });

            await category.save();
            interaction.reply({ content: `Se ha añadido la categoria ${name} con el emoji ${emoji}` , ephemeral: true });
        } catch (error) {
            console.log(error);
            interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
        }
    }
}