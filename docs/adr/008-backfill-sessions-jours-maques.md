# ADR-008 : Backfill de Séances pour Jours Manqués

## Statut
Accepté

## Contexte
Lorsqu'un utilisateur pratique après une absence (ex: après un week-end), les jours intermédiaires n'ont aucune session enregistrée. Cela fausse le taux de complétion (jours manquants = jours non comptés) et crée des trous visuels dans l'historique.

## Décision
Au moment de la création de la session d'aujourd'hui, remplir automatiquement les jours manquants avec des Séances de Backfill.

### Règles
- **Déclencheur** : création de la session d'aujourd'hui (premier lancement du jour)
- **Condition** : la session d'aujourd'hui contient au moins un exercice (sinon, l'utilisateur est en pause)
- **Plage** : entre la dernière session enregistrée et aujourd'hui, limité aux 7 derniers jours
- **Écrasement** : on ne crée une session que si aucun enregistrement n'existe déjà pour ce jour
- **Template** : copie des exercices de la session d'aujourd'hui, tous à `completed: false`, `actualMinutes: 0`, `bonusMinutes: 0`
- **Emplacement** : méthode `backfillMissingSessions()` dans `ProgressService`

### Trade-offs
| Option | Choix | Raison |
|--------|-------|--------|
| Backfill illimité | Rejeté | Risque de créer des centaines de sessions fantômes |
| Backfill > 7 jours | Rejeté | La routine a probablement changé au-delà d'une semaine |
| Backfill explicite (bouton) | Rejeté | Complexité UI pour une action rare |
| Backfill au démarrage | Rejeté | Crée des sessions à chaque ouverture sans pratique |
| Backfill à la création de la session du jour | **Choisi** | Moment logique : l'utilisateur pratique après une absence |

## Conséquences
- **+** Les jours manqués pénalisent le taux de complétion (comportement attendu)
- **+** Pas de trou visuel dans l'historique
- **+** La Série (Streak) reste intacte (session existe = jour compté)
- **-** Légère surcharge au premier lancement après une absence (max 7 sessions créées)
