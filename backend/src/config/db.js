const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()
const url = process.env.MONGODB_URI

const connectDB = async () => {
    try {
        await mongoose.connect(url)
        console.log('Connected to the database')
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB