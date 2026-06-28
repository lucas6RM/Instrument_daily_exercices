import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Navigation principale">
      <ul>
        <li>
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Dashboard
          </a>
        </li>
        <li>
          <a
            routerLink="/routine"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Routine
          </a>
        </li>
        <li>
          <a
            routerLink="/history"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Historique
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    nav {
      background-color: #1a1a2e;
      padding: 0.75rem 1.5rem;
    }

    ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 1rem;
    }

    a {
      color: #e0e0e0;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.2s, color 0.2s;
    }

    a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    a:focus-visible {
      outline: 2px solid #4a90d9;
      outline-offset: 2px;
    }

    a.active {
      background-color: #4a90d9;
      color: #ffffff;
      font-weight: 600;
    }
  `,
})
export class NavigationComponent {}
