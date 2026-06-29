# ADR-001 : Architecture SignalStore par Domaine

## Statut
Accepté

## Contexte
Le projet utilise Angular 22 avec `@ngrx/signals` pour la gestion d'état. Le MVP repose sur un stockage LocalStorage exclusif sans backend.

## Décision
Utiliser 3 SignalStores par domaine plutôt qu'un store monolithique :
- `exercise.store.ts` — CRUD des exercices de routine
- `timer.store.ts` — État du timer global (running, remaining, current exercise)
- `progress.store.ts` — Historique des sessions quotidiennes

## Conséquences
- **+** Séparation claire des responsabilités
- **+** Chaque store est testable indépendamment
- **+** Facilité de migration future vers un backend
- **-** Légère surcharge pour un MVP (justifiée par la scalabilité)

## Détails Techniques
- Chaque store utilise `effect()` pour sync automatique avec LocalStorage
- `patchState` pour les mutations
- `computed()` pour les données dérivées (progression, stats hebdo)
- Timer utilise `Date.now()` diff pour la précision en background

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
