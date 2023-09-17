
<h1 align="center">Vaccine Registration System</h1>

<p align="center">
  <img src="https://github.com/Bhagwan73/DSA/assets/115549589/8324ed60-cb59-4eb8-9103-270af08c00fd" alt="Vaccine Registration" width="200">
</p>

<p align="center">
  A secure and efficient vaccine registration system built with NodeJS and MongoDB.
</p>


---
## Table of Contents
- [Overview](#overview)
- [Vaccine Drive Details](#vaccine-drive-details)
- [Tech Stack](#tech-stack)
- [Use Cases](#use-cases)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Getting Started](#getting-started)


## Overview

This project is like an online system for booking vaccine appointments. People can register, book appointments, and change them if needed. Admins can keep track of registrations and available slots. It helps make the vaccination process easier for everyone.

## Vaccine Drive Details

- **Vaccination Drive Period**: The vaccination drive is scheduled from June 1st, 2023, to June 30th, 2023.

- **Vaccination Timings**: Vaccination slots are available every day from 10:00 AM to 5:00 PM.

- **Slot Duration**: Each vaccine slot has a duration of 30 minutes. Slots are scheduled as follows:
  - 10:00 AM to 10:30 AM
  - 10:30 AM to 11:00 AM
  - and so on...

- **Vaccine Doses**: There are 10 vaccine doses available in each slot. These doses are the same for both the first and second doses.

- **Total Available Vaccine Doses**: With 30 days of vaccination and 14 slots each day, there are a total of 4,200 vaccine doses available during the entire vaccination drive.

## Tech Stack
- Node.js
- MongoDB
- Express.js
- JWT for authentication
- Bcrypt for password hashing
  
## Use Cases

### For Users

1. **Register User**: Users can register by providing mandatory information such as Name, Phone Number, Age, Pincode, and Aadhar Number.

2. **User Login**: Registered users can log in using their phone number and password.

3. **View Available Slots**: Users can view available vaccine slots for a given day.

4. **Book Vaccine Slot**: Users can register for a vaccine slot (first or second dose) on a specified date and time. They can only book a second dose after completing their first dose.

5. **Update Registered Slot**: Users can update or change their registered vaccine slot up to 24 hours before the booked slot time.

### For Admins

1. **Admin Login**: Admins can log in using their credentials, which are manually created in the database.

2. **Total Registered Users**: Admins can check the total number of registered users and filter them by Age, Pincode, and Vaccination status.
3. **Registered Vaccine Slots**: Admins can view the number of registered vaccine slots for the first dose, second dose, and total on a given day.
4. **Create Vaccination Drive (Optional)**: Admins have the option to create a vaccination drive for a specific period, for example, from June 1st to June 30th, 2023. This API generates vaccine slot documents for vaccine availability during the specified period.

## API Endpoints

### User APIs

1. **User Registration**: Register a new user with mandatory details.

   - Endpoint: `POST /register_user`

   - Request Body:
     ```json
     {
       "name": "John Doe",
       "phoneNumber": "+919823142345",
       "age": 30,
       "pincode": "123456",
       "aadharNumber": "123456789012",
       "password": "John@123"
     }
     ```

   - Response (Success):
     ```json
       {
          "status": true,
          "message": "User registered successfully",
          "user": {
              "name": "John Doe",
              "phoneNumber": "+919823142345",
              "age": 30,
              "pincode": "123456",
              "aadharNumber": "123456789012",
              "password": "$2b$10$3HeoxMbLve9mgD9sLTzsBuZI3YYTT0fspXX216LDRrhfQL0t.wKQm",
              "vaccinationStatus": "none",
              "registeredSlots": [],
              "isAdmin": false,
              "_id": "650738e1be9adc041c15f012",
              "createdAt": "2023-09-17T17:35:29.664Z",
              "updatedAt": "2023-09-17T17:35:29.664Z",
              "__v": 0
          }
       }
     ```

   - Response (Failure):
     ```json
     {
       "status": false,
       "message": "Invalid phone number. Make sure you have added +91 before the number."
     }
     ```

2. **User Login**: User login with phone number and password.

   - Endpoint: `POST /login_user`

   - Request Body:
     ```json
     {
       "phoneNumber": "+919823142345",
       "password": "John@123"
     }
     ```

   - Response (Success):
     
     ```json
     {
       "status": true,
       "message": "Login successful",
       "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" 
     }
     ```

   - Response (Failure):
     ```json
     {
       "status": false,
       "message": "User not found. Please check your phone number or register for an account."
     }
     ```

3. **View Available Slots**: View available vaccine slots for a given date .

   - Endpoint: `GET / vaccine_slots/`

   - Request Query Parameters:
     - `date` (required): Date in the format "YYYY-MM-DD"

   - Response (Success):
     ```json
     {
       "status": true,
       "message": "Available vaccine slots",
       "availableSlots": [
         {
           "date": "2023-06-01",
           "startTime": "10:00 AM",
           "endTime": "10:30 AM",
           "availableDoses": 5
         },
         // More available slots...
       ]
     }
     ```

   - Response (Failure):
     ```json
     {
       "status": false,
       "message": "Vaccination registration are only available from 1st June 2021 to 30th June 2021."
     }
     ```

4. **Book Vaccine Slot**: Book a vaccine slot for the first or second dose.

   - Endpoint: `POST /book_vaccine_slot/:userId

   - Request Parameters:
     - `userId`: UserId for authentication

   - Request Body:
     ```json
     {
       "date": "2023-06-01",
       "time": "10:00 AM"
     }
     ```

   - Response (Success):
     ```json
     {
       "status": true,
       "message": "You have successfully booked a slot for the first dose on 2023-06-01 at 10:00 AM."
     }
     ```

   - Response (Failure):
     ```json
     {
        "status": false,
        "message": "You have already received your second dose. No further bookings are allowed."
     }
     ```

5. **Update Registered Slot**: Modify a registered vaccine slot up to 24 hours before the appointment.

   - Endpoint: `PUT /update_slot/:userId"`

   - Request Parameters:
     - `userId`: userId for authentication

   - Request Body:
     ```json
     {
       "newDate": "2023-06-02",
       "newTime": "11:00 AM"
     }
     ```

   - Response (Success):
     ```json
     {
       "status": true,
       "message": "You have successfully updated your first_dose on 2023-06-02 at 11:00 AM."
     }
     ```

   - Response (Failure):
     ```json
     {
       "status": false,
       "message": "The new slot date is the same as the previous booked slot date."
     }
     ```

### Admin APIs

1. **Admin Login**: Admin login using admin credentials.

   - Endpoint: `POST /login_admin`

   - Request Body:
     ```json
     {
       "phoneNumber": "+918968236732",
       "password": "admin@12345"
     }
     ```

   - Response (Success):
     ```json
     {
       "status": true,
       "message": "Admin logged in successfully",
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
     }
     ```

   - Response (Failure):
     ```json
     {
       "status": false,
       "message": "Invalid admin credentials"
     }
     ```

2. **Total Registered Users**: Check the total number of registered users and filter by age, pincode, and vaccination status.

   - Endpoint: `GET /aregistered_users`
   - Request Parameters:
     - `adminId`: adminId for authentication
   - Request Query Parameters (Optional):
     - `vaccinationStatus`: "none", "first_dose", or "second_dose"
     - `pincode`: User's pincode
     - `minAge`: Minimum age of users to filter
     - `maxAge`: Maximum age of users to filter

   - Response (Success):
     ```json
     {
       "status": true,
       "message": "Registered users found successfully",
       "registeredUsers": [
         {
            "_id": "650738e1be9adc041c15f012",
            "name": "John Doe",
            "phoneNumber": "+919823142345",
            "age": 30,
            "pincode": "123456",
            "aadharNumber": "123456789012",
            "password": "$2b$10$3HeoxMbLve9mgD9sLTzsBuZI3YYTT0fspXX216LDRrhfQL0t.wKQm",
            "vaccinationStatus": "none",
            "registeredSlots": [],
            "isAdmin": false,
            "createdAt": "2023-09-17T17:35:29.664Z",
            "updatedAt": "2023-09-17T17:35:29.664Z",
            "__v": 0
        }
         // More user objects...
       ],
       "totalUsers": 5
     }
     ```

   - Response (Failure):
     ```json
     {
       "status": false,
       "message": "No registered users found."
     }
     ```

3. **Registered Vaccine Slots**: View the number of registered vaccine slots for the first dose, second dose, and total on a given day.

   - Endpoint: `GET /registered_slots`
   - Request Parameters:
     - `adminId`: adminId for authentication
   - Request Query Parameter:
     - `date` (required): Date in the format "YYYY-MM-DD"

   - Response (Success):
     ```json
     {
       "status": true,
       "message": "Registered vaccine slots for 2023-06-01 retrieved successfully",
       "registeredSlots": {
         "totalBookedSlotsForFirstDose": 30,
         "totalBookedSlotsForSecondDose": 15,
         "totalBookedSlots": 45
       }
     }
     ```

   - Response (Failure):
     ```json
     {
       "status": false,
       "message": "No registered vaccine slots found for the specified date."
     }
     ```
4. **Create Vaccination Drive (Optional)**: Admins have the option to create a vaccination drive for a specific period, for example, from June 1st to June 30th, 2023. This API generates vaccine slot documents for vaccine availability during the specified period.

- Endpoint: `POST /create_vaccination_drive`

## Database Models

### User Model

- `name`: User's name.
- `phoneNumber`: User's phone number (unique).
- `age`: User's age.
- `pincode`: User's pincode.
- `aadharNumber`: User's Aadhar number (unique).
- `password`: User's hashed password.
- `vaccinationStatus`: User's vaccination status ("none", "first_dose", "second_dose").
- `registeredSlots`: Array of vaccine slot IDs.
- `isAdmin`: Boolean indicating admin status.

### Vaccine Slot Model

- `date`: Date of the vaccine slot.
- `startTime`: Start time of the slot.
- `endTime`: End time of the slot.
- `availableDoses`: Number of available vaccine doses.
- `bookedSlotsForFirstDose`: Number of booked slots for the first dose.
- `bookedSlotsForSecondDose`: Number of booked slots for the second dose.


## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Bhagwan73/VaccineRegistrationSystem.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file with your configuration.

4. Start the application:

   ```bash
   npm start
   ```
---

