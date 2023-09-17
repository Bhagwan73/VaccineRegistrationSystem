
const mongoose = require("mongoose")

const vaccineSlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    availableDoses: {
        type: Number,
        default: 10
    },
    bookedSlotsForFirstDose: {
        type: Number,
        default: 0
    },
    bookedSlotsForSecondDose: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model('VaccineSlot', vaccineSlotSchema);

