# Fix B2 — Regressions post-F10 : Timer & Modal Rattrapage

## Description du Bug

Trois regressions identifiées après la migration Spartan/ui (F10) :

1. **Timer — Pause sans effet** : lors d'un pause, le `durationMs` n'est pas préservé. Après un cycle pause/resume, `reset()` ne peut plus remettre le timer à sa valeur initiale car `durationMs` contient le temps restant.
2. **Timer — Réinitialiser ferme l'overlay** : les boutons "Réinitialiser" et "Fermer" (X) appellent tous deux `reset()`, qui remet tous les signals à zéro, faisant disparaître l'overlay au lieu de simplement remettre le compteur à sa durée initiale.
3. **Historique — Modal rattrapage invisible** : cliquer sur un jour dans la semaine en cours ne fait plus apparaître la modal de rattrapage. Le `<hlm-dialog>` Spartan est rendu dans le DOM mais jamais ouvert car il manque l'input `[state]`.

## Reproduction

### Timer
1. Aller sur la page Dashboard
2. Appuyer sur "Play" pour un exercice
3. Appuyer sur "Pause" → le timer se pause correctement
4. Appuyer sur "Réinitialiser" → l'overlay se ferme au lieu de remettre le compteur à la durée initiale

### Modal Rattrapage
1. Aller sur la page Historique
2. Cliquer sur un jour de la semaine en cours
3. La modal de rattrapage ne s'affiche pas

## Causes Identifiées

### Timer
- `timer.service.ts:97-105` — `reset()` remet `isRunning`, `durationMs`, `pausedRemainingMs` à 0/null → `visible()` retourne `false`
- `timer.service.ts:88` — `resume()` écrase `durationMs` avec le temps restant, perdant la durée originale
- `timer-overlay.component.html:61-81` — les boutons "Réinitialiser" et "Fermer" partagent la même action `reset()`

### Modal
- `history.component.html:107` — `<hlm-dialog>` sans input `[state]` → `BrnDialog` ne déclenche jamais son `open()` interne

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Corrections

### Tâche 1 — `TimerService` : préserver la durée originale et séparer reset / close

**Fichier** : `src/app/features/timer/timer.service.ts`

1. Ajouter le signal `originalDurationMs = signal(0)` pour conserver la durée initiale
2. Dans `start()`, setter `originalDurationMs.set(durationMs)`
3. Renommer `reset()` en `close()` — ferme l'overlay (reset total)
4. Ajouter `resetToOriginal()` — remet `remainingMs` à `originalDurationMs()` sans fermer l'overlay :
   - `isRunning.set(false)`
   - `endTime.set(Date.now() + originalDurationMs())`
   - `durationMs.set(originalDurationMs())`
   - `pausedRemainingMs.set(originalDurationMs())`
   - Reconfigurer le `setTimeout` d'expiration
5. Dans `close()`, aussi reset `originalDurationMs.set(0)`

### Tâche 2 — `TimerOverlayComponent` : wire les boutons correctement

**Fichier** : `src/app/features/timer/timer-overlay.component.html`

1. Bouton "Réinitialiser" (ligne 61-70) : changer `(click)="reset()"` → `(click)="resetToOriginal()"`
2. Bouton "Fermer" (ligne 72-81) : changer `(click)="reset()"` → `(click)="close()"`

**Fichier** : `src/app/features/timer/timer-overlay.component.ts`

1. Exposer `resetToOriginal` et `close` depuis `TimerService` à la place du `reset` actuel

### Tâche 3 — `HistoryComponent` : ouvrir le dialogue Spartan

**Fichier** : `src/app/features/history/history.component.html`

1. Ligne 107 : ajouter `[state]="'open'"` sur `<hlm-dialog #dialog>`

```html
<hlm-dialog #dialog [state]="'open'">
```

Quand `selectedDate()` est non-null, le dialogue se rend avec `state='open'`, déclenchant l'ouverture via l'effect de `BrnDialog`. Quand `onModalClosed()` set `selectedDate(null)`, le `@if` démonte le dialogue.

## Tableau d'Avancement (La Source de Vérité)
- [ ] Tâche 1 : TimerService — `originalDurationMs`, `resetToOriginal()`, `close()`
- [ ] Tâche 2 : TimerOverlayComponent — wire boutons réinitialiser / fermer
- [ ] Tâche 3 : HistoryComponent — `[state]="'open'"` sur `hlm-dialog`

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
