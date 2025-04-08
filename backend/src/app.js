const express = require('express')
const cors = require('cors')
const path = require("path")
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const fs = require("fs")
const { graphqlUploadExpress } = require('graphql-upload')

const tweetsRoute = require('./routes/tweetsRoute')
const usersRoute = require('./routes/usersRoute')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')

dotenv.config()
const app = express()
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use("/api", express.json());
app.use("/api", express.urlencoded({ extended: true }));
app.use('/api/tweets', tweetsRoute)
app.use('/api/users', usersRoute)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))
app.use("/graphql", graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 5 }));

module.exports = app