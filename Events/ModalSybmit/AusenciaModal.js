const {
    Events,
    EmbedBuilder
} = require('discord.js');
const configChannels = require('../../Models/configChannels');

module.exports = {
    name: Events.InteractionCreate,
    customId: 'AusenciaModals',
    once: false,

    async execute(interaction) {
        if (!interaction.isModalSubmit() || interaction.customId !== 'vacationsModal') return;

        try {
            // Diferir la respuesta (ephemeral: true)
            await interaction.deferReply({ ephemeral: true });

            const nameVacations = interaction.fields.getTextInputValue('motivoVacations');
            const descriptionVacations = interaction.fields.getTextInputValue('tiempoVacations');

            // Validar que los campos no estén vacíos
            if (!nameVacations || !descriptionVacations) {
                return interaction.editReply({ content: 'Debes completar todos los campos', ephemeral: true });
            }

            // Buscar la configuración del canal de capacitaciones
            const config = await configChannels.findOne({ guildId: interaction.guild.id, permission: 'vacaciones' });

            if (config) {
                const channel = interaction.guild.channels.cache.get(config.channelId);

                // Crear el embed con la información de la capacitación
                const embed = new EmbedBuilder()
                    .setTitle('🌟 **Solicitud de Ausencia** 🌟')
                    .addFields(
                        { name: 'Motivo', value: nameVacations, inline: false },
                        { name: 'Tiempo', value: descriptionVacations, inline: false },
                        { name: 'Solicitado por', value: `<@${interaction.user.id}>`, inline: false }
                    )
                    .setColor('#7a00e6')
                    .setFooter({ text: '💼 Gestión  | Solicitar vacaciones 🚨' }

                    );

                // Enviar el embed al canal de capacitaciones
                channel.send({ embeds: [embed] });
                interaction.editReply({ content: 'Solicitud enviada correctamente', ephemeral: true });
            }
        } catch (error) {
            console.log(error);
            interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
        }
    }
}