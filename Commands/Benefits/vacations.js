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
        .setName('ausencias')
        .setDescription('Justificar tu ausencia o vacaciones'),

        
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        try{
            const vacationsModal = new ModalBuilder()
                .setCustomId('vacationsModal')
                .setTitle('Justificar tu ausencia o vacaciones');

            const nameVacationsInput = new TextInputBuilder()
                .setCustomId('motivoVacations')
                .setLabel('Motivo de la ausencia')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const descriptionVacationsInput = new TextInputBuilder()
                .setCustomId('tiempoVacations')
                .setLabel('Tiempo de ausencia')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(nameVacationsInput);
            const secondActionRow = new ActionRowBuilder().addComponents(descriptionVacationsInput);

            vacationsModal.addComponents(firstActionRow, secondActionRow);

            await interaction.showModal(vacationsModal);
            
        }  catch (error) {
            console.log(error);
            interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
        } 
    }
}