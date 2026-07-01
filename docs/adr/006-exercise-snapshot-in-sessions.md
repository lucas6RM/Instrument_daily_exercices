# ADR-006 : Snapshot d'Exercice dans les Séances Quotidiennes

## Statut
Accepté

## Contexte
Une `DailySession` référencait un exercice par `exerciseId` uniquement. Le nom de l'exercice était résolu à l'affichage depuis la Routine actuelle. Si l'exercice était supprimé ou renomé, il disparaissait ou prenait le nouveau nom dans l'historique, perdant la trace de ce qui a vraiment été pratiqué.

## Décision
Chaque entrée d'exercice dans une `DailySession` conserve un `exerciseName` en snapshot. La séance du jour est figée au premier lancement : les renommages et suppressions de la Routine ne la modifient pas, seuls les ajouts d'exercices s'y propagent. Aucune migration des données existantes — les anciennes sessions sans `exerciseName` affichent un fallback.

### Trade-offs considérés
| Option | Choix | Raison |
|--------|-------|--------|
| Référence (ID seul) | Rejetée | L'historique dépend de la Routine actuelle |
| Snapshot complet | Rejeté | Seul le nom a de la valeur historique |
| Migration backfill | Rejetée | Données existantes non critiques, complexité inutile |
| Séance dynamique | Rejetée | Un renommage en cours de jour modifierait la séance |
| Séance figée + ajouts propagés | **Choisie** | Compromis entre intégrité historique et flexibilité |

## Conséquences
- **+** L'historique est immuable et fidèle à ce qui a été pratiqué
- **+** Supprimer un exercice de la Routine n'efface plus l'historique
- **+** Pas de migration nécessaire
- **-** `exerciseName` duplique une donnée qui existe dans la Routine (dénormalisation)
- **-** Les anciennes sessions sans snapshot affichent un fallback
