const { Events, EmbedBuilder } = require('discord.js');
const losgsService = require('../../Models/logsService');
const configChannels = require('../../Models/configChannels');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'LeaveService') {
            try {
                await interaction.deferReply({ flags: 1 << 6 });
                const validate = await losgsService.findOne({ guildId: interaction.guild.id, userId: interaction.user.id, exit: false });

                if (!validate) {
                    return interaction.editReply({ content: 'No te encuentras en servicio actualmente , no puedes salir de servicio' });
                }

                // Obtener el timestamp en segundos (UTC)
                const nowSeconds = Math.floor(Date.now() / 1000);

                // Calcular la diferencia en segundos
                const differenceSeconds = nowSeconds - validate.dateJoin;

                // Calcular la diferencia en horas
                const hours = Math.floor(differenceSeconds / 3600);

                // Calcular la diferencia en minutos
                const minutes = Math.floor((differenceSeconds % 3600) / 60);

                await losgsService.findOneAndUpdate({
                    _id: validate._id
                },
                    {
                        exit: true,
                        dateLeave: nowSeconds,
                        duration: differenceSeconds
                    },
                    {
                        new: true
                    });

                const logsChannel = await configChannels.findOne({ guildId: interaction.guild.id, permission: 'logs-servicios' });
                if (logsChannel) {
                    const logsEmbed = new EmbedBuilder()
                        .setTitle('Nueva salida de servicio')
                        .setDescription('Detalles de la salida de servicio')
                        .setColor('#FF0000')
                        .addFields(
                            {
                                name: 'Usuario',
                                value: `<@${interaction.user.id}>`,
                                inline: false
                            },
                            {
                                name: 'Fecha de ingreso',
                                value: `<t:${validate.dateJoin}:F>`,
                                inline: false
                            },
                            {
                                name: 'Fecha de salida',
                                value: `<t:${nowSeconds}:F>`,
                                inline: false
                            },
                            {
                                name: 'Horas trabajadas',
                                value: `${hours} horas y ${minutes} minutos`,
                                inline: false
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
                        
                        const messages = await interaction.guild.channels.cache.get(panelService.channelId).messages.fetch({ limit: 1 });
                        if (messages.size > 0) {
                            await messages.first().delete();
                        }
    

                    // Enviar el embed
                    await interaction.guild.channels.cache.get(panelService.channelId).send({ embeds: [panelEmbed] });

                }

                await interaction.editReply({ content: `Has salido de servicio, has trabajado ${hours} horas y ${minutes} minutos` });

            } catch (error) {
                console.log(error);
                interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
            }
        }
    }
}   