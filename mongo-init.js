// Ce script sera exécuté à l'initialisation de MongoDB
db = db.getSiblingDB('tweeter');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'tweeter_user',
  pwd: 'tweeter_password',
  roles: [
    { role: 'readWrite', db: 'tweeter' }
  ]
});

// Créer les collections de base
db.createCollection('users');
db.createCollection('tweets');
db.createCollection('likes');
db.createCollection('comments');
db.createCollection('hashtags');

// Ajouter un utilisateur admin pour les tests
db.users.insertOne({
  username: 'admin',
  email: 'admin@example.com',
  password: '$2a$10$eDIf.I7XTuBxFx4m8HoLUeRz1mUZ1YCWcB1CUoQHQMd5BrOdCUXGO', // bcrypt de "Password1"
  bio: 'Administrateur du système',
  profile_img: 'default-profile.png',
  banniere_img: 'default-banner.png',
  followers: [],
  followings: [],
  bookmarks: [],
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});