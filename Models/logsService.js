const { Schema, model } = require('mongoose');

const logsServiceSchema = new Schema({
    guildId: String,
    userId: String,
    service: String,
    dateJoin: String,
    dateLeave: String,
    duration: String,
    exit: { type: Boolean, default: false }
},
    {
        timestamps: true,
        versionKey: false
    });

module.exports = model('logsServices', logsServiceSchema);