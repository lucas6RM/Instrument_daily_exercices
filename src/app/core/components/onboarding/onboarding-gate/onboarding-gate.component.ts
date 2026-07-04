import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Router, RouterOutlet } from '@angular/router';

import { OnboardingService } from '../../../services/onboarding.service';
import { OnboardingModalComponent } from '../onboarding-modal/onboarding-modal.component';

@Component({
  selector: 'app-onboarding-gate',
  imports: [CdkTrapFocus, OnboardingModalComponent, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeyDown($event)',
  },
  template: `
    @if (onboardingService.isCompleted()) {
      <router-outlet />
    } @else {
      <div cdkTrapFocus>
        <app-onboarding-modal
          [currentSlide]="currentSlide()"
          (next)="onNext()"
          (prev)="onPrev()"
          (skip)="onSkip()"
        />
      </div>
    }
  `,
})
export class OnboardingGateComponent {
  private readonly router = inject(Router);
  readonly onboardingService = inject(OnboardingService);

  readonly currentSlide = signal<number>(0);

  private readonly totalSlides = this.onboardingService.slides.length;

  onNext(): void {
    if (this.currentSlide() < this.totalSlides - 1) {
      this.currentSlide.update(v => v + 1);
    } else {
      this.onboardingService.complete();
      this.router.navigate(['/routine']);
    }
  }

  onPrev(): void {
    this.currentSlide.update(v => Math.max(0, v - 1));
  }

  onSkip(): void {
    this.onboardingService.complete();
    this.router.navigate(['/']);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.onboardingService.isCompleted()) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.currentSlide.update(v => Math.min(this.totalSlides - 1, v + 1));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.currentSlide.update(v => Math.max(0, v - 1));
        break;
      case 'Escape':
        event.preventDefault();
        this.onSkip();
        break;
    }
  }
}
