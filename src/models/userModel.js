const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        require: true
    },
    pincode: {
        type: String,
        require: true
    },
    aadharNumber: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    vaccinationStatus: {
        type: String,
        enum: ["none", "first_dose", "second_dose"],
        default: "none"
    },
    registeredSlots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccineSlot"
    }],
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)