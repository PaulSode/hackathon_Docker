const emailService = require('../services/emailService')
const { User } = require('../models')
const bcrypt = require('bcryptjs')

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        
        const user = await User.findOne({ email })
        
        if (!user) {
            return res.status(404).json({ message: 'Aucun compte associé à cet email' })
        }
        
        const resetToken = emailService.generateToken()
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000)
        
        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = resetTokenExpires
        await user.save()
        
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
        
        try {
            await emailService.sendPasswordResetEmail(user, resetUrl)
          } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', emailError)
          }
        
        res.status(200).json({ message: 'Email de réinitialisation envoyé' })
    } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}
  
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        })
        
        if (!user) {
            return res.status(400).json({ message: 'Token de réinitialisation invalide ou expiré' })
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()
        
        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' })
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error)
        res.status(500).json({ message: 'Erreur serveur' })
    }
}

module.exports = { 
    forgotPassword, 
    resetPassword
}