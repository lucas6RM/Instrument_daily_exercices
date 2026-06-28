# Feature F2 : Timer Engine & Overlay

## Spécification Technique Globale
Implémentation du timer global persistant basé sur `Date.now()` diff. Le timer continue de fonctionner même en background (tab inactif). Un composant overlay flottant (`fixed top-right`) affiche le compte à rebours. Un bip sonore via Web Audio API retentit à l'expiration.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Comportement du Timer
- `start(exerciseId, durationMs)` — Enregistre `startTime = Date.now()`, `endTime = startTime + durationMs`, `isRunning = true`
- `pause()` — Calcule le temps écoulé, met à jour `remainingMs`, `isRunning = false`
- `resume()` — Réinitialise `startTime = Date.now()`, `isRunning = true`
- `reset()` — `isRunning = false`, `remainingMs = 0`, `currentExerciseId = null`
- Calcul du `remainingMs` toujours via `endTime - Date.now()` (précis même en background)
- Tick toutes les 100ms via `requestAnimationFrame` ou `setInterval` pour la fluidité de l'UI

## Composant Overlay
- `position: fixed; top: 1rem; right: 1rem;`
- Affiche `MM:SS` en grand, nom de l'exercice, bouton Pause/Stop
- Disparaît quand `isRunning = false`
- Accessible : rôle `timer`, aria-live pour le compte à rebours

## Audio
- Bip généré via `AudioContext` + `OscillatorNode` (440Hz, 500ms)
- Compatible avec la politique autoplay des navigateurs (l'utilisateur a cliqué sur PLAY)

## Tableau d'Avancement (La Source de Vérité)
- [ ] Tâche 1 : Créer le `AudioAlertService` avec méthode `playBeep()` via Web Audio API.
- [ ] Tâche 2 : Étendre `timer.store.ts` avec la logique `Date.now()` diff (`startTime`, `endTime`, calcul `remainingMs`).
- [ ] Tâche 3 : Implémenter le tick du timer (100ms) avec `setInterval` dans le store, cleanup à la pause/reset.
- [ ] Tâche 4 : Créer `TimerOverlayComponent` avec template (MM:SS, nom exercice, boutons Pause/Stop/Resume).
- [ ] Tâche 5 : Injecter le `TimerOverlayComponent` dans `app.html` pour qu'il soit visible globalement.
- [ ] Tâche 6 : Lier l'expiration (`remainingMs <= 0`) au `AudioAlertService.playBeep()` et au reset automatique.
- [ ] Tâche 7 : Style overlay avec Tailwind (fond sombre, texte blanc, ombre, coins arrondis, z-index élevé).
- [ ] Tâche 8 : Tests unitaires du store timer (start, pause, resume, reset, expiration).

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
