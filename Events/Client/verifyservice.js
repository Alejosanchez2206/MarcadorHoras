const { Client, ActivityType, EmbedBuilder } = require('discord.js');
const logsService = require('../../Models/logsService');
const configChannels = require('../../Models/configChannels');

module.exports = {
    name: 'ready',
    once: true,
    /**
    * @param {Client} client 
    */
    async execute(client) {
        console.log('✅ Monitoreando los servicios de tus empleados!'.green);
        // Función para verificar servicios activos
        const verifyService = async () => {
            try {
                const guilds = client.guilds.cache.map(guild => guild.id);
                const services = await logsService.find({ exit: false, guildId: { $in: guilds } });

                for (const service of services) {
                    const nowSeconds = Math.floor(Date.now() / 1000);
                    const differenceSeconds = nowSeconds - service.dateJoin;

                    // Notificar después de 4 horas (14400 segundos)
                    if (differenceSeconds >= 14400) {
                        try {
                            const user = await client.users.fetch(service.userId);
                            if (user) {
                                await user.send("⏳ **Recuerda cerrar tu turno!**\nHas estado en servicio durante más de 4 horas sin cerrar tu turno. Hazlo para no perder el registro de tus horas.");
                            }
                        } catch (err) {
                            console.log(`❌ No se pudo enviar el recordatorio a ${service.userId}`);
                        }
                    }

                    // Expulsar después de 5 horas (18000 segundos)
                    if (differenceSeconds >= 18000) {
                        try {
                            const user = await client.users.fetch(service.userId);
                            if (user) {
                                await user.send("🚨 **Has sido sacado del turno por inactividad.**");
                            }
                        } catch (err) {
                            console.log(`❌ No se pudo notificar a ${service.userId}`);
                        }

                        service.dateLeave = nowSeconds;
                        service.duration = differenceSeconds;
                        service.exit = true;
                        await service.save();

                        const logsChannel = await configChannels.findOne({ guildId: service.guildId, permission: 'logs-servicios' });
                        if (logsChannel) {
                            const hours = Math.floor(differenceSeconds / 3600);
                            const minutes = Math.floor((differenceSeconds % 3600) / 60);

                            const logsEmbed = new EmbedBuilder()
                                .setTitle('Salida de servicio detectada por inactividad')
                                .setDescription('Detalles de la salida de servicio')
                                .setColor('#FF0000')
                                .addFields(
                                    { name: 'Usuario', value: `<@${service.userId}>`, inline: false },
                                    { name: 'Fecha de ingreso', value: `<t:${service.dateJoin}:F>`, inline: false },
                                    { name: 'Fecha de salida', value: `<t:${nowSeconds}:F>`, inline: false },
                                    { name: 'Horas trabajadas', value: `${hours} horas y ${minutes} minutos`, inline: false }
                                )
                                .setFooter({ text: '💼 Gestión de Turnos | Optimiza tu trabajo 🚨' });

                            await client.channels.cache.get(logsChannel.channelId).send({ embeds: [logsEmbed] });
                        }
                    }
                }
            } catch (error) {
                console.error("❌ Error al verificar servicios:", error);
            }
        };

        setInterval(verifyService, 60000);
    },
};