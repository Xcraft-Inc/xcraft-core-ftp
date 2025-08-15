# 📘 xcraft-core-ftp

## Aperçu

Le module `xcraft-core-ftp` est une librairie utilitaire du framework Xcraft qui fournit des fonctions d'aide pour les opérations FTP. Il simplifie le téléchargement de fichiers depuis des serveurs FTP avec support du suivi de progression et gestion automatique des connexions.

## Sommaire

- [Structure du module](#structure-du-module)
- [Fonctionnement global](#fonctionnement-global)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Interactions avec d'autres modules](#interactions-avec-dautres-modules)
- [Détails des sources](#détails-des-sources)

## Structure du module

Le module expose deux fonctions principales :

- **`get`** : Télécharge un fichier depuis un serveur FTP avec suivi de progression optionnel
- **`size`** : Récupère la taille d'un fichier sur un serveur FTP

Le module utilise la librairie `ftp` pour les opérations FTP de base et `gigawatts` pour la gestion asynchrone avec des générateurs.

## Fonctionnement global

Le module fonctionne selon le principe suivant :

1. **Connexion FTP** : Établit une connexion vers le serveur FTP spécifié
2. **Opération** : Exécute l'opération demandée (téléchargement ou récupération de taille)
3. **Gestion des flux** : Pour les téléchargements, gère le flux de données avec suivi de progression
4. **Nettoyage** : Ferme automatiquement les connexions FTP après utilisation

Le module gère automatiquement la création des répertoires de destination et inclut un hack spécifique pour s'assurer que les fichiers sont correctement fermés après écriture.

## Exemples d'utilisation

### Téléchargement d'un fichier avec suivi de progression

```javascript
const xFtp = require('xcraft-core-ftp');
const url = require('url');

const urlObj = url.parse('ftp://example.com/path/to/file.zip');
const outputFile = '/local/path/file.zip';

xFtp.get(
  urlObj,
  outputFile,
  (err) => {
    if (err) {
      console.error('Erreur de téléchargement:', err);
    } else {
      console.log('Téléchargement terminé');
    }
  },
  (progress, total) => {
    const percent = ((progress / total) * 100).toFixed(2);
    console.log(`Progression: ${percent}% (${progress}/${total} bytes)`);
  }
);
```

### Récupération de la taille d'un fichier

```javascript
const xFtp = require('xcraft-core-ftp');
const url = require('url');

async function getFileSize() {
  try {
    const urlObj = url.parse('ftp://example.com/path/to/file.zip');
    const size = await xFtp.size(urlObj);
    console.log(`Taille du fichier: ${size} bytes`);
  } catch (err) {
    console.error('Erreur lors de la récupération de la taille:', err);
  }
}
```

### Téléchargement simple sans suivi de progression

```javascript
const xFtp = require('xcraft-core-ftp');
const url = require('url');

const urlObj = url.parse('ftp://example.com/documents/manual.pdf');
const outputFile = './downloads/manual.pdf';

xFtp.get(urlObj, outputFile, (err) => {
  if (err) {
    console.error('Échec du téléchargement:', err);
  } else {
    console.log('Fichier téléchargé avec succès');
  }
});
```

## Interactions avec d'autres modules

Le module `xcraft-core-ftp` interagit avec plusieurs modules de l'écosystème Xcraft :

- **[xcraft-core-fs]** : Utilisé pour créer les répertoires de destination avant le téléchargement
- **ftp** : Librairie externe pour les opérations FTP de base
- **gigawatts** : Utilisé pour la gestion asynchrone avec des générateurs

## Détails des sources

### `index.js`

Le fichier principal expose les fonctions utilitaires FTP du module.

#### Fonctions publiques

- **`get(urlObj, outputFile, callback, callbackProgress)`** — Télécharge un fichier depuis un serveur FTP. Le paramètre `urlObj` doit être un objet URL parsé contenant au minimum `hostname` et `pathname`, `outputFile` est le chemin de destination local, `callback` est appelé à la fin du téléchargement avec une éventuelle erreur, et `callbackProgress` (optionnel) est appelé périodiquement avec les paramètres `(progress, total)` pour suivre l'avancement.

- **`size(urlObj)`** — Récupère la taille d'un fichier sur un serveur FTP de manière asynchrone. Retourne une Promise qui résout avec la taille en bytes ou rejette en cas d'erreur. La connexion FTP est automatiquement fermée après l'opération.

#### Fonction interne

- **`download(ftp, urlObj, outputFile, callback, callbackProgress)`** — Fonction interne qui gère le processus de téléchargement complet. Elle récupère d'abord la taille du fichier, puis crée un flux de téléchargement avec suivi de progression optionnel. La fonction gère les événements de données, d'erreur et de fin de téléchargement.

#### Particularités techniques

**Gestion des connexions** : Le module crée une nouvelle connexion FTP pour chaque opération et la ferme automatiquement après utilisation. Pour la fonction `get`, la connexion est fermée dans l'événement `close` du flux de données. Pour la fonction `size`, elle est fermée dans un bloc `finally`.

**Hack de synchronisation** : Le module inclut un hack spécifique dans la fonction `download` qui ouvre et ferme immédiatement le fichier téléchargé (`fs.openSync` suivi de `fs.closeSync`) pour s'assurer qu'il est correctement synchronisé sur le système de fichiers. Ce comportement est documenté comme étant similaire à celui utilisé dans le module `xHttp`.

**Gestion des répertoires** : Avant chaque téléchargement, le module utilise `xcraft-core-fs` pour créer automatiquement le répertoire de destination si celui-ci n'existe pas.

**Suivi de progression** : Le suivi de progression est implémenté en écoutant l'événement `data` du flux de téléchargement et en accumulant la taille des données reçues. La progression est rapportée en bytes absolus plutôt qu'en pourcentage.

---

_Ce document a été mis à jour pour refléter l'état actuel du code source._

[xcraft-core-fs]: https://github.com/Xcraft-Inc/xcraft-core-fs