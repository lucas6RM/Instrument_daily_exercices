## 🎯 Introduction & Description du Besoin

L'objectif de ce projet est de remplacer le suivi de pratique quotidien sur papier d'un pianiste par une application web responsive, minimaliste et gamifiée, utilisable directement depuis un smartphone, une tablette posée sur le pupitre ou un ordinateur.

- **Le Problème :** Le suivi des exercices (gammes, improvisation, standards de jazz) se fait manuellement. Cela disperse les outils nécessaires à la pratique (chronomètre externe, métronome, recherche de liens YouTube pour les _backing tracks_) et n'offre aucun historique ni levier visuel de motivation.
    
- **La Solution (MVP) :** Une application centralisée "zéro friction" qui permet de :
    
    1. **Planifier** sa routine d'exercices quotidienne (durée cible, consignes, liens externes).
        
    2. **Rythmer** la session grâce à un minuteur global persistant (en overlay) qui avertit le musicien de la fin de l'exercice, même s'il consulte un autre onglet (comme un backing track YouTube).
        
    3. **Gamifier** la pratique via une mécanique simple de liste de tâches quotidienne avec un pourcentage d'accomplissement visuel pour encourager la régularité.
        


## 🛠️ Stack Technique Retenue

- **Framework :** Angular (Architecture Single Page Application - Mode Client pur).
    
- **Gestion d'État :** Angular Signals (idéal pour la réactivité du Timer global et la synchronisation LocalStorage).
    
- **Styles :** CSS/SCSS (ou Tailwind CSS si tu l'utilises d'habitude) pour un design épuré et responsive.
    
- **Persistance :** `window.localStorage` (Stockage local des exercices et de la progression sous forme de JSON).
    
- **Audio :** API Web Audio native du navigateur pour le signal sonore de fin.
    

## 📋 Spécification Fonctionnelle du MVP

### 1. Gestion de la Routine Journalière

- Une vue "Configuration" pour lister, ajouter ou supprimer ses exercices de piano (Nom, Durée en minutes, Lien YouTube optionnel, Description/Critères).
    
- Une vue "Pratique" (Le tableau de bord quotidien) qui affiche la liste des exercices du jour sous forme de Checklist.
    

### 2. Le Timer Global en Overlay

- Un bouton **PLAY** sur chaque exercice.
    
- Clic sur PLAY ➡️ Déclenche l'exercice et affiche un composant flottant (`position: fixed; top: 1rem; right: 1rem;`) visible partout dans l'application.
    
- Le composant affiche un compte à rebours interactif ($MM:SS$) et un bouton Pause/Stop.
    
- À $00:00$, un bip sonore retentit via l'API Audio, même si l'utilisateur navigue sur une autre page de l'application ou s'il a basculé sur un autre onglet de son navigateur de bureau.
    

### 3. Gamification & Progression (Version MVP)

- Affichage d'une barre de progression ou d'un pourcentage d'accomplissement de la journée (ex: 3/5 exercices faits = 60%).
    
- Historique basique dans le LocalStorage pour pouvoir calculer plus tard un système de "Streak" (jours consécutifs).
    

## 🚀 Étapes Clés du Projet (Milestones)

1. **Étape 1 : Architecture & Core Service** -> Initialisation du projet Angular, création du service de stockage (`StorageService`) et du service de gestion du temps (`TimerService`).
    
2. **Étape 2 : Composant Timer Overlay** -> Création du composant flottant en haut à droite, gestion du son à l'échéance.
    
3. **Étape 3 : CRUD Exercices & Dashboard** -> Interface pour lister/cocher les exercices du jour et administrer sa routine.
    
4. **Étape 4 : Calcul de la progression & Peaufinage** -> Intégration du pourcentage de complétion journalier et responsive design pour tablette/mobile.
    

## 📄 Le Fichier Pivot : `.opencode/todo.md`

Voici le fichier d'état que tu peux créer directement dans ton projet. Ton agent `@mastermind` local s'appuiera dessus pour piloter le `@worker` et le `@reviewer`.

Markdown

```
# Feature : Application de Routine Piano (MVP Angular)

## Spécification Technique Globale
Application Angular SPA pure-client. Stockage exclusif dans le LocalStorage.
Gestion du temps via un `TimerService` global exposé dans un composant d'overlay (`fixed top-right`).

## Standards du Projet & Commandes
- Build : `ng build`
- Test : `ng test`
- Lint : `ng lint`

## Tableau d'Avancement (La Source de Vérité)
- [ ] Tâche 1 : Initialiser le projet Angular et configurer Tailwind/CSS de base.
- [ ] Tâche 2 : Créer le `StorageService` pour lire/écrire la liste des exercices et l'état du jour dans le LocalStorage.
- [ ] Tâche 3 : Créer le `TimerService` (Signal-based ou RxJS) gérant le décompte, la pause, et le déclenchement de l'alerte audio.
- [ ] Tâche 4 : Créer le composant `TimerOverlayComponent` affiché en `fixed` en haut à droite de l'écran.
- [ ] Tâche 5 : Créer l'interface de gestion de la routine (Ajouter/Supprimer un exercice avec nom, durée, lien YouTube).
- [ ] Tâche 6 : Créer le Dashboard journalier (Checklist des exercices, bouton PLAY qui connecte le Timer, calcul du % d'accomplissement).
- [ ] Tâche 7 : Intégrer le responsive design pour s'assurer que l'overlay et la liste soient parfaits sur une tablette posée sur le piano.

## Zone de Transit & Logs (Circuit Breaker)
### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
```
