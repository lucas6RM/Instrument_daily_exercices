import { Component, ChangeDetectionStrategy, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, HlmTabsImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav
      aria-label="Navigation principale"
      class="bg-background border-b border-border w-full"
    >
      <hlm-tabs [tab]="currentTab()">
        <hlm-tabs-list variant="line" class="w-full justify-start bg-transparent! rounded-none p-0">
          @for (item of navItems; track item.tab) {
            <button
              [routerLink]="item.route"
              [hlmTabsTrigger]="item.tab"
              class="data-active:bg-black! data-active:text-white! data-active:shadow-none! text-foreground!"
            >
              {{ item.label }}
            </button>
          }
        </hlm-tabs-list>
      </hlm-tabs>
    </nav>
  `,
})
export class NavigationComponent {
  private readonly router = inject(Router);

  readonly navItems = [
    { tab: 'seance', route: '/', label: 'Séance' },
    { tab: 'routine', route: '/routine', label: 'Routine' },
    { tab: 'historique', route: '/history', label: 'Historique' },
  ];

  readonly currentTab = signal('seance');

  constructor() {
    effect(() => {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const url = event.urlAfterRedirects.split('?')[0];
          const mapping: Record<string, string> = {
            '/': 'seance',
            '/routine': 'routine',
            '/history': 'historique',
          };
          this.currentTab.set(mapping[url] ?? 'seance');
        }
      });
    });
  }
}
