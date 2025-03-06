const {
    Events,
    EmbedBuilder
} = require('discord.js');

const userSelections = new Map();

module.exports = {
    name: Events.InteractionCreate,
    customId: 'AsignacionesMenu',
    once: false,
    async execute(interaction) {
        const { customId, values } = interaction;
        if (!interaction.isStringSelectMenu()) return;

        if (customId === 'AsignacionesMenu') {
            try {
                await interaction.deferReply({ flags: 1 << 6 });
                
                userSelections.set(interaction.user.id, values[0]);

                const embed = new EmbedBuilder()
                    .setTitle('🌟 **Panel de Servicios** 🌟')
                    .setDescription(`Gestión práctica de tus turnos y horas de trabajo. Sigue los pasos indicados para una experiencia sencilla y eficiente.`)
                    .setColor('#4CAF50')
                    .addFields(
                        {
                            name: '**Seleccionaste la siguiente asignación**',
                            value: values[0],
                            inline: false
                        },
                        {
                            name: '✅ **Confirmar asignación**',
                            value: 'Haz clic en el botón para de entrar a servicio y comenzar tu turno.',
                            inline: false
                        }

                    )
                    .setFooter({ text: '💼 Gestión de Turnos | Optimiza tu trabajo 🚨' });
                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.log(error);
                interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
            }
        }
    },

    getUserSelections: () => userSelections,
}