# Fix B1 : Persistence LocalStorage & Réactivité

## Description du Bug
Les exercices et la progression ne persistent pas correctement après un rechargement de page ou une navigation entre les routes. De plus, le marquage manuel des exercices comme terminés contourne le timer, ce qui fausse l'historique.

**Comportement observé:**
- Après un `reload()`, la liste des exercices est vide (test B échoue)
- Après navigation vers le dashboard, les exercices peuvent être absents si le ProgressStore n'a pas été hydraté (tests A1/A2)
- Lorsqu'un exercice est complété via le timer, il n'apparaît pas dans l'historique car `actualMinutes` reste à 0 (test C)
- L'utilisateur peut cocher manuellement un exercice sans lancer le timer, ce qui fausse la progression

**Comportement attendu:**
- Les exercices persistent après rechargement de page
- La progression persiste après navigation entre routes
- Un exercice complété via le timer apparaît dans l'historique avec sa durée
- Seul le timer peut marquer un exercice comme terminé (pas de cocher manuel)

## Reproduction
1. Créer des exercices dans `/routine`
2. Recharger la page → exercices disparus (test B)
3. Naviguer vers `/` puis `/history` → progression absente (tests A1/A2)
4. Lancer le timer pour un exercice, attendre l'expiration → exercice coché mais `actualMinutes: 0`, donc invisible dans l'historique (test C)

## Cause Identifiée
| # | Cause | Fichier | Ligne |
|---|-------|---------|-------|
| 1 | `ExerciseStore.onInit` ne charge pas `loadFromStorage()` — il ne configure que l'`effect` d'écriture | `exercise.store.ts` | 52-58 |
| 2 | `ProgressStore` ne charge pas automatiquement depuis localStorage — il dépend du `ngOnInit` du Dashboard | `progress.store.ts` | 87-92 |
| 3 | `onToggleComplete` dans le Dashboard ne définit pas `actualMinutes` — il ne toggle que `completed` | `dashboard.component.ts` | 147-160 |
| 4 | `ExerciseRowComponent` permet le cocher manuel — contourne le timer | `exercise-row.component.ts` | 18-27 |

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`
- E2E : `pnpm exec playwright test tests/persistence.spec.ts`

## Plan de Correction

### Tâche 1 : Hydrater l'ExerciseStore au démarrage
- Ajouter `store.loadFromStorage()` dans `onInit` de l'ExerciseStore
- Les exercices sont chargés depuis localStorage dès l'initialisation du store

### Tâche 2 : Hydrater le ProgressStore au démarrage
- Ajouter `withHooks` avec `onInit` qui appelle `loadFromStorage()`
- Plus besoin du `loadFromStorage()` explicite dans `DashboardComponent.ngOnInit`

### Tâche 3 : Réduire le marquage des exercices au timer uniquement
- Désactiver le checkbox dans `ExerciseRowComponent` — le rendre en lecture seule
- Retirer `(toggleComplete)` du template du Dashboard
- À l'expiration du timer, définir `completed: true` **et** `actualMinutes: exercise.durationMinutes`
- Mettre à jour `onToggleComplete` → `onTimerComplete` avec la logique correcte

### Tâche 4 : Vérifier les tests E2E
- Exécuter `pnpm exec playwright test tests/persistence.spec.ts`
- Tous les tests (A1, A2, B, C) doivent passer

## Tableau d'Avancement (La Source de Vérité)
- [x] Tâche 1 : Hydrater l'ExerciseStore au démarrage
- [x] Tâche 2 : Hydrater le ProgressStore au démarrage
- [x] Tâche 3 : Timer uniquement pour compléter + `actualMinutes`
- [ ] Tâche 4 : Vérifier les tests E2E

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 3 terminée

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Tâche 3 validée.

### Blocage Actuel :
- Aucun.
