# Contexte — Vocabulaire du domaine

Glossaire du domaine **Instrument Daily Exercices**. Chaque terme est un concept métier, pas une implémentation.

## Concepts

### Musicien
L'utilisateur de l'application. Un Musicien définit sa Routine et suit sa Progression.

### Exercice
Une pratique instrumentale nommée, avec une durée cible en minutes et un ordre dans la Routine.
Un Exercice peut avoir une URL YouTube de référence et une description.

### Routine
L'ensemble ordonné des Exercices que le Musicien pratique quotidiennement.
La Routine est la configuration persistante du Musicien.

### Snapshot d'Exercice
La copie figée du nom d'un Exercice capturée au moment de la création d'une Séance.
Le Snapshot garantit que l'historique conserve le nom même si l'Exercice est supprimé ou renomé de la Routine.
_Avoid_: Copie, clone, historique exercice

### Séance Quotidienne (Daily Session)
La pratique d'un jour donné. Une Séance associe chaque Snapshot d'Exercice à son état
(complété ou non) et au temps réellement passé (minutes effectives).
La séance du jour est figée au premier lancement de la journée : les renommages et suppressions
de la Routine ne la modifient pas. Les ajouts d'exercices en cours de jour s'y propagent.
Une seule Séance existe par jour.

### Timer
Le compte à rebours lancé pour un Exercice en cours de pratique.
Le Timer supporte le démarrage, la pause, la reprise et le reset.
À l'expiration, le Timer signale l'événement pour que la Séance puisse marquer l'Exercice comme complété.

### Progression
L'historique cumulées des Séances Quotidiennes du Musicien.

### Série (Streak)
Le nombre consécutif de jours avec au moins une Séance, compté à rebours depuis aujourd'hui.
La Série est brisée dès qu'un jour intermédiaire est manquant.
Une Séance de Backfill compte pour la Série mais pénalise le taux de complétion.

### Séance de Backfill
Une Séance Quotidienne créée automatiquement pour combler un jour manqué entre la dernière
Séance enregistrée et aujourd'hui. Elle reprend les exercices de la session d'aujourd'hui
tous marqués comme non complétés. Seule les 7 derniers jours sont concernés.
_Avoid_: Rattrapage, session fantôme, session automatique

### Statistiques Hebdomadaires
Le résumé de la pratique sur une fenêtre de 7 jours : minutes totales, minutes par Exercice,
jours pratiqués, et taux de complétion (jours avec séance / 7).

## Relations

- Une Routine contient des Exercices ordonnés.
- Une Séance Quotidienne référence les Exercices de la Routine.
- La Progression est la collection des Séances Quotidiennes.
- Le Timer est associé à un Exercice pendant sa pratique active.
- Les Statistiques Hebdomadaires sont dérivées de la Progression.
