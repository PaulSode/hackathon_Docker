const multer = require('multer')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

dotenv.config()

// Vérifier et créer le dossier "uploads/"
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// Configuration de stockage pour Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Stocker les fichiers dans le dossier "uploads"
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filtrer les fichiers acceptés (images et vidéos)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non supporté"), false);
  }
};

const upload = multer({ storage, fileFilter })



module.exports = { upload }
