const { hashSync, compareSync } = require("bcrypt")
const { sign } = require("jsonwebtoken")
const userModel = require("../models/userModel")
const vaccineSlotModel = require("../models/vaccineSlotModel")
const { validationResult } = require("express-validator")
const { isValidDate, isValidTimeFormat } = require("../middlewares/inputValidations")
require("dotenv").config({ path: ".env" })

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        // validate the incoming request data.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array()[0].msg;
            return res.status(400).send({ status: false, message:errorMessage });
        }
        const data = req.body
        const { password, phoneNumber, aadharNumber } = data

        // check if phone number or Aadhar number is already in use.
        const uniqueCredentials = await userModel.findOne({ $or: [{ phoneNumber }, { aadharNumber }] })
        if (uniqueCredentials) return res.status(400).send({ status: false, message: "Phone number or Aadhar number is already in use." })

        // hash the user's password.
        data['password'] = hashSync(password, 10)
        // create a new user document
        const user = await userModel.create(data)
        return res.status(201).send({ status: true, message: 'User registered successfully', user })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// User login
exports.loginUser = async (req, res) => {
    try {
        // validate the incoming request data.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessage = errors.array()[0].msg;
            return res.status(400).send({ status: false, message:errorMessage });
        }
        const { phoneNumber, password } = req.body

        // find user by their phone number.
        const user = await userModel.findOne({ phoneNumber: phoneNumber })
        if (!user) return res.status(404).send({ status: false, message: "User not found. Please check your phone number or register for an account." })

        // compare the provided password with the stored hashed password.
        const comparePass = compareSync(password, user.password)
        if (!comparePass) return res.status(400).send({ status: false, message: "Incorrect password. Please double-check your password and try again." })

        // generate a JSON Web Token
        sign({ userId: user._id, phoneNumber: phoneNumber }, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) return res.status(400).send({ status: false, error: err })
            return res.status(200).send({ status: true, message: "Login successful" , token})
        })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// Get available vaccine slots for a given date
exports.getAvailableSlotsForDate = async (req, res) => {
    try {
        // validate date format.
        const validateDate = isValidDate(req.query.date)
        if (!validateDate.status) return res.status(400).send({ status: false, message: validateDate.message })
        const date = new Date(req.query.date)

        // find available vaccine slots for the specific date.
        const availableSlots = await vaccineSlotModel.find({ date: date, availableDoses: { $gt: 0 } })
        if (availableSlots.length == 0) return res.status(404).send({ status: false, message: "No available vaccine slots found for the specified date." })
        return res.status(200).send({ status: true, message: "Available vaccine slots", availableSlots })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



// Book a vaccine slot
exports.bookVaccineSlot = async (req, res) => {
    try {
        let { date, time } = req.body
        // validate date format.
        const validateDate = isValidDate(date)
        if (!validateDate.status) return res.status(400).send({ status: false, message: validateDate.message })
        // validate time format.
        if (!isValidTimeFormat(time)) return res.status(400).send({ sattus: false, message: "Invalid time format. Please use 'HH:MM AM/PM' format." })
        const { userId } = req.params
        date = new Date(date)

        // find user by their Id.
        const user = await userModel.findById({ _id: userId })
        if (!user) return res.status(404).send({ status: false, message: "User not found. Please check the provided userId." })

        // check if the user has already received the second dose.
        if (user.vaccinationStatus === "second_dose") return res.status(400).send({ status: false, message: "You have already received your second dose. No further bookings are allowed." })
        const dose = user.vaccinationStatus === "none" ? "first_dose" : "second_dose"

        // find available vaccine slot for specific date and time.
        const slot = await vaccineSlotModel.findOne({ date: date, startTime: time, availableDoses: { $gt: 0 } })
        if (!slot) return res.status(404).send({ status: false, message: `No available vaccine slot found on ${date.toDateString()} at ${time}.` })

        // update the booked slot and user document.
        const incrementBookedSlots = dose == "first_dose" ? { bookedSlotsForFirstDose: 1 } : { bookedSlotsForSecondDose: 1 }
        await vaccineSlotModel.findByIdAndUpdate({ _id: slot._id }, { $inc: { availableDoses: -1, ...incrementBookedSlots } })

        //update user document
        await userModel.findByIdAndUpdate({ _id: userId }, { $set: { vaccinationStatus: dose }, $push: { registeredSlots: slot._id } })
        return res.status(200).send({ status: true, message: `You have successfully booked a slot for the ${dose} on ${date.toDateString()} at ${time}.` })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// calculate the time difference in hours between two date-time strings
const dateDifference = (preSlotDate, newSlotDate) => {
    // parse date-time strings into Date objects
    const date1 = new Date(preSlotDate);
    const date2 = new Date(newSlotDate);

    // calculate the time difference in milliseconds
    const timeDifferenceMs = date1 - date2;

    // convert time difference to hours
    const hoursDifference = Math.abs(timeDifferenceMs / (60 * 60 * 1000));

    if (hoursDifference< 0.0001) return { status: false, message: "The new slot date is the same as the previous booked slot date." }
    if (hoursDifference > 24) return { status: false, message: "You can only update your slot up to 24 hours prior to your previous booked slot." }
    return { status: true, message: `Time difference in hours: ${hoursDifference} hours` }
}



// Update a vaccine slot
exports.updateVaccineSlot = async (req, res) => {
    try {
        let { newDate, newTime } = req.body
        // validate date format 
        const validateDate = isValidDate(newDate)
        if (!validateDate.status) return res.status(400).send({ status: false, message: validateDate.message })
        // validate time format 
        if (!isValidTimeFormat(newTime)) return res.status(400).send({ sattus: false, message: "Invalid time format. Please use 'HH:MM AM/PM' format." })
        
        const { userId } = req.params
        newDate = new Date(newDate)
        // find user by Id
        const user = await userModel.findById(userId)
        if (user.vaccinationStatus === "none") return res.status(400).send({ sattus: false, message: "You have not booked any dose for an update." })

        // take the previously booked slot Id
        const preBookedSlotId = user.registeredSlots[user.registeredSlots.length - 1]

        // find the new available vaccine slot
        const newSlot = await vaccineSlotModel.findOne({ date: newDate, startTime: newTime, availableDoses: { $gt: 0 } })
        if (!newSlot) return res.status(404).send({ status: false, message: `No available vaccine slot found on ${newDate.toDateString()} at ${newTime}.` })

        // calculate the time difference is 24 hours prior to previously booked slot 
        const preVaccineSlot = await vaccineSlotModel.findById(preBookedSlotId)
        const preSlotDateAndTime = new Date(preVaccineSlot.date).toISOString().split("T")[0] + " " + preVaccineSlot.startTime
        const newSlotDateAndTime = req.body.newDate + " " + newTime

        // call the dateDifference function to check the time difference 
        const isDiffPrior24Hour = dateDifference(preSlotDateAndTime, newSlotDateAndTime)
        if (!isDiffPrior24Hour.status) return res.status(400).send({ status: false, message: isDiffPrior24Hour.message })

        //update previously booked slot document
        const decrementBookedSlots = user.vaccinationStatus == "first_dose" ? { bookedSlotsForFirstDose: -1 } : { bookedSlotsForSecondDose: -1 }
        await vaccineSlotModel.findByIdAndUpdate(preBookedSlotId, { $inc: { availableDoses: 1, ...decrementBookedSlots } })

        // update new slot document.
        const incrementBookedSlots = user.vaccinationStatus == "first_dose" ? { bookedSlotsForFirstDose: 1 } : { bookedSlotsForSecondDose: 1 }
        await vaccineSlotModel.findByIdAndUpdate({ _id: newSlot._id }, { $inc: { availableDoses: -1, ...incrementBookedSlots } })

        //update user document
        await userModel.findByIdAndUpdate({_id:userId},{$push:{registeredSlots:newSlot._id}})
        return res.status(200).send({ status: true, message: `You have successfully updated your ${user.vaccinationStatus} on ${newDate.toDateString()} at ${newTime}.` })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}