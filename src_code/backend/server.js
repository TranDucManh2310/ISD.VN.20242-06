const app = require('./app')
const connectDatabase = require('./config/database')
// const mongoose = require("mongoose");
// const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2
const cors = require('cors')  // Import cors

// Handle Uncaught exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down due to uncaught exception');
    process.exit(1)
})

// Setting up config file
if (process.env.NODE_ENV !== 'PRODUCTION') require('dotenv').config({ path: 'backend/config/config.env' })

// Enable CORS for all origins or specify allowed origins
app.use(cors({
    origin: 'http://localhost:3000',  // Thêm domain của frontend
    methods: ['GET', 'POST','DELETE','PUT'],        // Phương thức bạn muốn cho phép
    allowedHeaders: ['Content-Type', 'Authorization'],  // Các header mà bạn muốn cho phép
    credentials: true
}))

// Connecting to database
connectDatabase()

// Setting up cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

// Handle Unhandled Promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down the server due to Unhandled Promise rejection');
    server.close(() => {
        process.exit(1)
    })
})
