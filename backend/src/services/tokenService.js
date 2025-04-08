const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwtConfig')
const redisClient = require('../config/redis')

// Préfixes pour les clés Redis
const ACCESS_TOKEN_PREFIX = 'access_token:'
const REFRESH_TOKEN_PREFIX = 'refresh_token:'
const BLACKLIST_PREFIX = 'blacklist:'

const generateTokens = async (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email
    }
    const accessToken = jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.accessTokenExpiration,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
    })
    
    const refreshToken = jwt.sign({ id: user._id }, jwtConfig.secret, {
        expiresIn: jwtConfig.refreshTokenExpiration,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
    })

    const accessExpiry = parseInt(jwtConfig.accessTokenExpiration) || 7200
    const refreshExpiry = parseInt(jwtConfig.refreshTokenExpiration) || 604800

    await redisClient.setex(
        `${ACCESS_TOKEN_PREFIX}${user._id}`,
        accessExpiry,
        accessToken
    )
    
    await redisClient.setex(
        `${REFRESH_TOKEN_PREFIX}${user._id}`,
        refreshExpiry,
        refreshToken
    )
    
    return { accessToken, refreshToken }
}

const isTokenBlacklisted = async (token) => {
    const blacklisted = await redisClient.get(`${BLACKLIST_PREFIX}${token}`)
    return !!blacklisted
}

const blacklistToken = async (token, expiry = 3600) => {
    await redisClient.setex(`${BLACKLIST_PREFIX}${token}`, expiry, 'true')
}

const verifyToken = async (token) => {
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
        throw new Error('Token is blacklisted');
    }
    
    const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
    })
    
    return decoded
}

const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, jwtConfig.secret, {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        })
        
        const accessToken = jwt.sign({ id: decoded.id }, jwtConfig.secret, {
            expiresIn: jwtConfig.accessTokenExpiration,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        })
        
        return accessToken;
    } catch (error) {
        console.error("Error in refreshAccessToken:", error);
        throw error;
    }
}

const revokeAllUserTokens = async (userId) => {
    await redisClient.del(`${ACCESS_TOKEN_PREFIX}${userId}`)
    await redisClient.del(`${REFRESH_TOKEN_PREFIX}${userId}`)
}

module.exports = {
    generateTokens,
    verifyToken,
    blacklistToken,
    isTokenBlacklisted,
    refreshAccessToken,
    revokeAllUserTokens
}