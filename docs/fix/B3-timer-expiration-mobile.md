# Fix B3 — Timer expiration non détectée sur mobile

## Description du Bug

Sur mobile, lorsque le navigateur passe en arrière-plan (changement d'onglet, écran en veille), le `setTimeout` utilisé pour détecter l'expiration du timer est **throttled** ou **annulé** par le navigateur. Le compte à rebours visuel arrive bien à `0:00` (car basé sur `Date.now()`), mais l'événement `expired$` n'est jamais émis. L'exercice n'est pas marqué comme complété et l'utilisateur est bloqué.

## Reproduction

1. Lancer le timer pour un exercice
2. Mettre le téléphone en veille ou changer d'onglet
3. Attendre que le timer expire
4. Revenir sur l'application → le timer affiche `0:00` mais l'exercice n'est pas complété
5. Appuyer sur "Reprendre" → rien ne se passe (`pausedRemainingMs <= 0`)

## Cause Identifiée

- `timer.service.ts:65-67` — `setTimeout` comme mécanisme principal d'expiration
- Les navigateurs mobiles throttent les `setTimeout` en arrière-plan (Chrome: ~1min max, Safari: pause totale)
- Le tick réactif (`interval(250ms)`) fonctionne correctement mais ne détecte pas l'expiration

## Correction

### Tâche 1 — TimerService : détection d'expiration via le tick réactif

**Fichier** : `src/app/features/timer/timer.service.ts`

1. Ajouter un `effect()` qui surveille `remainingMs` et `isRunning`
2. Quand `remainingMs() <= 0` ET `isRunning() === true` → déclencher `onTimerExpired()`
3. Utiliser un signal guard (`hasExpired = signal(false)`) pour éviter les appels multiples
4. Garder le `setTimeout` comme backup (se déclenche si le tick rate pour détecter)
5. Reset le guard dans `close()` et `resetToOriginal()`
6. Adapter les tests unitaires dans `timer.service.spec.ts`

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Tableau d'Avancement (La Source de Vérité)
- [ ] Tâche 1 : TimerService — détection d'expiration via tick réactif + guard `hasExpired`

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
