
const { Client, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const config = require('../../config.json');
require('colors')

module.exports = {
    name: 'ready',
    once: true,
    /**
     * * @param {Client} client 
     * * 
     * */
    async execute(client) {
        client.user.setActivity(`Monitoreando tus horas de trabajo`, { type: ActivityType.Playing });
        await mongoose.connect(config.URL_DB).then(() => {
            console.log('Connected to MongoDB'.green);
        }).catch((err) => {
            console.log(err, '\nFailed to connect to MongoDB'.red);
        });

        console.log(`Logged in as ${client.user.tag}`);
    }
}