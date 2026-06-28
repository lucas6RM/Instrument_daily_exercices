# Feature F5 : Weekly History View

## Spécification Technique Globale
Vue hebdomadaire de l'historique des pratiques. Affiche la semaine en cours avec le temps passé journalier global, les exercices réalisés chaque jour, et le temps cumulé par exercice sur la semaine.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Données Affichées
Pour chaque jour de la semaine (Lun → Dim) :
- Date + jour de la semaine
- Temps total de pratique (somme des `actualMinutes` des exercices complétés)
- Liste des exercices réalisés (nom + durée effective)
- Exercices non réalisés (grisés)

Résumé hebdomadaire :
- Temps total de la semaine
- Temps par exercice (agrégé sur 7 jours)
- Taux de complétion global (%)

## Calculs
- Semaine en cours : du lundi au dimanche inclus
- Données sources : `progress.store.ts` → `DailySession[]` filtrées par date
- Agrégation par exercice : `sum(actualMinutes)` groupé par `exerciseId`

## Composants Attendus
- `HistoryComponent` — Route `/history`, vue principale de la semaine
- `WeekDayCardComponent` — Carte par jour avec temps total et liste d'exercices (réalisés/non réalisés)
- `WeeklySummaryComponent` — Résumé global (temps total, temps par exercice, %)

## Tableau d'Avancement (La Source de Vérité)
^- [x] Tâche 1 : Étendre `progress.store.ts` avec un computed `getWeekSessions(startDate)` qui filtre les sessions d'une semaine.
- [x] Tâche 2 : Créer un computed `getWeeklyStats()` qui agrège le temps par jour et par exercice.
- [ ] Tâche 3 : Créer `WeekDayCardComponent` avec affichage du jour, temps total, et liste d'exercices (réalisés/non réalisés).
- [ ] Tâche 4 : Créer `WeeklySummaryComponent` avec résumé (temps total, temps par exercice, taux de complétion).
- [ ] Tâche 5 : Créer `HistoryComponent` qui affiche les 7 jours + résumé avec navigation semaine précédente/suivante.
- [ ] Tâche 6 : Implémenter la navigation entre semaines (boutons ← →) avec mise à jour des données.
- [ ] Tâche 7 : Style avec Tailwind (responsive, cartes épurées, code couleur vert/gris pour réalisé/non réalisé).
- [ ] Tâche 8 : Test unitaire des computed du store (filtrage semaine, agrégation stats).

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
