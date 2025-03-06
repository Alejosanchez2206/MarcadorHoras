const {
    SlashCommandBuilder,
    EmbedBuilder,
    Client,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const categoryPannel = require('../../Models/categoryPannel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Panel de administracion')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
* @param {ChatInputCommandInteraction} interation
* @param {Client} client
* 
* */
    async execute(interation, client) {
        try {
            const response = await categoryPannel.find({ guildId: interation.guild.id });
            const embed = new EmbedBuilder()
                .setTitle('🌟 **Panel de Servicios** 🌟')
                .setDescription('Gestión fácil de tus turnos y horas de trabajo. Sigue los pasos indicados para una experiencia sencilla y eficiente.')
                .setColor('#4CAF50')
                .addFields(
                    {
                        name: '📝 **Paso 1 - Selecciona tu asignación**',
                        value: 'Elige tu asignación actual desde el menú desplegable. Asegúrate de seleccionarla correctamente para iniciar el proceso.',
                        inline: false
                    },
                    {
                        name: '✅ **Paso 2 - Entrar o salir de servicio**',
                        value: '• Haz clic en **Entrar en servicio** para comenzar tu turno. \n• Haz clic en **Salir de servicio** para finalizar tu turno.',
                        inline: false
                    },
                    {
                        name: '🕐 **Ver horas de trabajo**',
                        value: 'Consulta tus horas acumuladas presionando el botón **Ver horas**. ¡Lleva el control fácilmente!',
                        inline: false
                    },
                )
                .setFooter({ text: '💼 Gestión de Turnos | Optimiza tu trabajo 🚨' })

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('AsignacionesMenu')
                .setPlaceholder('Selecciona tu asignación')
                .addOptions(
                    response.map(item => new StringSelectMenuOptionBuilder()
                        .setLabel(`${item.emojiCategory} ${item.nameCategory}`)
                        .setValue(item.nameCategory)
                    )
                );

            const JoinServiceButton = new ButtonBuilder()
                .setCustomId('JoinService')
                .setLabel('Entrar en servicio')
                .setStyle(ButtonStyle.Success);

            const LeaveServiceButton = new ButtonBuilder()
                .setCustomId('LeaveService')
                .setLabel('Salir de servicio')
                .setStyle(ButtonStyle.Danger);

            const ViewHoursButton = new ButtonBuilder()
                .setCustomId('ViewHours')
                .setLabel('Ver horas')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(selectMenu);

            const row1 = new ActionRowBuilder()
                .addComponents(JoinServiceButton, LeaveServiceButton, ViewHoursButton);

            await interation.deferReply();
            await interation.editReply({ embeds: [embed], components: [row, row1] });

        } catch (err) {
            console.log(err);
            return interation.reply({ content: 'Ocurrio un error al ejecutar el comando ' + interation.commandName, ephemeral: true });
        }
    }
}