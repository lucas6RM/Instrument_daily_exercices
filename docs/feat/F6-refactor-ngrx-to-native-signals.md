# Feature F6 : Refactor Stores NgRx → Services Signals Natifs

## Spécification Technique Globale
Remplacement des 3 SignalStores NgRx (`timer.store.ts`, `exercise.store.ts`, `progress.store.ts`) par des services Angular natifs utilisant les signals. L'objectif est un code plus lisible, plus facile à debugger, et la suppression de la dépendance `@ngrx/signals`.

Chaque domaine devient un `@Injectable({ providedIn: 'root' })` unique avec :
- **Signals readonly** pour l'état (`signal()`)
- **Computed** pour les données dérivées (`computed()`)
- **Méthodes publiques** pour les actions (`start()`, `pause()`, `add()`, etc.)
- **Persistance LocalStorage** gérée en interne

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Architecture Cible

### Pattern de Service Signal

Chaque service suit ce pattern :

```typescript
@Injectable({ providedIn: 'root' })
export class TimerService {
  private readonly audioAlert = inject(AudioAlertService);

  // --- État (signals readonly) ---
  readonly isRunning = signal(false);
  readonly currentExerciseId = signal<string | null>(null);
  readonly endTime = signal<number | null>(null);
  readonly durationMs = signal(0);
  readonly pausedRemainingMs = signal(0);

  // --- Tick réactif via interval + toSignal ---
  private readonly tick$ = new Subject<void>();
  private readonly tick = toSignal(this.tick$.pipe(interval(250)), { initialValue: 0 });

  // --- Computed ---
  readonly remainingMs = computed(() => {
    this.tick(); // dépendance pour forcer le recalcul
    if (!this.isRunning()) return Math.max(0, this.pausedRemainingMs());
    const end = this.endTime();
    return end ? Math.max(0, end - Date.now()) : 0;
  });

  readonly remainingSeconds = computed(() => Math.ceil(this.remainingMs() / 1000));
  readonly formattedTime = computed(() => {
    const total = this.remainingSeconds();
    const mins = String(Math.floor(total / 60)).padStart(2, '0');
    const secs = String(total % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  });

  // --- Événements ---
  private readonly expiredSubject = new Subject<TimerExpiredEvent>();
  readonly expired$ = this.expiredSubject.asObservable();

  // --- Actions ---
  start(exerciseId: string, durationMs: number): void { ... }
  pause(): void { ... }
  resume(): void { ... }
  reset(): void { ... }

  // --- Lifecycle ---
  ngOnDestroy(): void { this.pause(); }
}
```

### TimerService — Détails Spécifiques

**Tick** : `interval(250)` de RxJS converti en signal via `toSignal()`. Plus de `tickCounter` hack.

**Expiration** : un `Subject<TimerExpiredEvent>` émet un événement à l'expiration. Les composants s'abonnent via `expired$` ou `toSignal(expired$)`.

```typescript
interface TimerExpiredEvent {
  exerciseId: string;
  durationMs: number;
}
```

**Méthodes** : `start()`, `pause()`, `resume()`, `reset()`.

### ExerciseService — Détails Spécifiques

**État** : `exercises` signal (`Exercise[]`).

**Computed** : `sortedExercises` (trié par `order`).

**Persistance** : `effect()` qui écoute `exercises()` et écrit dans LocalStorage via `StorageService`. Chargement au `ngOnInit` / construction.

**Méthodes** : `addExercise()`, `updateExercise()`, `deleteExercise()`, `setExercises()`, `loadFromStorage()`.

### ProgressService — Détails Spécifiques

**État** : `dailySessions` signal (`DailySession[]`).

**Persistance** : appel explicite de `persist()` après chaque mutation (pas d'`effect()`).

**Méthodes** : `getSession(date)`, `streak()`, `addSession()`, `updateSession()`, `deleteSession()`, `setProgressState()`, `loadFromStorage()`, `getWeekSessions(startDate)`, `getWeeklyStats(startDate)`.

**Note** : `getWeekSessions()` et `getWeeklyStats()` retournent des `Signal<>` computed créés à la volée.

## Migration des Consommateurs

| Consommateur | Stores actuels | Nouveau service |
|---|---|---|
| `DashboardComponent` | TimerStore, ExerciseStore, ProgressStore | TimerService, ExerciseService, ProgressService |
| `TimerOverlayComponent` | TimerStore, ExerciseStore | TimerService, ExerciseService |
| `RoutineComponent` | ExerciseStore | ExerciseService |
| `HistoryComponent` | ProgressStore, ExerciseStore | ProgressService, ExerciseService |

### DashboardComponent — Changement Clé

L'`effect()` actuel qui détecte l'expiration du timer est remplacé par une écoute du `expired$` du TimerService :

```typescript
// Avant
private readonly timerExpirationEffect = effect(() => {
  const remaining = this.timerStore.remainingMs();
  const isRunning = this.timerStore.isRunning();
  // ...
});

// Après
private readonly expiredSignal = toSignal(this.timerService.expired$, { initialValue: null });
private readonly expirationEffect = effect(() => {
  const event = this.expiredSignal();
  if (event) {
    this.onTimerComplete(event.exerciseId);
    this.timerService.reset();
  }
});
```

## Suppression NgRx

Une fois les 3 services migrés et les consommateurs mis à jour :
1. Supprimer `@ngrx/signals` de `package.json`
2. Supprimer les anciens fichiers `.store.ts`
3. Vérifier qu'aucun import `@ngrx/signals` ne subsiste

## ADR à Mettre à Jour

- **ADR-001** : Remplacer "SignalStore par domaine" par "Service Signals natifs par domaine"

## Tableau d'Avancement (La Source de Vérité)

### Phase 1 — TimerService (le plus complexe, plus de bugs)
- [x] Tâche 1 : Créer `src/app/features/timer/timer.service.ts` avec les signals `isRunning`, `currentExerciseId`, `endTime`, `durationMs`, `pausedRemainingMs`.
- [x] Tâche 2 : Implémenter le tick réactif avec `interval(250)` + `toSignal()` et les computed `remainingMs`, `remainingSeconds`, `formattedTime`.
- [x] Tâche 3 : Implémenter les méthodes `start()`, `pause()`, `resume()`, `reset()` avec la logique `Date.now()` diff (ADR-002).
- [x] Tâche 4 : Ajouter le `Subject<TimerExpiredEvent>` + `expired$` observable, émis à l'expiration avec `AudioAlertService.playBeep()`.
- [x] Tâche 5 : Implémenter `ngOnDestroy()` pour cleanup du timer.
- [ ] Tâche 6 : Migrer `TimerOverlayComponent` pour injecter `TimerService` à la place de `TimerStore`.
- [ ] Tâche 7 : Migrer `DashboardComponent` — remplacer l'`effect()` d'expiration par l'écoute de `expired$` via `toSignal()`.
- [x] Tâche 8 : Écrire les tests unitaires du `TimerService` (couverture équivalente à `timer.store.spec.ts`).
- [x] Tâche 9 : Supprimer `timer.store.ts` et `timer.store.spec.ts`.

### Phase 2 — ExerciseService
- [ ] Tâche 10 : Créer `src/app/features/exercise/exercise.service.ts` avec le signal `exercises`, le computed `sortedExercises`, et les méthodes CRUD.
- [ ] Tâche 11 : Implémenter la persistance LocalStorage via `effect()` + `StorageService` (chargement à l'init, sync à chaque mutation).
- [ ] Tâche 12 : Migrer `RoutineComponent`, `DashboardComponent`, `TimerOverlayComponent`, `HistoryComponent` pour injecter `ExerciseService`.
- [ ] Tâche 13 : Écrire les tests unitaires du `ExerciseService` (aucun test n'existe actuellement).
- [ ] Tâche 14 : Supprimer `exercise.store.ts`.

### Phase 3 — ProgressService
- [ ] Tâche 15 : Créer `src/app/features/progress/progress.service.ts` avec le signal `dailySessions` et toutes les méthodes (`getSession`, `streak`, `addSession`, `updateSession`, `deleteSession`, `getWeekSessions`, `getWeeklyStats`).
- [ ] Tâche 16 : Implémenter la persistance LocalStorage explicite (`persist()` après chaque mutation) + chargement à l'init.
- [ ] Tâche 17 : Migrer `DashboardComponent` et `HistoryComponent` pour injecter `ProgressService`.
- [x] Tâche 18 : Adapter les tests existants de `progress.store.spec.ts` vers `progress.service.spec.ts`.
- [ ] Tâche 19 : Supprimer `progress.store.ts` et `progress.store.spec.ts`.

### Phase 4 — Nettoyage NgRx
- [x] Tâche 20 : Vérifier qu'aucun import `@ngrx/signals` ne subsiste dans le codebase.
- [x] Tâche 21 : Supprimer `@ngrx/signals` de `package.json` via `pnpm remove @ngrx/signals`.
- [x] Tâche 22 : Mettre à jour ADR-001 pour refléter l'architecture Services Signals natifs.
- [x] Tâche 23 : Build + lint + test final pour valider la migration complète.

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
