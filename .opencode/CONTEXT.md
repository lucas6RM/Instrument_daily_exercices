# Projet : Instrument Daily Exercices

## Stack Technique
- **Framework** : Angular (standalone components)
- **Langage** : TypeScript strict
- **Build** : Angular CLI
- **Package manager** : pnpm

## Commandes du Projet
- Build : `pnpm run build`
- Test : `pnpm run test`
- Lint : `pnpm run lint`
- Serve : `pnpm run serve`

## Décisions Architecturales
- Voir [`docs/adr/`](docs/adr/) pour les ADR (SignalStore par domaine, Timer Date.now, Routing sans shell)

## Standards de Code (voir AGENTS.md pour le détail complet)
- Composants standalone uniquement
- Signals pour la gestion d'état
- `ChangeDetectionStrategy.OnPush` systématique
- `input()` / `output()` au lieu des décorateurs
- Contrôle natif (`@if`, `@for`, `@switch`) au lieu des pipes Angular
- Forms réactifs plutôt que template-driven
- Accessibilité WCAG AA obligatoire
- `inject()` au lieu de l'injection par constructeur
