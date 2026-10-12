# Tests automatiques

Les tests ouvrent les vraies pages du site dans un navigateur sans écran (Chromium)
et vérifient les règles importantes. Tout ce qui sort du site (Firebase, OpenRouter,
Google Fonts) est **bloqué** : les tests ne touchent jamais ta vraie base ni ta clé d'IA.

| Fichier | Ce qui est vérifié |
|---|---|
| `pages.test.js` | Les 4 pages se chargent sans erreur JavaScript (PC et téléphone) |
| `baremes.test.js` | Totaux sur 20, bouton NE (non évalué), ABS/NN, ordre de saisie, sauvegarde par année/classe, lien d'import, Renfo 4e/3e |
| `appreciations.test.js` | Menu des élèves, genre automatique, EPS seul, phrases des mots-clés, IA simulée (pannes, réponses vides) |
| `app.test.js` | Synchro limitée aux données EPS, liste Élèves avec `, F` / `, G`, mise à jour des onglets |

**Automatique** : GitHub relance tout à chaque push (`.github/workflows/tests.yml`).
Résultat : coche verte ou croix rouge sur le commit, détail dans l'onglet Actions.

**À la main** (Node 22) :

```
cd tests
npm ci
npx playwright install chromium
npm test
```
