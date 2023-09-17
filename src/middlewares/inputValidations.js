

const { body ,query} = require("express-validator")


exports.validateRegistration = [
    body("name")
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    body('phoneNumber')
        .isMobilePhone("en-IN").withMessage('Invalid phone number. Make sure you have added +91 before the number.'),
    body('age')
        .isInt({ min: 18, max: 100 }).withMessage('Age must be an integer between 18 and 100'),
    body('pincode')
        .isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 characters long')
        .isNumeric().withMessage('Pincode must be a numeric value'),
    body('aadharNumber')
        .isLength({ min: 12, max: 12 }).withMessage('Aadhar number must be 12 characters long')
        .isNumeric().withMessage('Aadhar number must be a numeric value'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .isString().withMessage('Password must be a string'),
];


exports.validateLogin = [
    body('phoneNumber')
        .isMobilePhone("en-IN").withMessage('Invalid phone number. Make sure you have added +91 before the number.'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .isString().withMessage('Password must be a string'),
];

exports.validateGetTotalRegisteredUsers = [
    query('vaccinationStatus').optional()
        .isIn(['none', 'first_dose', 'second_dose']).withMessage("Invalid vaccination status. The allowed values are 'none' ,'first_dose' or 'second_dose'."),
    query('pincode').optional()
        .isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 characters long'),
    query('minAge').optional()
        .isInt({ min: 18,max:100 }).withMessage('minAge must be in between 18 and 100'),
    query('maxAge').optional()
        .isInt({ min: 18,max:100  }).withMessage('maxAge must be in between 18 and 100')
];


exports.isValidDate = (inputDate) => {
    if (!inputDate) return { status: false, message: "Date is required" }
    // validate date format in "YYYY-MM-DD" format
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!pattern.test(inputDate)) return { status: false, message: "Invalid date format. Please use the format 'YYYY-MM-DD'." }
    // check date range (between 1st June 2023 to 30th June 2023)
    const date = new Date(inputDate);
    const startDate = new Date('2023-06-01');
    const endDate = new Date('2023-06-30');
    if (!(date >= startDate) || !(date <= endDate)) return { status: false, message: "Vaccination registration are only available from 1st June 2021 to 30th June 2021." };
    // if the date is valid
    return { status: true, message: "Date is valid." };
}


exports.isValidTimeFormat = (time) => {
    const pattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/
    if(!time) return false
    return pattern.test(time)
}