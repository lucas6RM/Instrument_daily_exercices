# ADR-001 : Service Signals Natifs par Domaine

## Statut
Accepté — mis à jour suite à ADR-005

## Contexte
Le projet utilise Angular 22 avec les signals natifs pour la gestion d'état. Le MVP repose sur un stockage LocalStorage exclusif sans backend. La dépendance `@ngrx/signals` a été supprimée.

## Décision
Utiliser 3 services `@Injectable({ providedIn: 'root' })` par domaine avec signals natifs plutôt qu'un store monolithique :
- `exercise.service.ts` — CRUD des exercices de routine
- `timer.service.ts` — État du timer global (running, remaining, current exercise)
- `progress.service.ts` — Historique des sessions quotidiennes

## Conséquences
- **+** Code impératif lisible de haut en bas — pas de sauts entre blocs de composition
- **+** Debuggage trivial : les signals sont inspectables, les méthodes sont des fonctions classiques
- **+** Zéro dépendance externe pour la gestion d'état
- **+** Tests plus simples : instancier le service, lire les signals, appeler les méthodes
- **+** Séparation claire des responsabilités
- **+** Chaque service est testable indépendamment
- **+** Facilité de migration future vers un backend

## Détails Techniques
- Chaque service expose des **signals `readonly`** pour l'état (`signal()`)
- **Computed** pour les données dérivées (`computed()`)
- **Méthodes publiques** pour les actions (`start()`, `pause()`, `add()`, etc.)
- **Persistance LocalStorage** gérée en interne
- Le tick du timer utilise `interval()` RxJS + `toSignal()` pour la réactivité
- L'expiration du timer émet un événement via `Subject<TimerExpiredEvent>` / `expired$` observable
- Timer utilise `Date.now()` diff pour la précision en background (voir ADR-002)

---

# ADR-002 : Timer Basé sur Date.now() Diff

## Statut
Accepté

## Contexte
Le timer doit rester précis même si l'utilisateur change d'onglet ou si le navigateur throttle les `setInterval` en background.

## Décision
Utiliser un calcul basé sur `Date.now()` :
- `start()` enregistre `startTime` et `endTime = startTime + duration`
- `remainingMs` est toujours calculé comme `endTime - Date.now()`
- Un tick UI toutes les 100ms met à jour l'affichage

## Conséquences
- **+** Précision garantie même en background
- **+** Resume après changement d'onglet sans dérive
- **-** Légère complexité supplémentaire vs setInterval naïf

---

# ADR-003 : Routing Sans Shell

## Statut
Accepté

## Contexte
L'application est simple (3 vues) et ne nécessite pas de layout complexe avec sidebar.

## Décision
Routing plat sans composant shell :
- `/` → Dashboard
- `/routine` → Configuration exercices
- `/history` → Historique hebdomadaire

Navigation via un composant `NavigationComponent` injecté dans `app.html`.

## Conséquences
- **+** Simplicité
- **+** Pas de nested routing à gérer
- **-** La navigation est répétée dans chaque route (gérée par app.html)

---

# ADR-004 : Workflow Agentic Unifié Feature / Fix

## Statut
Accepté

## Contexte
Le projet utilise un workflow agentic avec trois agents (Mastermind, Worker, Reviewer) pour implémenter des features définies dans `docs/feat/`. Un besoin apparaît pour supporter aussi la résolution de bugs via `docs/fix/`.

## Décision
Un **flow unique** pour les features et les fixes. Le Mastermind est paramétrable par le type de spec (feat ou fix) :

| Aspect | Feature | Fix |
|--------|---------|-----|
| Source | `docs/feat/FX-xxx.md` | `docs/fix/BX-xxx.md` |
| Branch | `feat/xxx` | `fix/xxx` |
| Spec format | Identique | Identique |
| Boucle | Worker → Reviewer | Worker → Reviewer |
| PR | Obligatoire | Obligatoire |
| Scope | Une feature | Un ou plusieurs bugs regroupés |

Le Worker et le Reviewer restent agnostiques — ils lisent `.opencode/todo.md` sans distinction.

## Conséquences
- **+** Un seul Mastermind à maintenir
- **+** Worker et Reviewer réutilisés sans modification
- **+** L'utilisateur contrôle le scope en découpant intelligemment les specs
- **-** Pas de fast-track pour les fixes urgents (à ajouter si besoin)

---

# ADR-005 : Services Signals Natifs à la Place de NgRx SignalStore

## Statut
Proposé — remplace ADR-001

## Contexte
Les 3 SignalStores NgRx (`timer.store.ts`, `exercise.store.ts`, `progress.store.ts`) créent du couplage entre état et logique métier via la composition `withState` / `withMethods` / `withComputed` / `withHooks`. Cette approche génère :
- Des bugs de réactivité difficiles à debugger (ex: `tickCounter` hack dans le Timer)
- Une lecture difficile (4 blocs imbriqués pour comprendre un store)
- Des contournements pour l'injection de dépendances (`inject()` dans `withMethods`)
- Une surcharge de dépendance externe pour un besoin couvert par les signals natifs Angular

## Décision
Remplacer chaque SignalStore par un `@Injectable({ providedIn: 'root' })` unique utilisant les signals natifs Angular :

| Ancien Store | Nouveau Service |
|---|---|
| `TimerStore` | `TimerService` |
| `ExerciseStore` | `ExerciseService` |
| `ProgressStore` | `ProgressService` |

Chaque service expose :
- **Signals `readonly`** pour l'état (`signal()`)
- **Computed** pour les données dérivées (`computed()`)
- **Méthodes publiques** pour les actions
- **Persistance LocalStorage** gérée en interne

Le tick du timer utilise `interval()` RxJS + `toSignal()` à la place du `tickCounter`.
L'expiration du timer émet un événement via `Subject<TimerExpiredEvent>` / `expired$` observable.

Suppression complète de `@ngrx/signals` du projet.

## Conséquences
- **+** Code impératif lisible de haut en bas — pas de sauts entre blocs de composition
- **+** Debuggage trivial : les signals sont inspectables, les méthodes sont des fonctions classiques
- **+** Zéro dépendance externe pour la gestion d'état
- **+** Tests plus simples : instancier le service, lire les signals, appeler les méthodes
- **-** Migration manuelle de tous les consommateurs (4 composants à mettre à jour)
- **-** Perte de `patchState` (à remplacer par `signal.update()` ou `signal.set()`)
