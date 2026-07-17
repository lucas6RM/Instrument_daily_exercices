# Feature F13 — Taux de complétion partielle sur la semaine en cours

## Spécification Technique Globale

Modification du calcul du taux de complétion hebdomadaire dans le history component. Pour la semaine en cours, le taux se calcule uniquement sur les jours écoulés (lundi → jour actuel), sans inclure les jours futurs dans le dénominateur. Pour les semaines passées, le calcul reste sur 7 jours complets.

Le target est calculé **par jour**, en se basant sur les exercices présents dans la session de chaque jour (et non une routine globale multipliée par le nombre de jours). Si un jour n'a pas de session, il ne contribue pas au target.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Comportement

### Semaine passée
- On considère les 7 jours de la semaine (lundi → dimanche)
- Pour chaque jour avec une session : target = somme des `durationMinutes` des exercices de cette session (via lookup dans la routine courante)
- Jours sans session → target = 0

### Semaine en cours
- On considère uniquement les jours du lundi au jour actuel (jours futurs exclus)
- Pour chaque jour avec une session : target = somme des `durationMinutes` des exercices de cette session
- Jours sans session → target = 0

### Calcul global
- `totalActualMinutes` = somme de `actualMinutes + bonusMinutes` de toutes les sessions dans la plage de jours
- `completionRate` = `(totalActualMinutes / totalTargetMinutes) × 100` (ou 0 si target = 0)

### Exemple
- Vendredi, routine : exercice A (5min)
- Session uniquement le vendredi avec exercice A complété (5min actual)
- Target = 5min (seulement la session du vendredi compte)
- Taux = (5 / 5) × 100 = 100%

## Implémentation

### Tâche 1 — ProgressService : calcul du target par jour basé sur les sessions

**Fichier** : `src/app/features/progress/progress.service.ts`
- Ajouter fonction helper `getMondayOfDate(date: Date): Date` pour trouver le lundi d'une date donnée
- Ajouter paramètre `today: Date` à `getWeeklyStats(startDate, exercises, today)`
- Déterminer si la semaine affichée est la semaine en cours en comparant `startDate` avec le lundi de `today`
- Si semaine en cours : `maxDayIndex` = jours écoulés (lundi → today), sinon `maxDayIndex = 6`
- Construire un lookup `exerciseId → durationMinutes` depuis la routine courante
- Pour chaque jour dans la plage (0 → maxDayIndex) : si une session existe, sommer les `durationMinutes` de chaque exercice de la session via le lookup
- Calculer `completionRate = (totalActualMinutes / totalTargetMinutes) × 100`

### Tâche 2 — HistoryComponent : passer `new Date()` au service

**Fichier** : `src/app/features/history/history.component.ts`
- Ajouter `new Date()` comme troisième argument à l'appel de `getWeeklyStats`

### Tâche 3 — Tests unitaires

**Fichier** : `src/app/features/progress/progress.service.spec.ts`
- Mettre à jour tous les appels existants avec `today` dans une semaine différente (tests semaine passée)
- Ajouter test : calcul partiel quand `today` est dans la même semaine (Wednesday → 3 jours)
- Ajouter test : target 7 jours pour une semaine passée
- Ajouter test : target 1 jour quand `today` est un Monday
- Ajouter test : target 7 jours quand `today` est un Sunday de la même semaine

## Tableau d'Avancement (La Source de Vérité)
- [x] Tâche 1 : ProgressService — calcul du target par jour basé sur les sessions réelles
- [x] Tâche 2 : HistoryComponent — passer `new Date()` au service
- [x] Tâche 3 : Tests unitaires — couverture semaine en cours et semaine passée

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Lint et tests non exécutables : Node.js v18 incompatible avec Angular CLI v22 (requiert v22.22.3+). À relancer sur un environnement compatible.
