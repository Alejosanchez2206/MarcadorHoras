const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
} = require('discord.js');
const bcrypt = require('bcrypt');
const userConfigs = require('../../Models/userConfig.js');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createuser')
        .setDescription('Crear un usuario')
        .addStringOption(option => option.setName('user')
            .setDescription('El usuario del empleado')
            .setRequired(true))
        .addStringOption(option => option.setName('password')
            .setDescription('La contraseña del empleado')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     * 
     */
    async execute(interaction, client) {
        try {
            if (interaction.user.id !== config.OWNER) return interaction.reply({ content: 'No tienes permisos para ejecutar este comando', ephemeral: true });
            const user = interaction.options.getString('user');
            const password = interaction.options.getString('password');

            const validar = await userConfigs.findOne({ userName: user, guildId: interaction.guild.id });

            if (!validar) {
                let hash = await bcrypt.hash(password, 10);
                const response = await userConfigs.create({
                    guildId: interaction.guild.id,
                    userName: user,
                    userPassword: hash
                });

                response.save();

                interaction.reply({ content: `Se ha añadido el usuario ${user}`, ephemeral: true });
            } else {
                interaction.reply({ content: `El usuario ${validar.userName} ya se encuentra registrado`, ephemeral: true });
            }
        } catch (error) {
            console.log(error);
            interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
        }
    }
}