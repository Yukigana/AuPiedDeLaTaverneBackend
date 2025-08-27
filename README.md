# 🎲 AuPiedDeLaTaverneBackend

Backend Node.js/TypeScript pour une application de jeu de rôle (JDR) permettant de :
- Créer et gérer des **tables de jeu** (salles).
- Ajouter des **joueurs** à une table.
- Authentifier les utilisateurs et gérer leurs **rôles** (`admin`, `player`).
- Sécuriser les formulaires et les accès avec **JWT**, **Helmet** et **Rate Limiting**.
- Tracer l’activité avec des **logs Winston**.

---

## 📚 Stack technique

- **Runtime** : Node.js (ES Modules) + TypeScript
- **Framework** : Express 5
- **Base de données** : MongoDB + Mongoose
- **Auth** : JWT + bcrypt
- **Sécurité** : helmet, express-rate-limit, CORS
- **Logs** : winston (multi niveaux)
- **Dev** : nodemon + build TypeScript (exécution JS compilé)

---

## 🗂️ Structure du projet

src/
config/
logger.ts
middleware/
authMiddleware.ts
roleMiddleware.ts (optionnel)
models/
Role.ts
Table.ts
User.ts
routes/
auth.ts
table.ts
scripts/
initRoles.ts
initUsers.ts
index.ts

yaml
Copier le code

> Le build TypeScript génère `dist/` avec la même arborescence.

---

## ⚙️ Prérequis

- **Node.js ≥ 20**
- **MongoDB ≥ 6** démarré en local (ou URL distante)

---

## 🔐 Variables d’environnement

Créer un fichier `.env` à la racine :

```env
MONGO_URI=mongodb://localhost:27017/jdr
LOG_LEVEL=info
JWT_SECRET=tonSecretUltraSecurise
MONGO_URI : URI MongoDB

LOG_LEVEL : crit | error | warn | info | debug (défaut: info)

JWT_SECRET : secret pour signer les JWT (à changer en prod)

🚀 Installation & Lancement
bash
Copier le code
# 1) Installer les dépendances
npm install

# 2) Compiler en JS (dans ./dist)
npm run build

# 3a) Lancer en DEV (watch sur dist/index.js via nodemon)
npm run dev

# 3b) OU lancer en PROD (après build)
npm start
Le mode dev n’utilise pas ts-node : on compile puis on exécute le JS. C’est plus stable, notamment avec Node 22.

🧪 Scripts utiles
bash
Copier le code
# Initialiser les rôles de base (admin, player)
npm run init:roles

# Créer des utilisateurs de test (admin/test & player/test)
npm run init:users
Comptes créés par défaut :

Admin → admin@test.com / admin123

Player → player@test.com / player123

🔑 Authentification & Rôles
Inscription : POST /auth/register
Body minimal : { "username": "Bob", "email": "bob@mail.com", "password": "secret" }
(optionnel) roles: ["admin"] si le rôle existe en base.

Connexion : POST /auth/login
Body : { "email": "bob@mail.com", "password": "secret" }
Réponse : { token, user }.

Moi : GET /auth/me (protégée)
Header : Authorization: Bearer <JWT>
Réponse : infos utilisateur (sans mot de passe), rôles peuplés.

Rôles : stockés en collection roles (admin, player).
Les scripts init:roles et init:users facilitent les tests.

🎲 Tables (API)
Lister toutes les tables (public) : GET /table
Réponse : liste des tables (avec mj & players peuplés).

Créer une table (protégé) : POST /table
Header : Authorization: Bearer <JWT>
Body minimal :

json
Copier le code
{
  "name": "Table du soir",
  "description": "Initiation",
  "maxPlayers": 5,
  "sessionDate": "2025-09-01T18:00:00.000Z",
  "restrictedToAdherents": false
}
Le MJ est automatiquement l’utilisateur connecté (req.user.id).

Voir MES tables (protégé) : GET /table/mine
Renvoie uniquement les tables dont je suis MJ.

Rejoindre une table (protégé) : POST /table/:id/players
Ajoute l’utilisateur connecté dans players si :

pas déjà inscrit

la table n’est pas pleine (maxPlayers)

Les validations métier et les erreurs sont renvoyées en JSON (400/401/403/404/500).
Les opérations sont loggées (info/warn/error).

🛡️ Sécurité des formulaires
Déjà en place :

Validation manuelle des champs :

register : username ≥ 3, email valide, password ≥ 6

table : name ≥ 3, maxPlayers ≥ 1, sessionDate ISO valide

Mots de passe hashés avec bcrypt (jamais en clair).

JWT obligatoire pour toute route sensible (création table, rejoindre, /auth/me, /table/mine).

Helmet : en-têtes HTTP sécurisés (mitigation XSS de base, clickjacking, sniffing).

Rate limiting sur /auth/* : 20 requêtes / 15 min / IP (anti brute force).

Règles métier : impossible de rejoindre deux fois, impossible si table pleine.

À prévoir (non implémenté) :

CSRF avancé (csurf) si usage cookies.

Sanitation HTML côté back (sanitize-html) si on affiche du contenu riche.

HTTPS obligatoire en production (certificats, proxy).

📝 Logs applicatifs (Winston)
Niveaux disponibles : crit, error, warn, info, debug.

Contrôle via LOG_LEVEL (défaut info) :

bash
Copier le code
LOG_LEVEL=debug npm start
Exemples :

Connexion/inscription : info / warn sur erreurs.

Création/rejoindre table : info + contrôles métier (warn si refus).

Erreurs serveurs : error (et crit si indisponibilité).

Les logs peuvent être envoyés vers une solution d’analytics (ELK, Grafana/Loki) — non implémenté mais recommandé en prod.

❗ Dépannage rapide
500 + "Unexpected token '<'… is not valid JSON"
→ L’API renvoie une page HTML d’erreur. Vérifier :

Body JSON envoyé (header Content-Type: application/json + JSON.stringify).

Champs requis côté backend (messages d’erreur 400 détaillés).

Console serveur (logs Winston).

401 / 403 sur routes protégées
→ Ajouter Authorization: Bearer <JWT> dans les headers.
→ Vérifier l’expiration/validité du token.

Mongo non connecté
→ Vérifier MONGO_URI (fichier .env), que MongoDB tourne bien.

Problèmes Node 22 / ts-node
→ Le projet compile d’abord (npm run build), puis exécute du JS avec Node.
→ Pas de ts-node en runtime, donc compatible Node 20/22.

✅ Récap fonctionnalités
Auth (register/login/me) + JWT + rôles (admin, player).

CRUD de tables côté MJ (création) + inscription des joueurs.

Sécurité : helmet, rate-limit, validations manuelles, bcrypt, JWT.

Logs Winston sur les actions clés et erreurs.

Scripts seed pour rôles et utilisateurs de test.

👤 Auteur
Projet développé dans le cadre des ateliers (logs, auth, sécurité) : Au Pied de la Taverne.