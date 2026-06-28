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
1. Remplis .opencode/todo.md avec ta feature et tes tâches
2. Ouvre opencode et sélectionne l'agent mastermind
3. Lance avec : "Démarre la boucle autonome sur la prochaine tâche."

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
Pour lancer une feature, copie le contenu de docs/feat/F*.md dans .opencode/todo.md puis lance ton agent mastermind :

# Exemple pour démarrer avec la F1
cp docs/feat/F1-foundation-core.md .opencode/todo.md
# Puis lance @mastermind
Ordre de build recommandé : F1 → F2 → F3 → F4 → F5 (les dépendances sont dans cet ordre).
Chaque feature contient 8 tâches atomiques avec un tableau d'avancement prêt pour ton workflow. Les stores sont découpés par domaine (exercise, timer, progress) comme convenu.
