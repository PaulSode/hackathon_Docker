FROM node:18

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 3001

# Commande pour démarrer l'application en développement
CMD ["npm", "run", "dev", "--", "-p", "3001"]