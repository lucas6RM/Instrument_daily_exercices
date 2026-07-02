# Feature F9 : Améliorations Dashboard, Routine, Historique

## Spécification Technique Globale
Lot d'améliorations et corrections liées à l'affichage des bonus minutes, la persistance des données, et le nettoyage de l'UI historique.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)
> 📋 Dépend : F8 (Bonus Minutes) — le modèle `DailySession` contient déjà `bonusMinutes`
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Tâche 1 : Afficher le temps bonus dans le Dashboard

### Problème
Le `ExerciseRowComponent` n'affiche pas les bonus minutes. Le composant `ExerciseTimeDisplayComponent` existe et est utilisé dans le modal de rattrapage, mais pas dans le dashboard.

### Comportement attendu
- Chaque ligne d'exercice complété dans le dashboard affiche le temps réel + bonus via `ExerciseTimeDisplayComponent`
- Format : `✅ 20min + 10min bonus (2×)`

### Changements
- `ExerciseRowComponent` — ajouter les inputs `actualMinutes`, `bonusMinutes`, `playCount`
- `ExerciseRowComponent` template — intégrer `ExerciseTimeDisplayComponent` quand l'exercice est complété
- `DashboardComponent` — passer les données bonus depuis la session du jour vers `ExerciseRowComponent`

## Tâche 2 : Reset du formulaire après ajout dans la Routine

### Problème
Après clic sur "Ajouter l'exercice", le formulaire garde ses champs remplis.

### Comportement attendu
- Après un ajout réussi, le formulaire est réinitialisé (champs vides)
- Le mode édition n'est pas impacté (le reset ne se fait qu'en mode ajout)

### Changements
- `ExerciseFormComponent` — ajouter `this.form.reset()` après `this.save.emit()` uniquement quand `!this.exercise()` (mode ajout)

## Tâche 3 : Bug persistance bonus minutes après reload

### Problème
Après avoir complété un exercice puis rejoué pour accumuler des bonus minutes, un rechargement de page fait disparaître les bonus minutes.

### Scénario de reproduction
1. Compléter un premier exercice via le timer
2. Réappuyer sur PLAY pour déclencher le bonus time
3. Rafraîchir la page
4. Les bonus minutes ont disparu

### Changements
- Investiguer la chaîne de persistance : `ProgressService.addSession()` → `persist()` → localStorage
- Corriger la cause racine (mutation de référence, timing signal, etc.)

## Tâche 4 : Totaux incluent `actualMinutes + bonusMinutes`

### Problème
Le temps total journalier et hebdomadaire n'inclut que `actualMinutes`, pas `bonusMinutes`.

### Comportement attendu
- `WeekDayCardComponent` affiche le total jour = `actualMinutes + bonusMinutes`
- `WeeklySummaryComponent` affiche le total semaine = somme des `actualMinutes + bonusMinutes`

### Changements
- `ProgressService.getWeeklyStats()` — ligne 218, modifier :
  - Avant : `eSum + ex.actualMinutes`
  - Après : `eSum + ex.actualMinutes + ex.bonusMinutes`
- La correction se propage automatiquement au total hebdomadaire (somme des totaux journaliers)

## Tâche 5 : Supprimer le badge "Rattrapable" et la bordure verte

### Problème
Le badge "Rattrapable" alourdit l'UI. La bordure verte distinctive sur les jours rattrapables n'est pas nécessaire.

### Comportement attendu
- Plus de badge "Rattrapable" dans `WeekDayCardComponent`
- Bordure uniforme (`border-gray-100`) pour tous les jours
- Le fait que le jour soit cliquable reste l'unique indicateur de rattrapage disponible

### Changements
- `WeekDayCardComponent` template — supprimer le bloc `@if (catchUp)` (badge)
- `WeekDayCardComponent` template — uniformiser la bordure (toujours `border-gray-100`, supprimer la variante `border-green-300`)

## Tableau d'Avancement (La Source de Vérité)
- [x] Tâche 1 : Afficher temps bonus dans le Dashboard
- [x] Tâche 2 : Reset formulaire après ajout dans la Routine
- [ ] Tâche 3 : Bug persistance bonus minutes après reload
- [ ] Tâche 4 : Totaux incluent `actualMinutes + bonusMinutes`
- [ ] Tâche 5 : Supprimer badge "Rattrapable" et bordure verte

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.
### Blocage Actuel :
- Aucun.