const { Client, GatewayIntentBits } = require('discord.js');
const rolesConfig = require('../../Models/rolesConfig.js');
const employedModel = require('../../Models/employedModel.js');

module.exports = {
    name: 'guildMemberUpdate',
    once: false,

    /**
     * 
     * @param {GuildMember} oldMember
     * @param {GuildMember} newMember
     * @param {Client} client
     */

    async execute(oldMember, newMember, client) {
        try {
            const guildId = newMember.guild.id;
            const userId = newMember.id;

            // Obtener roles agregados y eliminados
            const addedRoles = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
            const removedRoles = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));

            if (addedRoles.size > 0 || removedRoles.size > 0) {
                const employeed = await employedModel.findOne({ guildId, userId, active: true });

                if (employeed) {
                    const previousRank = employeed.promotionsLog.length > 0
                        ? employeed.promotionsLog[employeed.promotionsLog.length - 1].newRank
                        : "Desconocido"; // Si no hay registros previos, asignar un valor por defecto.

                    // Procesar roles agregados (Promociones)
                    for (const role of addedRoles.values()) {
                        const roleData = await rolesConfig.findOne({ guildId, roleId: role.id });
                        if (roleData) {
                            employeed.promotionsLog.push({
                                date: new Date(),
                                previousRank: previousRank,
                                newRank: role.name,
                                createdById: client.user.id // ID del bot o del usuario responsable
                            });

                            console.log(`🔼 Promoción registrada para ${newMember.user.tag}: ${previousRank} → ${role.name}`);
                        }
                    }

                    // Procesar roles eliminados (Degradaciones)
                    for (const role of removedRoles.values()) {
                        const roleData = await rolesConfig.findOne({ guildId, roleId: role.id });
                        if (roleData) {
                            employeed.promotionsLog.push({
                                date: new Date(),
                                previousRank: role.name,
                                newRank: "Sin rango" , // Puedes cambiar esto a otro valor si es necesario
                                createdById: client.user.id // ID del bot o del usuario responsable
                            });

                            console.log(`🔽 Degradación registrada para ${newMember.user.tag}: ${role.name} → Sin rango`);
                        }
                    }

                    await employeed.save();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
};
