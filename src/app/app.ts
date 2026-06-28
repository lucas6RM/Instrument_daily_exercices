import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationComponent } from './core/components/navigation/navigation.component';
import { TimerOverlayComponent } from './features/timer/timer-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent, TimerOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  protected readonly title = signal('instrument-daily-exercices');
}
