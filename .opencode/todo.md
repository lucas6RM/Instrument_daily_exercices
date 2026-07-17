# Feature F12 — Garde-fou manuel : validation d'exercice sans timer

## Spécification Technique Globale

Ajout d'un garde-fou permettant à l'utilisateur de marquer manuellement un exercice comme complété via la checkbox du dashboard et de l'historique, avec une popup de confirmation. Résout le problème où le timer arrive à `0:00` sans avoir déclenché l'expiration automatique (bug mobile).

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Comportement

### Dashboard
- La checkbox de `exercise-row.component.html` n'est plus `disabled`
- Clic sur un exercice **non complété** → ouvre une popup de confirmation
- Popup : "Valider *[Nom de l'exercice]* comme complété ?" avec boutons "Annuler" + "Oui, valider"
- Clic sur un exercice **déjà complété** → rien ne se passe
- À la confirmation : `actualMinutes` = `durationMinutes` de l'exercice, `completed = true`
- Pas de son de validation

### Historique (Catch-up modal)
- Même comportement : chaque coche ou décoche passe par la popup de confirmation
- Popup identique : "Valider/Annuler *[Nom]* ?"
- Uniformisation totale avec le dashboard

## Implémentation

### Tâche 1 — ExerciseRowComponent : checkbox cliquable + output de toggle

**Fichier** : `src/app/features/dashboard/components/exercise-row/exercise-row.component.ts`
- Ajouter `readonly toggleComplete = output<void>()`
- Ajouter `readonly isDisabled = input<boolean>(false)` pour contrôler si la checkbox est cliquable

**Fichier** : `src/app/features/dashboard/components/exercise-row/exercise-row.component.html`
- Remplacer `[disabled]="true"` par `[disabled]="isDisabled()"`
- Ajouter `(click)="toggleComplete.emit()"` sur le conteneur de la checkbox
- Lier le `(change)` de l'input checkbox au `toggleComplete.emit()`

### Tâche 2 — DashboardComponent : dialog de confirmation + logique de complétion

**Fichier** : `src/app/features/dashboard/dashboard.component.ts`
- Ajouter le signal `confirmTarget = signal<string | null>(null)` pour stocker l'exercice en cours de confirmation
- Ajouter la méthode `onToggleComplete(exerciseId: string)` qui set `confirmTarget`
- Ajouter la méthode `confirmComplete()` qui appelle `onTimerComplete(exerciseId)` et ferme le dialog
- Ajouter la méthode `cancelConfirm()` qui reset `confirmTarget` à null

**Fichier** : `src/app/features/dashboard/dashboard.component.html`
- Ajouter `(toggleComplete)="onToggleComplete(item.exercise.id)"` sur `<app-exercise-row>`
- Ajouter le dialog Spartan avec `[state]="'open'"` conditionnel sur `confirmTarget()`
- Contenu du dialog : message de confirmation + boutons "Annuler" / "Oui, valider"

### Tâche 3 — Catch-up modal : même comportement de confirmation

**Fichier** : `src/app/features/history/catch-up-modal/catch-up-modal.component.ts`
- Ajouter le signal `confirmTarget = signal<{exerciseId: string, action: 'complete' | 'uncomplete'} | null>(null)`
- Adapter la méthode de toggle pour ouvrir le dialog au lieu de toggler directement

**Fichier** : `src/app/features/history/catch-up-modal/catch-up-modal.component.html`
- Ajouter le dialog de confirmation Spartan
- Adapter les checkbox pour émettre vers `confirmTarget`

## Tableau d'Avancement (La Source de Vérité)
- [x] Tâche 1 : ExerciseRowComponent — checkbox cliquable + output toggleComplete
- [ ] Tâche 2 : DashboardComponent — dialog de confirmation + logique de complétion
- [ ] Tâche 3 : Catch-up modal — même comportement de confirmation

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
