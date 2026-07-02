# Glossaire du Domaine

## Exercice (`Exercise`)
Unité de pratique quotidienne. Un exercice possède un nom, une durée cible en minutes, un lien YouTube optionnel (backing track), une description, et un ordre d'affichage.

## Session Quotidienne (`DailySession`)
Enregistrement de la pratique d'un jour. Contient la date et la liste des exercices avec leur statut (complété ou non) et la durée effective passée.

## Timer Global
Composant unique qui gère le décompte d'un exercice en cours. Persistant via `Date.now()` diff. Visible en overlay flottant.

## Routine
Liste ordonnée des exercices configurés par l'utilisateur. Équivalent au "programme de pratique" quotidien.

## Overlay
Composant flottant (`position: fixed`) affiché en haut à droite de l'écran. Visible sur toutes les routes. Affiche le timer en cours.

## Progression Quotidienne
Pourcentage d'exercices complétés pour la session du jour. Affiché sous forme de barre de progression.

## Semaine de Pratique
Période du lundi au dimanche. Utilisée pour l'historique et les statistiques hebdomadaires.

## Streak
Nombre de jours consécutifs où au moins un exercice a été complété. (Réservé pour un futur développement)

## Bonus Minutes
Temps supplémentaire accumulé en rejouant un exercice déjà terminé. Stocké dans `bonusMinutes` de chaque exercice de la `DailySession`. Permet de compenser un exercice non réalisé ailleurs dans la semaine.

## Rattrapage (Catch-Up)
Capacité de compléter des exercices pour un jour passé de la semaine en cours, via un modal dans la vue historique. Limité à la semaine en cours et aux exercices de la routine actuelle.

## Temps Cible Hebdomadaire
Somme des durées cibles de la routine actuelle multipliée par 7 jours. Utilisée comme dénominateur pour le taux de complétion hebdomadaire.

## Taux de Complétion par Temps
Pourcentage calculé comme `temps réel total (actualMinutes + bonusMinutes) / temps cible total`. Remplace l'ancien taux binaire par exercice.
