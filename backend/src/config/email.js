const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

dotenv.config()

let transporter

const initializeTransporter = async () => {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    return transporter
}

(async () => {
    try {
        transporter = await initializeTransporter();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du transporteur email:', error);
    }
})()

const sendEmail = async (options) => {
    if (!transporter) {
        transporter = await initializeTransporter()
    }
    
    const info = await transporter.sendMail(options)
    
    return info
}

module.exports = { initializeTransporter, sendEmail, getTransporter: () => transporter }