const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
} = require('discord.js');

const rolesConfig = require('../../Models/rolesConfig.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addconfigrol')
        .setDescription('Añadir un rol de configuración')
        .addRoleOption(option => option.setName('rol')
            .setDescription('El rol de configuración')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
      * @param {ChatInputCommandInteraction} interation
      * @param {Client} client
      * 
     * */
    async execute(interaction, client) {
        try {
            const role = interaction.options.getRole('rol');
    
            const validar = await rolesConfig.findOne({ guildId: interaction.guild.id, roleId: role.id });

            if (validar) {
                //Actualizar el rol
                await rolesConfig.findOneAndUpdate({ guildId: interaction.guild.id, roleId: role.id },
                    {
                        roleName: role.name
                    });

                interaction.reply({ content: `Se ha actualizado el rol de configuración para el rol ${role.name}`, ephemeral: true });
            } else {
                //Crear el rol
                const response = await rolesConfig.create({
                    guildId: interaction.guild.id,
                    roleId: role.id,
                    roleName: role.name
                });

                response.save();
                interaction.reply({ content: `Se ha añadido el rol de configuración para el rol ${role.name}`, ephemeral: true });
            }
        } catch (error) {
            console.log(error);
            interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
        }
    }
}