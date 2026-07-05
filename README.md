# InstrumentDailyExercices

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


# Workflow agentic:

Pour lancer le workflow :
1. Ouvre opencode et sélectionne l'agent mastermind
2. Lance avec : "Tu peux lancer l'implementation de @docs/feat/FX..."

## exemple de features créés pour le MVP
Voici ce qui a été créé :
docs/
├── adr/
│   └── 001-architecture.md      # 3 ADR (SignalStore, Timer Date.now, Routing)
├── feat/
│   ├── F1-foundation-core.md    # Models, Stores, StorageService, Routing
│   ├── F2-timer-engine-overlay.md # Timer Date.now(), Overlay, Audio beep
│   ├── F3-exercise-crud.md      # Admin routine, formulaire réactif
│   ├── F4-daily-dashboard.md    # Checklist, PLAY→Timer, progression %
│   └── F5-weekly-history.md     # Vue semaine, temps/jour, temps/exercice
└── glossary.md                  # Vocabulaire domaine


## fake datas

Pour utiliser :
1. Lance l'app : pnpm ng serve
2. Ouvre http://localhost:4200?seed=fake
3. Les données sont injectées dans le localStorage au démarrage :
- 4 exercices : Gamme blues, 2-5-1 mineur, Some Other Time, Improvisation libre
- 15 jours de sessions (jusqu'à aujourd'hui)
- Changement de routine au milieu : jours 14–7 = 3 exercices, jours 6–0 = 4 exercices
- Mélange de complétés/non complétés avec des bonus minutes (replays)
- Onboarding marqué comme complété
4. Une fois les screenshots faits, supprime ?seed=fake et rafraîchis pour retrouver l'état normal
5. Quand tu as fini, on supprime seed-fake-data.ts et son appel dans app.config.ts
