# Feature F7 : Snapshot d'Exercice dans les Séances

## Spécification Technique Globale
Chaque `DailySession` doit conserver un snapshot du nom de chaque exercice pratiqué, afin que l'historique reste lisible même si l'exercice est supprimé ou renomé de la Routine. La séance du jour est figée au premier lancement : les renommages et suppressions ne la modifient pas, seuls les ajouts s'y propagent.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Fonctionnalités
- Le modèle `DailySession` inclut un `exerciseName` en plus de `exerciseId`, `completed`, `actualMinutes`
- La séance du jour est figée au premier lancement de la journée (snapshot de la Routine)
- Un exercice ajouté à la Routine en cours de jour s'ajoute à la séance du jour
- Un exercice supprimé ou renomé de la Routine n'affecte pas la séance du jour ni les séances passées
- L'historique affiche le nom snapshot sans lien vers la Routine actuelle
- Aucune migration des données existantes : les anciennes séances sans `exerciseName` affichent "(nom inconnu)"

## Impact sur les Modèles

### `DailySession` (modifié)
```ts
export interface DailySession {
  date: string; // ISO date 'YYYY-MM-DD'
  exercises: {
    exerciseId: string;
    exerciseName: string; // ← NOUVEAU : snapshot du nom
    completed: boolean;
    actualMinutes: number;
  }[];
}
```

## Impact sur les Services

### `ProgressService`
- `addSession()` : la séance reçue contient déjà les noms snapshot
- `getWeeklyStats()` : utiliser `exerciseName` pour l'affichage au lieu de résoudre via la Routine
- `getSession()` : retourne la séance avec les noms snapshot

### `ExerciseService`
- `deleteExercise()` : ne touche plus les `DailySession` (pas de nettoyage en cascade)
- `updateExercise()` : ne touche plus la séance du jour (le nom est figé)

### Composants d'historique
- `WeekDayCardComponent` : afficher `exerciseName` au lieu de résoudre via `scheduledExercises`
- `HistoryComponent` : ne plus passer `scheduledExercises` aux cartes historiques

## Composants Attendus
- Modification de `DailySession` (modèle)
- Modification de `ProgressService` (service)
- Modification de `ExerciseService` (service)
- Modification de `WeekDayCardComponent` (composant)
- Modification de `HistoryComponent` (composant)
- Modification de `DashboardComponent` (création de la séance du jour en `ngOnInit`, ligne 61-76)

## Tâches

 - [x] Tâche 1 : Ajouter `exerciseName` au modèle `DailySession` avec type optionnel pour la compatibilité
- [x] Tâche 2 : Mettre à jour la création de la séance du jour pour inclure le snapshot du nom
- [x] Tâche 3 : Figér la séance du jour au premier lancement (ne pas reconstruire à chaque chargement)
- [x] Tâche 4 : Propager un exercice ajouté à la séance du jour en cours
- [x] Tâche 5 : Mettre à jour `WeekDayCardComponent` pour afficher `exerciseName` au lieu de résoudre via `scheduledExercises`
- [x] Tâche 6 : Mettre à jour `HistoryComponent` pour ne plus passer `scheduledExercises` aux cartes
- [x] Tâche 7 : Mettre à jour `getWeeklyStats` pour utiliser `exerciseName`
- [x] Tâche 8 : Supprimer le nettoyage en cascade de `deleteExercise` vers les sessions (s'il existe)
- [ ] Tâche 9 : Gérer l'affichage fallback "(nom inconnu)" pour les anciennes séances
- [ ] Tâche 10 : Tests unitaires mis à jour (`ProgressService`, `ExerciseService`, composants)

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.

