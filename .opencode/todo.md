# Feature F11 : Onboarding Premier Usage

## Spécification Technique Globale
Onboarding modal affiché uniquement lors de la première visite (localStorage vide). 4 slides explicatives du flow de l'app. À la fin, l'utilisateur est redirigé vers `/routine` pour configurer sa routine. Implémentation via un composant gate dans `app.html` et un service `OnboardingService`.

> 📋 Décisions architecturales : voir [`docs/adr/`](docs/adr/)
> 📋 Spécification du besoin global : voir [`docs/Specification_du_besoin.md`](docs/Specification_du_besoin.md)
> 📋 Dépend : F1 (StorageService), F10 (Spartan/ui)

## Skills à Charger

Les agents qui exécutent cette feature DOIVENT charger ces skills avant de commencer :

- **`angular-developer`** — standards Angular, signals, standalone components, accessibilité
- **`spartan`** — composants Spartan/ui (dialog, button, icon)

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Décisions de Design

| Décision | Choix |
|----------|-------|
| Détection première visite | Clé `ONBOARDING_COMPLETED` dédiée dans `STORAGE_KEYS` |
| Format | Modal overlay plein écran centré, pagination, bouton skip |
| Déclenchement | Au chargement de l'app via composant gate dans `app.html` |
| Visuels | Titre + texte descriptif + icône Lucide |
| Fin onboarding | Bouton "Commencer" → set flag + redirect `/routine` |
| Skip | Bouton "Passer" en haut à droite + touche `Échap` |
| Focus trap | Oui — flèches gauche/droite = navigation slides, `Échap` = skip, `Entrée` = action bouton |
| Placement | `src/app/core/components/onboarding/` |
| State | `OnboardingService` avec signals + persistance via `StorageService` |

## Modèle de Domaine

```typescript
interface OnboardingSlide {
  title: string;
  description: string;
  iconName: string; // nom Lucide
}
```

## Slides

| Slide | Titre | Description | Icône |
|-------|-------|-------------|-------|
| 0 | Bienvenue | Organisez votre pratique musicale quotidienne en quelques clics. Voici comment ça marche. | `lucideMusic` |
| 1 | Configurez votre routine | Définissez vos exercices avec nom, durée et un lien YouTube pour votre backing track. | `lucideListTodo` |
| 2 | Jouez vos exercices | Chaque jour, accédez à votre séance pour timer et cocher vos exercices au fur et à mesure. | `lucidePlay` |
| 3 | Suivez votre progression | Consultez votre historique hebdomadaire et rattrapez les jours manqués. | `lucideBarChart3` |

## Services Attendus

### `onboarding.service.ts`
- `isCompleted()` — signal booléen, lit `STORAGE_KEYS.ONBOARDING_COMPLETED` depuis `StorageService`
- `complete()` — set `ONBOARDING_COMPLETED = true` dans le localStorage
- `slides` — tableau constant des 4 slides

## Composants Attendus

### `OnboardingGateComponent`
- Placement : `app.html`, englobe `<router-outlet>`
- Si `isCompleted()` → affiche `<router-outlet>`
- Sinon → affiche `OnboardingModalComponent`
- Focus trap sur le modal
- Navigation clavier : `Flèche droite` = suivant, `Flèche gauche` = précédent, `Échap` = skip

### `OnboardingModalComponent`
- Overlay plein écran, fond blanc `#ffffff`
- Slide courante affichée avec icône Lucide, titre et description
- Pagination : numéros de slide (1/4, 2/4, etc.)
- Boutons :
  - "Passer" (top-right, `hlmBtn` variant `ghost`) → skip
  - "Précédent" (slide > 0, `hlmBtn` variant `outline`)
  - "Suivant" (slide < 3, `hlmBtn` variant `default`)
  - "Commencer" (slide = 3, `hlmBtn` variant `default`) → complete + redirect `/routine`
- Icônes Lucide à enregistrer : `lucideMusic`, `lucideListTodo`, `lucidePlay`, `lucideBarChart3`

## Icônes Lucide à Ajouter

```typescript
// Dans app.config.ts, provideIcons()
lucideMusic,
lucideListTodo,
lucidePlay,      // déjà présent
lucideBarChart3,
```

## Modifications Attendues

1. `storage-keys.ts` — ajouter `ONBOARDING_COMPLETED: 'instrument_daily_onboarding_completed'`
2. `app.config.ts` — ajouter les nouvelles icônes Lucide
3. `app.html` — wrapper `<router-outlet>` avec `<app-onboarding-gate>`
4. `onboarding.service.ts` — nouveau service
5. `onboarding-gate.component.ts` — nouveau composant
6. `onboarding-modal.component.ts` — nouveau composant

## Tableau d'Avancement (La Source de Vérité)
- [ ] Tâche 1 : Ajouter `ONBOARDING_COMPLETED` à `STORAGE_KEYS` et créer `OnboardingService`
- [ ] Tâche 2 : Créer `OnboardingModalComponent` avec les 4 slides, pagination et boutons
- [ ] Tâche 3 : Créer `OnboardingGateComponent` avec focus trap et navigation clavier
- [ ] Tâche 4 : Intégrer le gate dans `app.html` autour de `<router-outlet>`
- [ ] Tâche 5 : Enregistrer les icônes Lucide manquantes dans `app.config.ts`
- [ ] Tâche 6 : Styler avec Spartan/ui et le design system monochrome (DESIGN.md)
- [ ] Tâche 7 : Vérifier accessibilité WCAG AA (focus trap, clavier, contrastes, aria)
- [ ] Tâche 8 : Tests unitaires (service, gate, modal, navigation slides)

## Zone de Transit & Logs
### Tâche en cours :
- Tâche 1

### Compteur de rejets (tâche actuelle) :
- 1 / 5

### Dernier retour de Review :
- `isCompleted` n'est PAS un signal. La spec demande "signal booléen". Actuellement exposé comme `readonly isCompleted = (): boolean => this._isCompleted()` (méthode). Il faut exposer un `computed()` ou un `signal` en lecture seule pour que l'OnboardingGateComponent réagisse réactivement quand `complete()` est appelé (surtout avec OnPush).
- L'initialisation dans le `constructor()` n'est pas idiomatique Angular avec les signals. Remplacer par un `effect()` pour la lecture initiale depuis le StorageService.

### Blocage Actuel :
- Aucun.
