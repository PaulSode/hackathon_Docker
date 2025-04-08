const { sendEmail } = require('../config/email')
const crypto = require('crypto')

const generateToken = () => {
  return crypto.randomBytes(20).toString('hex')
};

const sendVerificationEmail = async (user, verificationUrl) => {
  return await sendEmail({
    from: process.env.EMAIL_FROM || 'noreply@tweeter.com',
    to: user.email,
    subject: 'Vérification de votre compte Tweeter',
    html: `
      <h1>Bienvenue sur Tweeter!</h1>
      <p>Pour vérifier votre adresse email, veuillez cliquer sur le lien suivant:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
    `
  })
}

const sendPasswordResetEmail = async (user, resetUrl) => {
  return await sendEmail({
    from: process.env.EMAIL_FROM || 'noreply@tweeter.com',
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe Tweeter',
    html: `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
    `
  })
}

module.exports = {
    generateToken,
    sendVerificationEmail,
    sendPasswordResetEmail
}