# Feature F3 : Exercise CRUD

## Spécification Technique Globale
Interface d'administration pour gérer la routine d'exercices. Formulaire réactif pour ajouter/modifier un exercice. Liste avec boutons de suppression et réordonnancement. Les données sont persistées via le `exercise.store.ts` (F1) + LocalStorage.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Fonctionnalités
- Liste des exercices avec nom, durée, lien YouTube, description
- Formulaire réactif (`FormGroup`) avec validation (nom requis, durée > 0)
- Bouton Ajouter / Modifier / Supprimer
- Ordre d'affichage (champ `order` numérique)
- Lien YouTube cliquable (ouvre dans un nouvel onglet)

## Composants Attendus
- `RoutineListComponent` — Route `/routine`, affiche la liste et le formulaire
- `ExerciseFormComponent` — Formulaire réactif réutilisable (add + edit mode via input)
- `ExerciseCardComponent` — Carte d'exercice avec infos et boutons d'action

## Tableau d'Avancement (La Source de Vérité)
- [ ] Tâche 1 : Créer `ExerciseFormComponent` avec `FormGroup` (name, durationMinutes, youtubeUrl, description) et validation.
- [ ] Tâche 2 : Créer `ExerciseCardComponent` avec affichage des infos et boutons edit/delete.
- [ ] Tâche 3 : Créer `RoutineListComponent` qui injecte le store et affiche la liste + formulaire.
- [ ] Tâche 4 : Implémenter la logique de suppression avec confirmation (dialog natif `confirm()`).
- [ ] Tâche 5 : Implémenter l'édition (click edit → pré-remplir le formulaire → save update).
- [ ] Tâche 6 : Styler la page avec Tailwind (responsive, carte épurée, boutons accessibles).
- [ ] Tâche 7 : Vérifier l'accessibilité WCAG AA (labels, focus, contrastes, aria sur les boutons).
- [ ] Tâche 8 : Test unitaire du formulaire (validations, submit add/edit).

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
