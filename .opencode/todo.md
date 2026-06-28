# Feature F1 : Foundation & Core

## Spécification Technique Globale
Angular 22 SPA pure-client. Installation de `@ngrx/signals`. Création des modèles de domaine, des stores par domaine (`exercise`, `timer`, `progress`), du `StorageService` pour le LocalStorage, et du routing shell (`/`, `/routine`, `/history`).

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Modèle de Domaine
```typescript
interface Exercise {
  id: string;
  name: string;
  durationMinutes: number;
  youtubeUrl?: string;
  description?: string;
  order: number;
}

interface DailySession {
  date: string; // ISO date 'YYYY-MM-DD'
  exercises: {
    exerciseId: string;
    completed: boolean;
    actualMinutes: number;
  }[];
}

interface ProgressState {
  dailySessions: DailySession[];
}
```

## Stores Attendus
- `exercise.store.ts` — SignalStore avec `patchState` pour CRUD des exercices, sync LocalStorage via `effect()`
- `timer.store.ts` — SignalStore pour l'état du timer (isRunning, remainingMs, currentExerciseId, startTime)
- `progress.store.ts` — SignalStore pour l'historique des sessions, sync LocalStorage via `effect()`

## Services Attendus
- `storage.service.ts` — Service générique pour lire/écrire dans le LocalStorage avec clés nommées et fallback JSON

## Routes
- `/` → Dashboard (page par défaut, lazy-loaded)
- `/routine` → Configuration exercices (lazy-loaded)
- `/history` → Historique (lazy-loaded)

## Tableau d'Avancement (La Source de Vérité)
- [x] Tâche 1 : Installer `@ngrx/signals` et mettre à jour `app.config.ts`.
- [x] Tâche 2 : Créer les interfaces TypeScript (`Exercise`, `DailySession`, `ProgressState`) dans `src/app/core/models/`.
- [x] Tâche 3 : Créer le `StorageService` avec méthodes génériques `get<T>()`, `set<T>()`, `remove()` et clés nommées.
- [x] Tâche 4 : Créer `exercise.store.ts` avec CRUD (add, update, delete, load from storage) et `effect()` de sync.
- [x] Tâche 5 : Créer `timer.store.ts` avec les signaux `isRunning`, `remainingMs`, `currentExerciseId`, `startTime` et les méthodes `start()`, `pause()`, `reset()`.
- [x] Tâche 6 : Créer `progress.store.ts` avec `addSession()`, `getSession(date)`, `getAllSessions()` et sync LocalStorage.
- [x] Tâche 7 : Configurer le routing avec lazy-loading des 3 routes (`/`, `/routine`, `/history`) et créer les shells vides des feature modules.
^- [x] Tâche 8 : Créer un composant `NavigationComponent` minimal (liens vers les 3 routes) injecté dans `app.html`.

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
