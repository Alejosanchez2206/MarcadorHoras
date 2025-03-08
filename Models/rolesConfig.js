const { Schema , model } = require('mongoose');

const rolesConfigSchema = new Schema({
    guildId: String,
    roleId: String,
    roleName: String,
},
{
    timestamps: true,
    versionKey: false
});

module.exports = model('rolesConfigs', rolesConfigSchema);