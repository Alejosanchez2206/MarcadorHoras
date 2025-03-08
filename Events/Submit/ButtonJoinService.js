const {
    Events,
    EmbedBuilder
} = require('discord.js');

const losgsService = require('../../Models/logsService');
const { getUserSelections } = require('./SelectForm');
const configChannels = require('../../Models/configChannels');
const employees = require('../../Models/employedModel');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'JoinService') {
            try {
                await interaction.deferReply({ flags: 1 << 6 });

                const userSelections = getUserSelections();
                const selectedOptionValue = userSelections.get(interaction.user.id);

                userSelections.delete(interaction.user.id);

                if (!selectedOptionValue) {
                    return interaction.editReply({ content: 'No se ha seleccionado ninguna asignación.' });
                }

                const validarEmpleado = await employees.findOne({ guildId: interaction.guild.id, userId: interaction.user.id, active: true });

                if (!validarEmpleado) {
                    return interaction.editReply({ content: 'No estás registrado como empleado en el sistema.' });
                }

                const validate = await losgsService.findOne({ guildId: interaction.guild.id, userId: interaction.user.id, exit: false });

                if (validate) {
                    return interaction.editReply({ content: `Actualmente estás de servicio en la siguiente asignación: ${validate.service} , fecha de ingreso: <t:${validate.dateJoin}:F>` });
                }

                // Obtener el timestamp en segundos (UTC)
                const nowSeconds = Math.floor(Date.now() / 1000);

                const response = await losgsService.create({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id,
                    service: selectedOptionValue,
                    dateJoin: nowSeconds,
                });

                await response.save();

                const logsChannel = await configChannels.findOne({ guildId: interaction.guild.id, permission: 'logs-servicios' });

                if (logsChannel) {
                    const logsEmbed = new EmbedBuilder()
                        .setTitle('Nuevo ingreso a servicio')
                        .setDescription(`Detalle del nuevo ingreso a servicio`)
                        .setColor('#4CAF50')
                        .addFields(
                            {
                                name: 'Usuario',
                                value: `<@${interaction.user.id}>`,
                            },
                            {
                                name: 'Servicio',
                                value: selectedOptionValue
                            },
                            {
                                name: 'Fecha de ingreso',
                                value: `<t:${nowSeconds}:F>`
                            }
                        )
                        .setFooter({ text: '💼 Gestión de Turnos | Optimiza tu trabajo 🚨' }

                        );

                    await interaction.guild.channels.cache.get(logsChannel.channelId).send({ embeds: [logsEmbed] });
                }

                const panelService = await configChannels.findOne({ guildId: interaction.guild.id, permission: 'panel-servicios' });
                if (panelService) {
                    const dataUserService = await losgsService.aggregate([
                        {
                            $match: {
                                guildId: interaction.guild.id,
                                exit: false // Solo usuarios activos
                            }
                        },
                        {
                            $group: {
                                _id: '$service',
                                userId: { $addToSet: '$userId' } // Agrupar usuarios únicos por servicio
                            }
                        }
                    ]);


                    // Calcular el total de usuarios activos
                    const totalUsersConnected = dataUserService.reduce((total, service) => total + service.userId.length, 0);

                    // Formatear los datos para el embed
                    const serviceDetails = dataUserService.map(service => {
                        const users = service.userId.map(user => `<@${user}>`).join('\n'); // Mencionar usuarios con salto de línea
                        return `**${service._id}**:\n${users || 'Ninguno'}`; // Mostrar usuarios en el servicio
                    }).join('\n\n');

                    // Crear el embed
                    const panelEmbed = new EmbedBuilder()
                        .setTitle('Panel de Servicios Activos')
                        .setDescription('Detalles de los servicios y los usuarios activos en cada uno.')
                        .setColor('#FF0000')
                        .addFields(
                            {
                                name: 'Servicios en curso',
                                value: serviceDetails || 'No hay servicios activos.',
                                inline: false
                            },
                            {
                                name: 'Total de usuarios conectados',
                                value: `${totalUsersConnected}`,
                                inline: false
                            }
                        )
                        .setFooter({ text: '💼 Gestión de Turnos | Optimiza tu trabajo 🚨' });

                    // Eliminar el mensaje anterior en este chat
                    const messages = await interaction.guild.channels.cache.get(panelService.channelId).messages.fetch({ limit: 1 });
                    if (messages.size > 0) {
                        await messages.first().delete();
                    }

                    // Enviar el embed
                    await interaction.guild.channels.cache.get(panelService.channelId).send({ embeds: [panelEmbed] });

                }

                // Enviar mensaje de confirmación con el timestamp en formato Discord
                await interaction.editReply({
                    content: `Has entrado al servicio: ${selectedOptionValue}. Fecha de ingreso: <t:${nowSeconds}:F>`,
                });
            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo nuevamente.' });
            }

        }
    },
};