<div align="center">
    <h1>STUDYNOOK BACKEND [ASSIGNMENT 9]</h1>
</div>

## ABOUT

StudyNook Backend is a secure, high-performance RESTful API server powered by Node.js, Express, and MongoDB. It acts as the orchestrator for the StudyNook room booking engine, delivering secure session management, cookie-based token validations, dynamic database seeding, and real-time calendar slot overlap verification. Developed as part of **Programming Hero Assignment 9**, this backend emphasizes highly secure server routes, custom Mongoose schema relationships, and advanced query sanitizations.

## TECH STACK

![NodeJS](https://img.shields.io/badge/Node.js-%2343853D.svg?style=flat-square&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-%23404d59.svg?style=flat-square&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-%234aa816.svg?style=flat-square&logo=mongodb&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black.svg?style=flat-square&logo=JSON%20web%20tokens&logoColor=white) ![Cookie Parser](https://img.shields.io/badge/Cookie_Parser-grey.svg?style=flat-square) ![Google Auth](https://img.shields.io/badge/Google_Auth-%234285F4.svg?style=flat-square&logo=google&logoColor=white)

## KEY FEATURES
1. **Secure Token Cookie Authentication:** Cookies are set with HTTP-only, secure attributes to prevent client-side JavaScript injection attacks and maintain robust session states.
2. **Double-Booking Prevention Algorithm:** Advanced server-side query filters analyze start/end timestamps on specific calendar days to prevent conflicting bookings for the same room.
3. **Dynamic Database Seeding Engine:** An integrated seeder engine automatically populates the database with default workspace listings and mock hosts if database collections are empty.
4. **Relational Mongoose Architecture:** Mongoose schemas support strict references between User models, Room profiles, and Booking logs to ensure data integrity.
