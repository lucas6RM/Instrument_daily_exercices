# Feature F3 : Exercise CRUD

## Spécification Technique Globale
Interface d'administration pour gérer la routine d'exercices. Formulaire réactif pour ajouter/modifier un exercice. Liste avec boutons de suppression et réordonnancement. Les données sont persistées via le `exercise.store.ts` (F1) + LocalStorage.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

<<<<<<< HEAD
## Fonctionnalités
- Liste des exercices avec nom, durée, lien YouTube, description
- Formulaire réactif (`FormGroup`) avec validation (nom requis, durée > 0)
- Bouton Ajouter / Modifier / Supprimer
- Ordre d'affichage (champ `order` numérique)
- Lien YouTube cliquable (ouvre dans un nouvel onglet)

## Composants Attendus
- `RoutineListComponent` — Route `/routine`, affiche la liste et le formulaire
- `ExerciseFormComponent` — Formulaire réactif réutilisable (add + edit mode via input)
- `ExerciseCardComponent` — Carte d'exercice avec infos et boutons d'action

## Tableau d'Avancement (La Source de Vérité)
- [x] Tâche 1 : Créer `ExerciseFormComponent` avec `FormGroup` (name, durationMinutes, youtubeUrl, description) et validation.
- [x] Tâche 2 : Créer `ExerciseCardComponent` avec affichage des infos et boutons edit/delete.
- [x] Tâche 3 : Créer `RoutineListComponent` qui injecte le store et affiche la liste + formulaire.
- [x] Tâche 4 : Implémenter la logique de suppression avec confirmation (dialog natif `confirm()`).
- [x] Tâche 5 : Implémenter l'édition (click edit → pré-remplir le formulaire → save update).
- [x] Tâche 6 : Styler la page avec Tailwind (responsive, carte épurée, boutons accessibles).
- [x] Tâche 7 : Vérifier l'accessibilité WCAG AA (labels, focus, contrastes, aria sur les boutons).
- [x] Tâche 8 : Test unitaire du formulaire (validations, submit add/edit).
=======
## Comportement du Timer
- `start(exerciseId, durationMs)` — Enregistre `startTime = Date.now()`, `endTime = startTime + durationMs`, `isRunning = true`
- `pause()` — Calcule le temps écoulé, met à jour `remainingMs`, `isRunning = false`
- `resume()` — Réinitialise `startTime = Date.now()`, `isRunning = true`
- `reset()` — `isRunning = false`, `remainingMs = 0`, `currentExerciseId = null`
- Calcul du `remainingMs` toujours via `endTime - Date.now()` (précis même en background)
- Tick toutes les 100ms via `requestAnimationFrame` ou `setInterval` pour la fluidité de l'UI

## Composant Overlay
- `position: fixed; top: 1rem; right: 1rem;`
- Affiche `MM:SS` en grand, nom de l'exercice, bouton Pause/Stop
- Disparaît quand `isRunning = false`
- Accessible : rôle `timer`, aria-live pour le compte à rebours

## Audio
- Bip généré via `AudioContext` + `OscillatorNode` (440Hz, 500ms)
- Compatible avec la politique autoplay des navigateurs (l'utilisateur a cliqué sur PLAY)

## Tableau d'Avancement (La Source de Vérité)
- [x] Tâche 1 : Créer le `AudioAlertService` avec méthode `playBeep()` via Web Audio API.
- [x] Tâche 2 : Étendre `timer.store.ts` avec la logique `Date.now()` diff (`startTime`, `endTime`, calcul `remainingMs`).
- [x] Tâche 3 : Implémenter le tick du timer (100ms) avec `setInterval` dans le store, cleanup à la pause/reset.
- [x] Tâche 4 : Créer `TimerOverlayComponent` avec template (MM:SS, nom exercice, boutons Pause/Stop/Resume).
- [x] Tâche 5 : Injecter le `TimerOverlayComponent` dans `app.html` pour qu'il soit visible globalement.
- [x] Tâche 6 : Lier l'expiration (`remainingMs <= 0`) au `AudioAlertService.playBeep()` et au reset automatique.
- [x] Tâche 7 : Style overlay avec Tailwind (fond sombre, texte blanc, ombre, coins arrondis, z-index élevé).
- [x] Tâche 8 : Tests unitaires du store timer (start, pause, resume, reset, expiration).
>>>>>>> main

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.