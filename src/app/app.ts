import { Component, signal } from '@angular/core';

import { NavigationComponent } from './core/components/navigation/navigation.component';
import { OnboardingGateComponent } from './core/components/onboarding/onboarding-gate/onboarding-gate.component';
import { TimerOverlayComponent } from './features/timer/timer-overlay.component';

@Component({
  selector: 'app-root',
  imports: [NavigationComponent, OnboardingGateComponent, TimerOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  protected readonly title = signal('instrument-daily-exercices');
}
