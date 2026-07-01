# Feature F8 : Vue Semaine Interactive — Rattrapage et Bonus Minutes

## Spécification Technique Globale
Transformation de la vue historique en vue semaine interactive (Lun → Dim) avec capacité de rattrapage des jours passés via un modal inline. Ajout du concept de bonus minutes : un exercice terminé peut être rejoué pour accumuler du temps bonus, compensant les exercices non réalisés dans la semaine.

> 📋 Décisions architecturales : voir [`docs/adr/001-architecture.md#adr-006`](docs/adr/001-architecture.md#adr-006)
> 📋 Dépend : F7 (Snapshot d'Exercice) — le modèle `DailySession` contient déjà `exerciseName`
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Comportement

### Rattrapage de jours passés
- La vue `/history` affiche systématiquement la semaine en cours (Lun → Dim)
- Chaque jour est cliquable → ouvre un modal centré avec la liste des exercices de ce jour
- Le modal affiche les exercices de la routine actuelle avec leur statut pour cette date :
  - Exercice complété : checkbox cochée + temps affiché
  - Exercice non complété : checkbox décochée, bouton PLAY disponible
  - Exercice supprimé de la routine : affiché grisé avec le nom snapshot (F7) + "(supprimé)", non rejouable
- Le timer fonctionne comme dans le Dashboard : PLAY → décompte → auto-complétion
- La session est sauvegardée avec la date du jour sélectionné (pas aujourd'hui)
- Si aucune session n'existe pour ce jour, elle est créée à l'ouverture du modal

### Bonus minutes
- Sur le Dashboard et dans le modal de rattrapage, un exercice déjà terminé peut être rejoué
- Chaque replay ajoute `durationSeconds` au champ `bonusMinutes` de l'exercice
- Affichage : `"✅ {actualMinutes}min + {bonusMinutes}min bonus ({playCount}×)"`
  - `playCount` = 1 (session initiale) + nombre de replays

### Compensation par temps total
- Le taux de complétion hebdomadaire est recalculé :
  - `completionRate = (sum(actualMinutes + bonusMinutes) / sum(durationSeconds)) * 100`
  - `sum(durationSeconds)` = somme des durées cibles de la routine actuelle × 7 jours
- Un seul taux affiché, remplace l'ancien taux binaire par exercice

### Bornes
- Rattrapage limité à la semaine en cours (Lun → Dim)
- La navigation vers les semaines passées reste en lecture seule
- Les exercices de la routine actuelle sont la référence pour le rattrapage

## Changements de Modèle

### `DailySession.exercises` — ajout `bonusMinutes`
> Note : `exerciseName` existe déjà (F7 snapshot). Le modèle final combine les deux features.

```typescript
export interface DailySession {
  date: string;
  exercises: {
    exerciseId: string;
    exerciseName?: string; // snapshot du nom (F7, optionnel pour compatibilité)
    completed: boolean;
    actualMinutes: number; // durée de la dernière session
    bonusMinutes: number; // cumul des replays (F8)
  }[];
}
```

### `WeeklyStats` — recalcul `completionRate`
```typescript
export interface WeeklyStats {
  days: WeekDayStats[];
  totalMinutes: number;
  minutesByExercise: Map<string, number>;
  completionRate: number; // temps réel total / temps cible total
}
```

### Migration localStorage
- À l'ouverture de l'app, parcourir les sessions existantes
- Pour chaque exercice sans `bonusMinutes`, initialiser à `0`
- Persister le résultat
- F7 a déjà migré `exerciseName` — pas de conflit de migration

## Composants Attendus

### Modification de composants existants
- `HistoryComponent` — rendre chaque jour cliquable, ouvrir le modal de rattrapage
- `WeekDayCardComponent` — indicateur visuel si le jour est rattrapable (semaine en cours)
- `WeeklySummaryComponent` — afficher le nouveau taux de complétion par temps

### Nouveaux composants
- `CatchUpModalComponent` — modal centré avec la liste d'exercices du jour sélectionné, checkbox + PLAY
- `ExerciseTimeDisplayComponent` — affichage unifié du temps : `"✅ 20min + 10min bonus (2×)"`

### Services modifiés
- `ProgressService` — ajouter `getOrCreateSession(date)`, migration `bonusMinutes`
- `ProgressService` — recalculer `getWeeklyStats()` avec le nouveau `completionRate`
- `DashboardComponent` — permettre le replay d'un exercice terminé (incrémentation `bonusMinutes`)

## Tableau d'Avancement (La Source de Vérité)

### Phase 1 — Modèle et migration
- [x] Tâche 1 : Ajouter `bonusMinutes: number` à `DailySession.exercises` dans `daily-session.ts`.
- [x] Tâche 2 : Implémenter la migration localStorage dans `ProgressService` (initialiser `bonusMinutes: 0` pour les sessions existantes).
- [x] Tâche 3 : Mettre à jour `WeeklyStats.completionRate` pour utiliser `temps réel / temps cible`.
- [x] Tâche 4 : Ajouter `getOrCreateSession(date)` dans `ProgressService`.
- [x] Tâche 5 : Test unitaire de la migration et du nouveau calcul de `completionRate`.

### Phase 2 — Bonus minutes dans le Dashboard
^- [x] Tâche 6 : Permettre le replay d'un exercice terminé dans `DashboardComponent` (PLAY sur exercice coché → incrémenter `bonusMinutes`).
^- [x] Tâche 7 : Créer `ExerciseTimeDisplayComponent` avec affichage `"✅ {actualMinutes}min + {bonusMinutes}min bonus ({playCount}×)"`.
- [ ] Tâche 8 : Test unitaire du replay et du calcul du temps affiché.

### Phase 3 — Modal de rattrapage
- [ ] Tâche 9 : Créer `CatchUpModalComponent` avec liste d'exercices du jour, checkbox, PLAY, et gestion des exercices supprimés.
- [ ] Tâche 10 : Lier le modal au `ProgressService` avec la date du jour sélectionné (pas aujourd'hui).
- [ ] Tâche 11 : Gérer le timer pour le rattrapage : à l'expiration, marquer comme complété OU incrémenter `bonusMinutes`.
- [ ] Tâche 12 : Styler le modal avec Tailwind (accessible, focus trap, overlay, aria-modal).
- [ ] Tâche 13 : Test unitaire du modal (ouverture, fermeture, complétion, replay, exercices supprimés).

### Phase 4 — Intégration dans la vue History
- [ ] Tâche 14 : Rendre chaque jour de la semaine en cours cliquable dans `HistoryComponent`.
- [ ] Tâche 15 : Indicateur visuel sur `WeekDayCardComponent` pour les jours rattrapables.
- [ ] Tâche 16 : Mettre à jour `WeeklySummaryComponent` avec le nouveau taux de complétion.
- [ ] Tâche 17 : Navigation semaines passées → lecture seule (pas de modal).
- [ ] Tâche 18 : Build + lint + test final.

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
