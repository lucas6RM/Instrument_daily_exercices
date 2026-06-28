import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationComponent } from './core/components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  protected readonly title = signal('instrument-daily-exercices');
}
