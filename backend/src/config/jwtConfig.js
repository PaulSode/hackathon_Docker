const dotenv = require('dotenv')
dotenv.config()

const jwtConfig = {
    secret: process.env.JWT_SECRET,
    accessTokenExpiration: process.env.JWT_EXPIRE,
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRE,
    issuer: 'tweeter-app',
    audience: 'tweeter-users'
  }

module.exports = jwtConfig