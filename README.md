# 🚗 MRepublique Mobile

Application mobile de livraison de restaurant avec interface client et livreur, développée avec **React Native** et **Expo**.

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [Structure du Projet](#structure-du-projet)
- [Commandes Disponibles](#commandes-disponibles)
- [Contribution](#contribution)
- [Licence](#licence)

---

## 🎯 Aperçu

**MRepublique** est une plateforme de livraison mobile complète permettant aux clients de commander depuis le catalogue du restaurant et aux livreurs de gérer leurs livraisons en temps réel.

**Caractéristiques principales:**
- 🛍️ Catalogue de produits interactif
- 🛒 Panier et gestion des commandes
- 📍 Suivi GPS en temps réel
- 👤 Interfaces distinctes client/livreur
- ⚡ Performance optimisée avec Expo

---

## ✨ Fonctionnalités

### 👥 Client
- Parcourir le catalogue du restaurant
- Ajouter/modifier les articles du panier
- Passer une commande
- Suivre la livraison en temps réel (GPS)
- Historique des commandes
- Notifications de statut

### 🚴 Livreur
- Visualiser les livraisons assignées
- Navigation GPS vers les lieux de livraison
- Mise à jour du statut de livraison
- Géolocalisation en temps réel

---

## 🛠️ Stack Technique

| Domaine | Technologie |
|---------|-----------|
| **Framework Mobile** | React Native 0.79.4 |
| **Compilateur** | Expo 53.0.13 |
| **Langage** | TypeScript 5.8.3 |
| **Navigation** | Expo Router 5.1.1 |
| **State Management** | React Context API |
| **HTTP Client** | Axios 1.9.0 |
| **Stockage Local** | AsyncStorage 2.1.2 |
| **Maps** | React Native Maps 1.20.1 |
| **Animations** | React Native Reanimated 3.17.4 |
| **UI/Icons** | Expo Vector Icons 14.1.0 |

---

## 📦 Installation

### Prérequis
- **Node.js** >= 18.x
- **npm** ou **yarn**
- **Expo CLI** (optionnel mais recommandé)

### Étapes

1. **Clone le dépôt:**
```bash
git clone https://github.com/70-DIDIER/Mrepublique-mobile.git
cd Mrepublique-mobile
> Allclaw:
Parfait! J'ai tous les infos. Voici un README complet et professionnel en français pour ton projet MRepublique Mobile:

# 🚗 MRepublique Mobile

Application mobile de livraison de restaurant avec interface client et livreur, développée avec **React Native** et **Expo**.

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [Structure du Projet](#structure-du-projet)
- [Commandes Disponibles](#commandes-disponibles)
- [Contribution](#contribution)
- [Licence](#licence)

---

## 🎯 Aperçu

**MRepublique** est une plateforme de livraison mobile complète permettant aux clients de commander depuis le catalogue du restaurant et aux livreurs de gérer leurs livraisons en temps réel.

**Caractéristiques principales:**
- 🛍️ Catalogue de produits interactif
- 🛒 Panier et gestion des commandes
- 📍 Suivi GPS en temps réel
- 👤 Interfaces distinctes client/livreur
- ⚡ Performance optimisée avec Expo

---

## ✨ Fonctionnalités

### 👥 Client
- Parcourir le catalogue du restaurant
- Ajouter/modifier les articles du panier
- Passer une commande
- Suivre la livraison en temps réel (GPS)
- Historique des commandes
- Notifications de statut

### 🚴 Livreur
- Visualiser les livraisons assignées
- Navigation GPS vers les lieux de livraison
- Mise à jour du statut de livraison
- Géolocalisation en temps réel

---

## 🛠️ Stack Technique

| Domaine | Technologie |
|---------|-----------|
| **Framework Mobile** | React Native 0.79.4 |
| **Compilateur** | Expo 53.0.13 |
| **Langage** | TypeScript 5.8.3 |
| **Navigation** | Expo Router 5.1.1 |
| **State Management** | React Context API |
| **HTTP Client** | Axios 1.9.0 |
| **Stockage Local** | AsyncStorage 2.1.2 |
| **Maps** | React Native Maps 1.20.1 |
| **Animations** | React Native Reanimated 3.17.4 |
| **UI/Icons** | Expo Vector Icons 14.1.0 |

---

## 📦 Installation

### Prérequis
- **Node.js** >= 18.x
- **npm** ou **yarn**
- **Expo CLI** (optionnel mais recommandé)

### Étapes

1. **Clone le dépôt:**
```bash
git clone https://github.com/70-DIDIER/Mrepublique-mobile.git
cd Mrepublique-mobile

2. Installe les dépendances:

npm install

3. Configure les variables d'environnement (si nécessaire):
Crée un fichier .env à la racine avec tes paramètres API:

API_BASE_URL=https://api.example.com
API_KEY=your_api_key_here

───

🚀 Démarrage

Développement

Démarrer le serveur Expo:

npm start

Options de démarrage:

# Android
npm run android

# iOS
npm run ios

# Web
npm run web

Scanne le QR code avec l'app Expo Go (iOS/Android) pour voir les changements en direct.

Production

Build pour Android/iOS:

eas build --platform android
eas build --platform ios

───

📂 Structure du Projet

Mrepublique-mobile/
├── app/                    # Routes Expo Router
├── components/             # Composants réutilisables
├── context/               # React Context (état global)
├── services/              # Appels API & utilitaires
├── constants/             # Constantes et configuration
├── assets/                # Images, polices, ressources
├── .vscode/               # Config VS Code
├── app.json               # Config Expo
├── eas.json              # Config EAS Build
├── tsconfig.json         # Config TypeScript
├── eslint.config.js      # Config ESLint
└── package.json          # Dépendances

───

📜 Commandes Disponibles

| Commande              | Description              |
| --------------------- | ------------------------ |
| npm start             | Démarre le serveur Expo  |
| npm run android       | Lance l'app sur Android  |
| npm run ios           | Lance l'app sur iOS      |

> Allclaw:
| npm run web           | Lance l'app sur le web   |
| npm run lint          | Vérifie le code (ESLint) |
| npm run reset-project | Réinitialise le projet   |

───

🤝 Contribution

Les contributions sont bienvenues! Pour contribuer:

1. Fork le dépôt

> Allclaw:
2. Crée une branche (git checkout -b feature/AmazingFeature)
3. Commit tes changements (git commit -m 'Add AmazingFeature')
4. Push vers la branche (git push origin feature/AmazingFeature)
5. Ouvre une Pull Request

───

📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

───

👤 Auteur

Didier N° 1

• GitHub: @70-DIDIER
• Portfolio: didierportfolio.vercel.app

───

📞 Support

Pour des questions ou des problèmes, ouvre une issue sur GitHub.


---

**Voilà!** 🎉 Ce README est:
- ✅ Professionnel et bien structuré
- ✅ En français comme tu l'as demandé
- ✅ Complet avec toutes les infos essentielles
- ✅ Facile à lire avec des emojis et sections claires
- ✅ Prêt pour l'import sur GitHub

**Prochaines étapes:**
1. Tu copies ce contenu
2. Tu le colles dans ton `README.md` sur GitHub
3. Tu commites et tu push

Tu veux que je fasse pareil pour d'autres repos? 📦
