const {
    Events,
    EmbedBuilder
} = require('discord.js');
const configChannels = require('../../Models/configChannels');

module.exports = {
    name: Events.InteractionCreate,
    customId: 'TrainingModals',
    once: false,
    async execute(interaction, client) {
        if (!interaction.isModalSubmit() || interaction.customId !== 'trainingsModal') return;

        try {
            // Diferir la respuesta (ephemeral: true)
            await interaction.deferReply({ ephemeral: true });

            const nameTraining = interaction.fields.getTextInputValue('nameTrainings');
            const descriptionTraining = interaction.fields.getTextInputValue('descriptionTrainings');

            // Validar que los campos no estén vacíos
            if (!nameTraining || !descriptionTraining) {
                return interaction.editReply({ content: 'Debes completar todos los campos', ephemeral: true });
            }

            // Buscar la configuración del canal de capacitaciones
            const config = await configChannels.findOne({ guildId: interaction.guild.id, permission: 'capacitaciones' });

            if (config) {
                const channel = interaction.guild.channels.cache.get(config.channelId);

                // Crear el embed con la información de la capacitación
                const embed = new EmbedBuilder()
                    .setTitle(nameTraining)
                    .addFields(
                        { name: 'Descripción', value: descriptionTraining, inline: false },
                        { name: 'Solicitando por', value: `<@${interaction.user.id}>`, inline: false }
                    )
                    .setColor('#7a00e6')
                    .setFooter({ text: '💼 Gestión  | Solicitar capacitaciones 🚨' });

                // Enviar el embed al canal de capacitaciones
                await channel.send({ embeds: [embed] });

                // Responder al usuario que la capacitación se creó con éxito
                await interaction.editReply({ content: 'Capacitación creada con éxito', ephemeral: true });
            } else {
                // Responder al usuario que no se ha configurado el canal de capacitaciones
                await interaction.editReply({ content: 'No se ha configurado el canal de capacitaciones', ephemeral: true });
            }
        } catch (error) {
            console.error(error);

            // Responder al usuario que ocurrió un error
            await interaction.editReply({ content: 'Ocurrió un error al ejecutar el comando', ephemeral: true });
        }
    }
};