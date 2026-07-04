import { Component, computed, inject, signal } from '@angular/core';

import { NavigationComponent } from './core/components/navigation/navigation.component';
import { OnboardingGateComponent } from './core/components/onboarding/onboarding-gate/onboarding-gate.component';
import { OnboardingService } from './core/services/onboarding.service';
import { TimerOverlayComponent } from './features/timer/timer-overlay.component';

@Component({
  selector: 'app-root',
  imports: [NavigationComponent, OnboardingGateComponent, TimerOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  private readonly onboardingService = inject(OnboardingService);

  protected readonly title = signal('instrument-daily-exercices');

  // When modal is open, hide background content from screen readers
  protected readonly isOnboardingModalOpen = computed(
    () => !this.onboardingService.isCompleted()
  );
}
