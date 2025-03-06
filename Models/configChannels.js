const { Schema, model } = require('mongoose');

const configChannelsSchema = new Schema({
    guildId: String,
    channelId: String,
    permission: String
},
{
    timestamps: true,
    versionKey: false
})

module.exports = model('configChannels', configChannelsSchema);