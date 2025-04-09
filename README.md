# hachakton_mia

Elements réalisés 
- Création d'images pour le front end, le back end, la base de données Mongo, et Redis (4 au total)

- Création de volumes pour Mongo et Redis (2 au total)

- Création d'un réseau pour lier les images entre elles

- Correction de l'URL de la BDD dans le .env pour passer de
MONGODB_URI=mongodb://127.0.0.1:27017/twitter
à
MONGODB_URI=mongodb://admin:password@mongodb:27017/twitter?authSource=admin

-Modification de l'image du backend pour inclure le .env (sinon les variables étaient pas enregistrées et provoquaient une erreur)

Etat des choses à la fin de la journée
Le frontend, backend, MongDB et Redis sont connectés entre eux
L’application est partiellement fonctionnelle donc tester est difficile, mais on peut vérifier ça grâce à la fonctionnalité d’inscription :
Si on essaie de s’inscrire deux fois avec le même mail ou nom d’utilisateur, la première fois ça fonctionne, la deuxième non, car l'email/nom est déjà utilisé
