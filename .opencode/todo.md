# Feature F10 : Refactoring UI — Spartan/ui + Lucide

## Spécification Technique Globale
Refactoring complet de l'UI vers Spartan/ui (Brain + Helm) avec des icônes Lucide et la police Inter. Migration monochrome conforme au DESIGN.md. Aucun changement de logique métier.

> 📋 Décisions architecturales : voir [`docs/adr/007-refactor-ui-spartan-lucide.md`](docs/adr/007-refactor-ui-spartan-lucide.md)
> 📋 Design system : voir [`DESIGN.md`](DESIGN.md)
> 📋 Dépend : aucune — l'application est fonctionnelle

## Skills à Charger

Les agents qui exécutent cette feature DOIVENT charger ces skills avant de commencer :

- **`spartan`** — gestion de Spartan/ui (Brain + Helm), composants, CLI, règles de composition
- **`angular-developer`** — standards Angular, signals, standalone components, accessibilité

## Standards du Projet & Commandes
- Build : `pnpm run build`
- Test : `pnpm run test --watch=false`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Design System

Voir [`DESIGN.md`](DESIGN.md) pour le design system complet. Points clés :

- **Monochrome strict** : `#0a0a0a` (texte), `#737373` (secondaire), `#e5e5e5` (bordures), `#ffffff` (surfaces)
- **Exception** : rouge uniquement pour les erreurs de formulaire
- **Bordures 1px** comme séparateurs structuraux, pas de shadows
- **Radii** : 10px (boutons/inputs), 14px (cards), 26px (badges/pills)
- **Police** : Inter, weights 400/500/600
- **Spacing** : gaps de 8px entre éléments, 48px entre sections

## Mapping DESIGN.md → Variables Helm

| Variable Helm | Valeur DESIGN.md | Rôle |
|---------------|-----------------|------|
| `--background` | `#ffffff` | Canvas |
| `--foreground` | `#0a0a0a` | Texte principal |
| `--card` | `#ffffff` | Surfaces cards |
| `--card-foreground` | `#0a0a0a` | Texte dans les cards |
| `--primary` | `#0a0a0a` | Bouton primary (filled black) |
| `--primary-foreground` | `#ffffff` | Texte sur primary |
| `--secondary` | `#f2f2f2` | Surfaces muted, ghost hover |
| `--secondary-foreground` | `#0a0a0a` | Texte sur secondary |
| `--muted` | `#f2f2f2` | Tags, pills |
| `--muted-foreground` | `#737373` | Texte secondaire |
| `--border` | `#e5e5e5` | Bordures structurelles |
| `--input` | `#e5e5e5` | Bordures inputs |
| `--ring` | `#0a0a0a` | Focus ring |
| `--accent` | `#f2f2f2` | Surfaces accentuées |
| `--accent-foreground` | `#0a0a0a` | Texte sur accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Erreurs (exception chromatique) |
| `--radius` | `0.625rem` (10px) | Radius par défaut |

## Tâche 1 : Installation et Configuration

### Sous-tâches
1.1 — Installation Helm + icônes
1.2 — Configuration thème
1.3 — Configuration police Inter

#### 1.1 — Installation Helm + icônes
- Ajouter `@spartan-ng/helm` en dependency
- Ajouter `@ng-icons` et `@ng-icons/lucide` en dependencies
- Initialiser Spartan : `npx nx g @spartan-ng/cli:init`
- Générer les composants Helm nécessaires avec `npx nx g @spartan-ng/cli:ui --name=<component>`

Composants Helm à générer :
- `button` — boutons primaires et secondaires
- `input` — champs texte
- `textarea` — descriptions
- `label` — labels de formulaire
- `field` — layout de formulaire (hlmField)
- `card` — containers de contenu
- `badge` — états et tags
- `tabs` — navigation principale
- `dialog` — modals (catch-up, confirmations)
- `progress` — barre de progression
- `separator` — séparateurs visuels
- `tooltip` — tooltips
- `spinner` — états de chargement
- `icon` — icônes Lucide

#### 1.2 — Configuration thème
- Mettre à jour `styles.scss` avec le mapping DESIGN.md → variables Helm
- Supprimer le bloc `:root.dark` (pas de dark mode)
- Supprimer les duplications de `@layer` et `@import` (il y a des doublons actuels)
- Appliquer les radii du DESIGN.md : `--radius: 10px`, `--radius-card: 14px`
- Configurer `--font-sans: Inter, system-ui, sans-serif`

#### 1.3 — Configuration police Inter
- Ajouter l'import Google Fonts dans `index.html` : `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`
- Mettre à jour `--font-sans` : `Inter, system-ui, -apple-system, sans-serif`
- Configurer `font-feature-settings` pour OpenType features si applicable

## Tâche 2 : Migration Navigation

### Composant
- `app/core/components/navigation/navigation.component`

### Changements
- Remplacer la nav custom (`nav > ul > li > a`) par `hlm-tabs` avec `hlm-tabs-list` et `hlm-tabs-trigger`
- Supprimer tous les styles inline (`background-color: #1a1a2e`, etc.)
- Mapper `routerLinkActive` sur le variant active des tabs
- Textes : "Séance", "Routine", "Historique"
- Fond blanc, bordure `#e5e5e5` en bas, texte `#0a0a0a`
- État actif : fond `#0a0a0a`, texte blanc (pattern "filled black button" du DESIGN.md)

## Tâche 3 : Migration Dashboard

### Composants
- `app/features/dashboard/dashboard.component`
- `app/features/dashboard/components/exercise-row/exercise-row.component`
- `app/features/dashboard/components/exercise-time-display/exercise-time-display.component`
- `app/features/dashboard/components/progress-bar/progress-bar.component`

### Changements
- Header : `h1` en style display (48px, weight 600, -0.05em tracking), sous-titre en `#737373`
- `ProgressBar` : remplacer par `hlm-progress`
- `ExerciseRow` : container avec bordure `#e5e5e5`, radius 14px, padding 16px
  - Remplacer SVG play/check par `<ng-icon name="lucidePlay" />` / `<ng-icon name="lucideCheck" />`
  - Bouton play : `hlmBtn` variant `default` (filled black)
  - État complété : texte en `#737373`, check en `#0a0a0a`
- `ExerciseTimeDisplay` : badge `hlmBadge` variant `secondary` pour les bonus minutes
- Empty state : remplacer par `hlm-empty` ou card avec bordure dashed `#e5e5e5`

## Tâche 4 : Migration Formulaire Exercice

### Composant
- `app/features/exercise/exercise-form.component`

### Changements
- Remplacer tous les `<input>` custom par `hlmField` + `hlmInput`
- Remplacer `<label>` custom par `hlmLabel`
- Remplacer `<textarea>` custom par `hlmTextarea`
- Messages d'erreur : garder `text-destructive` (exception rouge)
- Supprimer tous les SVG inline d'erreur, utiliser `<ng-icon name="lucideCircleAlert" />`
- Bouton submit : `hlmBtn` variant `default` (filled black)
  - Mode ajout : texte "Ajouter"
  - Mode édition : texte "Modifier"
  - Supprimer les icônes SVG inline, remplacer par Lucide (`lucidePlus`, `lucidePen`)
- Supprimer toutes les classes `bg-green-600`, `bg-amber-600`, `border-blue-500`, `focus:ring-blue-500`

## Tâche 5 : Migration Routine

### Composant
- `app/features/routine/routine.component`

### Changements
- Cards d'exercices : `hlm-card` avec bordure `#e5e5e5`, radius 14px
- Boutons d'action (éditer, supprimer) : `hlmBtn` variant `ghost` / `destructive`
- Remplacer SVG inline par Lucide (`lucidePen`, `lucideTrash`, `lucideGripVertical`)
- Formulaire inline : utiliser les composants de la Tâche 4
- Empty state : `hlm-empty` ou card avec message en `#737373`

## Tâche 6 : Migration Historique

### Composants
- `app/features/history/history.component`
- `app/features/history/week-day-card/week-day-card.component`
- `app/features/history/weekly-summary/weekly-summary.component`
- `app/features/history/catch-up-modal/catch-up-modal.component`

### Changements
- Header : `h1` display style, date en `#737373`
- Navigation semaines : boutons `hlmBtn` variant `outline` avec icônes Lucide (`lucideChevronLeft`, `lucideChevronRight`, `lucideCalendar`)
- Bouton "Aujourd'hui" : `hlmBtn` variant `default` (filled black)
- `WeekDayCard` : `hlm-card` avec bordure `#e5e5e5`
  - Jour actuel : bordure `#0a0a0a` (au lieu de `border-green-300`)
  - Supprimer badge "Rattrapable" (déjà fait en F9)
  - Temps total en `#0a0a0a` weight 600
  - Détails en `#737373`
- `WeeklySummary` : `hlm-card`, stats en typographie display/body
- `CatchUpModal` : migrer vers `hlm-dialog` avec `hlm-dialog-content`, `hlm-dialog-header`, `hlm-dialog-title`, `hlm-dialog-close`
  - Exercices à rattraper : liste avec `hlm-checkbox` pour chaque exercice
  - Bouton valider : `hlmBtn` variant `default`

## Tâche 7 : Migration Timer Overlay

### Composant
- `app/features/timer/timer-overlay.component`

### Changements
- Overlay plein écran en fond blanc `#ffffff`
- Timer en typographie display (48px, weight 600, -0.05em tracking)
- Nom de l'exercice en `#737373`
- Boutons de contrôle : `hlmBtn` variant `default` (pause/play), `hlmBtn` variant `outline` (reset), `hlmBtn` variant `ghost` (close)
- Remplacer SVG inline par Lucide (`lucidePause`, `lucidePlay`, `lucideRotateCcw`, `lucideX`)
- Progression visuelle : `hlm-progress` ou cercle avec bordure `#e5e5e5`

## Tâche 8 : Nettoyage Final

### Sous-tâches
8.1 — Supprimer tous les SVG inline résiduels
8.2 — Supprimer les classes chromatiques (`bg-green-*`, `bg-amber-*`, `text-red-*` sauf erreurs, `border-green-*`, `focus:ring-green-*`, `focus:ring-blue-*`)
8.3 — Vérifier que tous les `<ng-icon>` sont enregistrés via `provideIcons()` dans `app.config.ts`
8.4 — Exécuter `npx nx g @spartan-ng/cli:healthcheck` pour détecter les patterns dépréciés
8.5 — Vérifier accessibilité (axe, contrastes, focus management)

### Icônes Lucide à enregistrer
```typescript
provideIcons([
  // Navigation / Actions
  lucidePlay, lucidePause, lucideRotateCcw, lucideX,
  lucideChevronLeft, lucideChevronRight, lucideChevronDown,
  // CRUD
  lucidePlus, lucidePen, lucideTrash,
  // États
  lucideCheck, lucideCircleAlert,
  // Navigation
  lucideCalendar, lucideGripVertical,
])
```

## Tableau d'Avancement (La Source de Vérité)
- [x] Tâche 1 : Installation et Configuration
- [x] Tâche 2 : Migration Navigation
- [ ] Tâche 3 : Migration Dashboard
- [ ] Tâche 4 : Migration Formulaire Exercice
- [ ] Tâche 5 : Migration Routine
- [ ] Tâche 6 : Migration Historique
- [ ] Tâche 7 : Migration Timer Overlay
- [ ] Tâche 8 : Nettoyage Final

## Zone de Transit & Logs
### Tâche en cours :
- Aucune

### Compteur de rejets (tâche actuelle) :
- 0 / 5

### Dernier retour de Review :
- Aucun.

### Blocage Actuel :
- Aucun.
