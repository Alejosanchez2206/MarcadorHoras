const {
    Events,
    EmbedBuilder
} = require('discord.js');

const losgsService = require('../../Models/logsService');
const transforseganHours = require('../../Utils/tranforsseganHours.js');
const getWeekRange = require('../../Utils/getWeekRange.js');

module.exports = {
    name: Events.InteractionCreate,
    customId: 'ViewHours',
    once: false,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'ViewHours') {
            try {
                await interaction.deferReply({ flags: 1 << 6 });
                const userId = interaction.user.id;

                const { startOfWeek, endOfWeek } = getWeekRange();

                const viewsHours = await losgsService.aggregate([
                    {
                        $addFields: {
                            dateJoins : { $toDouble: "$dateJoin" },
                            dateLeaves: { $toDouble: "$dateLeave" }
                        }
                    },
                    
                    {
                        $match: {
                            userId: userId,
                            guildId: interaction.guild.id,
                            exit: true,
                            $expr: {
                                $and: [
                                    { $gte: [{ $toDate: { $multiply: ["$dateJoins", 1000] } }, startOfWeek] },
                                    { $lte: [{ $toDate: { $multiply: ["$dateLeaves", 1000] } }, endOfWeek] }
                                ]
                            }
                        }
                    },
                    {
                        $addFields: {
                            durations: { $toDouble: "$duration" }
                        }
                    },
                    {
                        $group: {
                            _id: "$service",
                            totalHours: { $sum: "$durations" }
                        }
                    }
                ]);

                const totalHours = viewsHours.reduce((acc, item) => acc + item.totalHours, 0);


                const embed = new EmbedBuilder()
                    .setTitle('🕐 Horas de trabajo')
                    .setDescription(`Detalle de la horas de trabajo de la semana.`)
                    .setColor('#4CAF50')
                    .addFields(                       
                        ...viewsHours.map(item => ({
                            name: item._id,
                            value: transforseganHours(item.totalHours)
                        })),
                        { name: 'Total horas de trabajo', value: transforseganHours(totalHours) },
                    )
                    .setFooter({ text: '💼 Gestión de Turnos | Optimiza tu trabajo 🚨' });

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.log(error);
                interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
            }
        }
    }
}