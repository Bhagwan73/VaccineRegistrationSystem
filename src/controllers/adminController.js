
const { validationResult } = require("express-validator")
const { isValidDate } = require("../middlewares/inputValidations")
const userModel = require("../models/userModel")
const vaccineSlotModel = require("../models/vaccineSlotModel")
const { compareSync } = require("bcrypt")
const { sign } = require("jsonwebtoken")


// Admin login
exports.loginAdmin = async (req, res) => {
    try {
        // validate the request body using Express Validator middleware.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((err) => err.msg);
            return res.status(400).send({ status: false, errorMessages });
        }
        const { phoneNumber, password } = req.body
        const admin = await userModel.findOne({ phoneNumber: phoneNumber })
        if (!admin) return res.status(401).send({ status: false, message: "Invalid admin credentials" })

         // compare the provided password with the hashed password
        const comparePass = compareSync(password, admin.password)
        if (!comparePass) return res.status(400).send({ status: false, message: "Incorrect password. Please double-check your password and try again." })

        // check user is an admin or not.
        if (!admin.isAdmin) return res.status(403).send({ status: false, message: "Access denied. Not an admin." })
        // Generate a JWT token for admin authentication.
        sign({ adminId: admin._id, phoneNumber: phoneNumber }, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
            if (err) return res.status(400).send({ status: false, error: err })
            return res.status(200).send({ status: true, message: "Admin logged in successfully", token })
        })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


// Get the total number of registered users & filter users by Age/Pincode/Vaccination status.
exports.getTotalRegisteredUsers = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((err) => err.msg);
            return res.status(400).send({ status: false, errorMessages });
        }
        // prepare a query to filter users.
        let query = { isAdmin: false }
        const { vaccinationStatus, pincode, minAge, maxAge } = req.query
        
        // add filters if provided in the query.
        if (minAge) query['age'] = { $gte: minAge }
        if (maxAge) query['age'] = { ...query.age, $lte: maxAge }
        if (pincode) query['pincode'] = pincode
        if (vaccinationStatus) query['vaccinationStatus'] = vaccinationStatus

        // fetch registered users based on the query.
        const registeredUsers = await userModel.find(query)
        // count documents
        const counteUsers = await userModel.countDocuments(query)
        if (registeredUsers.length == 0) return res.status(404).send({ status: false, message: `No registered users found.` })
        return res.status(200).send({ status: true, message: `Registered users found successfully. Total users: ${counteUsers}`, registeredUsers })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
};


// Get all registered  vaccines (first dose / second dose / total) on a given day.
exports.getRegisteredSlots = async (req, res) => {
    try {
        // validate the provided date.
        const validateDate = isValidDate(req.query.date)
        if (!validateDate.status) return res.status(400).send({ status: false, message: validateDate.message })
        const date = new Date(req.query.date)

       // aggregate vaccine slots for the specified date.
        const slots = await vaccineSlotModel.aggregate([
            { $match: { date: date } },
            {
                $group: {
                    _id: null,
                    totalBookedSlotsForFirstDose: { $sum: "$bookedSlotsForFirstDose" },
                    totalBookedSlotsForSecondDose: { $sum: "$bookedSlotsForSecondDose" }
                }
            }
        ])
        // calculate the total registered slots.
        const registeredSlots = {
            totalBookedSlotsForFirstDose: slots[0].totalBookedSlotsForFirstDose,
            totalBookedSlotsForSecondDose: slots[0].totalBookedSlotsForSecondDose,
            totalBookedSlots: slots[0].totalBookedSlotsForFirstDose + slots[0].totalBookedSlotsForSecondDose
        }
        if (registeredSlots.totalBookedSlots == 0) {
            return res.status(404).send({ status: false, message: "No registered vaccine slots found for this specific date." })
        }
        return res.status(200).send({ status: true, message: `Registered vaccine slots for ${date.toDateString()} retrieved successfully`, registeredSlots })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
};



// (Optional) 
// Generate slot documents for vaccine availability from June 1st to June 30th
exports.createVaccinationDrive = async (req, res) => {
    try {
        // create array to store vaccine slot documents
        const vaccineSlots = []

         // loop through the dates and times to create slots.
        for (let date = 1; date <= 30; date++) {
            for (let time = 10; time < 17; time++) {
                const newDate = date <= 9 ? new Date(`2023-06-0${date}`) : new Date(`2023-06-${date}`)
                let hour = time > 12 ? `0${(time - 12)}` : time
                const timeZone = time >= 12 ? 'PM' : 'AM'
               
                 // create two vaccine slots for each hour.
                const vaccineSlot1 = {
                    date: newDate,
                    startTime: `${hour}:00 ${timeZone}`,
                    endTime: `${hour}:30 ${timeZone}`,
                    availableDoses: 10
                }
                const vaccineSlot2 = {
                    date: newDate,
                    startTime: `${hour}:30 ${timeZone}`,
                    endTime: `${hour == 12 ? '01' : (hour >= 1 && hour <= 5) ? '0' + (parseInt(hour) + 1) : parseInt(hour) + 1}:00 ${hour == 11 ? 'PM' : timeZone}`,
                    availableDoses: 10
                }
                 // push the slots in array.
                vaccineSlots.push(vaccineSlot1)
                vaccineSlots.push(vaccineSlot2)
            }
        }
        // insert documents in database
        const insertSlots = await vaccineSlotModel.insertMany(vaccineSlots)
        return res.status(201).send({ status: true, message: "Vaccine slots have been successfully added.", slots: insertSlots })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
