const express = require("express")
const route = express.Router()

// Import required modules and controllers
const {
    registerUser,
    loginUser,
    getAvailableSlotsForDate,
    updateVaccineSlot,
    bookVaccineSlot
} = require("../controllers/userController")

const {
    createVaccinationDrive,
    loginAdmin,
    getTotalRegisteredUsers,
    getRegisteredSlots
} = require("../controllers/adminController")

const {
    validateRegistration,
    validateLogin,
    validateGetTotalRegisteredUsers
} = require("../middlewares/inputValidations")

const { adminAuthentication, adminAuthorisation } = require("../middlewares/adminAuth")
const { userAuthentication, userAuthorisation } = require("../middlewares/userAuth")


// User APIs:
route.post("/register_user", validateRegistration, registerUser)
route.post("/login_user", validateLogin, loginUser)
route.get("/vaccine_slots", userAuthentication, getAvailableSlotsForDate)
route.post("/book_vaccine_slot/:userId", userAuthentication, userAuthorisation, bookVaccineSlot)
route.put("/update_slot/:userId", userAuthentication, userAuthorisation, updateVaccineSlot)

// Admin APIs:
route.post("/login_admin", validateLogin, loginAdmin)
route.post("/create_vaccination_drive/:adminId",adminAuthentication,adminAuthorisation ,createVaccinationDrive) // optionaly
route.get("/registered_users/:adminId", adminAuthentication, adminAuthorisation, validateGetTotalRegisteredUsers, getTotalRegisteredUsers)
route.get("/registered_slots/:adminId", adminAuthentication, adminAuthorisation, getRegisteredSlots)

module.exports = route