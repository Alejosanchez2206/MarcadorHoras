const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
} = require('discord.js');

const configChannels = require('../../Models/configChannels.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addconfig')
        .setDescription('Añadir un canal de configuración')
        .addChannelOption(option => option.setName('name')
            .setDescription('El nombre del canal de configuración')
            .setRequired(true))
        .addStringOption(option => option.setName('permiso')
            .setDescription('El permiso del canal de configuración')
            .setRequired(true)
            .addChoices(
                { name: 'panel-servicios', value: 'panel-servicios' },
                { name: 'panel-topsemana', value: 'panel-topsemana' },
                { name: 'logs-servicios', value: 'logs-servicios' },
                { name : 'vacaciones', value: 'vacaciones' },
                { name : 'capacitaciones', value: 'capacitaciones' }
            ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * @param {ChatInputCommandInteraction} interation
     * @param {Client} client
     * 
    * */
    async execute(interaction, client) {
        try {
            const channel = interaction.options.getChannel('name');
            const permiso = interaction.options.getString('permiso');

            const validar = await configChannels.findOne({ guildId: interaction.guild.id, permission: permiso });

            if (validar) {
                //Actualizar el canal
                await configChannels.findOneAndUpdate({ guildId: interaction.guild.id, permission: permiso },
                    {
                        channelId: channel.id
                    });

                interaction.reply({ content: `Se ha actualizado el canal de configuración para el permiso ${permiso}`  , ephemeral: true });
            } else {
                //Crear el canal
                const response = await configChannels.create({
                    guildId: interaction.guild.id,
                    channelId: channel.id,
                    permission: permiso
                });

                response.save();

                interaction.reply({ content: `Se ha creado el canal de configuración para el permiso ${permiso}`  , ephemeral: true });
            }
        } catch (error) {
            console.log(error);
            interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
        }
    }
}
