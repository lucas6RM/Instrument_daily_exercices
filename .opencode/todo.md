# Feature F4 : Daily Dashboard

## Spécification Technique Globale
Tableau de bord quotidien avec checklist des exercices, bouton PLAY qui déclenche le timer overlay (F2), et barre de progression visuelle. C'est la vue principale (`/`) que l'utilisateur consulte quotidiennement.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Comportement
- À l'ouverture, charger ou créer la session du jour (`DailySession` avec date d'aujourd'hui)
- Afficher chaque exercice sous forme de ligne avec :
  - Checkbox (coché = exercice terminé)
  - Nom de l'exercice + durée cible
  - Bouton PLAY → lance le timer avec la durée de l'exercice
  - Lien YouTube (si présent) → ouvre dans nouvel onglet
- Barre de progression : `completed / total` exercices + pourcentage visuel
- À l'expiration du timer, cocher automatiquement l'exercice et sauvegarder la session
- Calcul du temps réel passé par exercice (diff entre start et end du timer)

## Composants Attendus
- `DashboardComponent` — Route `/`, orchestrateur principal
- `ExerciseRowComponent` — Ligne d'exercice avec checkbox, PLAY, lien YouTube
- `ProgressBarComponent` — Barre de progression visuelle avec pourcentage

## Connexion Timer → Dashboard
- Le dashboard écoute le timer store : quand `remainingMs <= 0` et `currentExerciseId` correspond, il coche l'exercice
- Le bouton PLAY injecte le timer store et appelle `start(exerciseId, exercise.durationMinutes * 60000)`

## Tableau d'Avancement (La Source de Vérité)
^- [x] Tâche 1 : Créer `ProgressBarComponent` avec input `completedCount`, `totalCount` et affichage visuel (barre + %).
- [ ] Tâche 2 : Créer `ExerciseRowComponent` avec checkbox, nom, durée, bouton PLAY, lien YouTube.
- [ ] Tâche 3 : Créer `DashboardComponent` qui charge la session du jour et affiche la liste + progress bar.
- [ ] Tâche 4 : Lier le bouton PLAY au timer store (`start(exerciseId, durationMs)`).
- [ ] Tâche 5 : Implémenter le auto-complete à l'expiration du timer (écoute du timer store → coche l'exercice → sauvegarde session).
- [ ] Tâche 6 : Sauvegarder la session dans le `progress.store.ts` à chaque changement de checkbox.
- [ ] Tâche 7 : Styler le dashboard avec Tailwind (responsive, liste épurée, accessible).
- [ ] Tâche 8 : Test unitaire du dashboard (chargement session, auto-complete, sauvegarde).

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
