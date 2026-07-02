# ADR-007 : Refactoring UI — Spartan/ui (Brain + Helm) + Lucide

## Statut
Proposé

## Contexte
L'application utilise des styles Tailwind custom avec des couleurs chromatiques (vert, ambre, rouge, bleu foncé) et des SVG inline. Le DESIGN.md définit un design system strictement monochromatique inspiré de shadcn/ui. L'application est fonctionnelle — seul l'UI change.

## Décision
Adopter Spartan/ui (Brain + Helm) comme couche UI, avec Lucide pour les icônes et Inter comme police. Mapper le DESIGN.md sur les CSS variables Helm. Migration monochrome complète en un lot, sans modification de la logique métier ni de l'architecture.

### Choix technologiques
| Élément | Choix | Raison |
|---------|-------|--------|
| UI primitives | Spartan Brain + Helm | Helm est pré-stylé shadcn-like, proche du DESIGN.md |
| Icônes | @ng-icons + Lucide | Stack officielle Spartan, pas de SVG inline |
| Police | Inter (Google Fonts) | Substitute recommandé du DESIGN.md |
| Thème | Mapping DESIGN.md → variables Helm | Source unique, pas de duplication |
| Dark mode | Supprimé | DESIGN.md est light-only, dark mode futur |
| Rouge | Exception sémantique erreurs uniquement | Accessibilité, pas décoratif |
| Structure | Conservée | Refactoring UI pur, pas de restructuration |

### Trade-offs considérés
| Option | Choix | Raison |
|--------|-------|--------|
| Brain uniquement | Rejeté | Styling manuel trop long pour 13 composants |
| Helm sans adaptation | Rejeté | Variables Helm par défaut ne matchent pas le DESIGN.md |
| Restructuration libs/ui | Rejetée | Hors scope, risque de régression |
| Migration progressive | Rejetée | Delta monochrome impacte tout, cohérence globale prioritaire |

## Conséquences
- **+** UI alignée sur le DESIGN.md, design system cohérent
- **+** Composants accessibles par défaut (Brain primitives)
- **+** Pas de régression fonctionnelle attendue
- **-** Helm copie du code dans le projet (maintenance future)
- **-** Migration monochrome en un coup = PR volumineux
