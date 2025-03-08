const {
    SlashCommandBuilder,
    Client,
    PermissionFlagsBits,
} = require('discord.js');

const employeeSchema = require('../../Models/employedModel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemployee')
        .setDescription('Añadir un empleado')
        .addStringOption(option => option.setName('firstname')
            .setDescription('El nombre del empleado')
            .setRequired(true))
        .addStringOption(option => option.setName('lastname')
            .setDescription('El apellido del empleado')
            .setRequired(true))
        .addUserOption(option => option.setName('user')
            .setDescription('El usuario del empleado')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
         * @param {ChatInputCommandInteraction} interation
         * @param {Client} client
         * 
        * */
    async execute(interaction, client) {
        try {
            const firstName = interaction.options.getString('firstname');
            const lastName = interaction.options.getString('lastname');
            const user = interaction.options.getUser('user');

            const validar = await employeeSchema.findOne({ guildId: interaction.guild.id, userId: user.id, active: true });

            if (!validar) {
                const response = await employeeSchema.create({
                    guildId: interaction.guild.id,
                    userId: user.id,
                    firstName: firstName,
                    lastName: lastName
                });

                response.save();
                interaction.reply({ content: `Se ha añadido el empleado ${firstName} ${lastName}`, ephemeral: true });
            } else {
                interaction.reply({ content: `El usuario ${validar.firstName} ${validar.lastName} ya se encuentra registrado como empleado`, ephemeral: true });
            }
        } catch (error) {
            console.log(error);
            interaction.reply({ content: 'Ocurrio un error al ejecutar el comando', ephemeral: true });
        }
    }
};