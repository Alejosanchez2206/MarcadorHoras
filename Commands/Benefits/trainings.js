const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Client,
    ChatInputCommandInteraction
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solicitar-capacitaciones')
        .setDescription('Solicitar capacitaciónes o cursos'),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        try {
            const trainingsModal = new ModalBuilder()
                .setCustomId('trainingsModal')
                .setTitle('Solicitar capacitaciónes o cursos');

            const nameTrainingsInput = new TextInputBuilder()
                .setCustomId('nameTrainings')
                .setLabel('Asunto')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const descriptionTrainingsInput = new TextInputBuilder()
                .setCustomId('descriptionTrainings')
                .setLabel('Descripción de la solicitud')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(nameTrainingsInput);
            const secondActionRow = new ActionRowBuilder().addComponents(descriptionTrainingsInput);

            trainingsModal.addComponents(firstActionRow, secondActionRow);

            await interaction.showModal(trainingsModal);

        } catch (error) {
            console.log(error);
            interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
        }
    }
} 