const {Schema , model} = require('mongoose');

const userConfigSchema = new Schema({
    guildId: String,
    userName : String,
    userPassword : String,
    isAdmin : { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('userConfigs', userConfigSchema);