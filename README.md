# InstrumentDailyExercise

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



## Introduction & Description du Besoin

L'objectif de ce projet est de remplacer le suivi de pratique quotidien sur papier d'un pianiste par une application web responsive, minimaliste et gamifiée, utilisable directement depuis un smartphone, une tablette posée sur le pupitre ou un ordinateur.

- **Le Problème :** Le suivi des exercices (gammes, improvisation, standards de jazz) se fait manuellement. Cela disperse les outils nécessaires à la pratique (chronomètre externe, métronome, recherche de liens YouTube pour les _backing tracks_) et n'offre aucun historique ni levier visuel de motivation.
    
- **La Solution (MVP) :** Une application centralisée "zéro friction" qui permet de :
    
    1. **Planifier** sa routine d'exercices quotidienne (durée cible, consignes, liens externes).
        
    2. **Rythmer** la session grâce à un minuteur global persistant (en overlay) qui avertit le musicien de la fin de l'exercice, même s'il consulte un autre onglet (comme un backing track YouTube).
        
    3. **Gamifier** la pratique via une mécanique simple de liste de tâches quotidienne avec un pourcentage d'accomplissement visuel pour encourager la régularité.
        


## Stack Technique Retenue

- **Framework :** Angular (Architecture Single Page Application - Mode Client pur).
    
- **Gestion d'État :** Angular Signals (idéal pour la réactivité du Timer global et la synchronisation LocalStorage).
    
- **Styles :** CSS/SCSS (ou Tailwind CSS si tu l'utilises d'habitude) pour un design épuré et responsive.
    
- **Persistance :** `window.localStorage` (Stockage local des exercices et de la progression sous forme de JSON).
    
- **Audio :** API Web Audio native du navigateur pour le signal sonore de fin.
