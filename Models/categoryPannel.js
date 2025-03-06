const { Schema, model } = require('mongoose');

const categoryPannelSchema = new Schema({
    guildId: String,
    nameCategory: String,
    emojiCategory: String
},
    {
        timestamps: true,
        versionKey: false
    });

module.exports = model('categoryPannels', categoryPannelSchema);