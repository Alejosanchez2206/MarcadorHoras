const { Schema, model } = require('mongoose');

const employeedSchema = new Schema({
    guildId: String,
    userId: String,
    firstName: String, 
    lastName: String,
    userName: String,
    userAvatar: String,
    dateJoin: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    performanceObservations: [
        {
            date: { type: Date, default: Date.now },
            observation: { type: String, required: true },
            createdById: { type: String, required: true }
        }
    ],
    improvementPlans: [
        {
            planName: { type: String, required: true },
            observations: { type: String, required: true },
            startDate: { type: Date, default: Date.now },
            endDate: { type: Date },
            followUp: { type: String },
            createdById: { type: String, required: true }
        }
    ],
    promotionsLog: [
        {
            date: { type: Date, default: Date.now },
            previousRank: { type: String, required: true }, 
            newRank: { type: String, required: true },
            createdById: { type: String, required: true } 
        }
    ]

}, {
    timestamps: true,
    versionKey: false
});


module.exports = model('employees', employeedSchema);
