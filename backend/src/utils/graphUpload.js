const multer = require('multer')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

dotenv.config()

// Fonction pour gérer l'upload d'un fichier dans GraphQL
const handleUpload = async (uploadFile) => {
  const { createReadStream, filename } = await uploadFile
  const stream = createReadStream()
  const filePath = path.join(__dirname, '../uploads', filename)
  const writeStream = fs.createWriteStream(filePath)

  return new Promise((resolve, reject) => {
    stream.pipe(writeStream)
    writeStream.on('finish', () => resolve(`/uploads/${filename}`))
    writeStream.on('error', reject)
  })
}

module.exports = { handleUpload }