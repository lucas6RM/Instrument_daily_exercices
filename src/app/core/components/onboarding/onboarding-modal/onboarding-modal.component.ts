import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';

import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-modal',
  imports: [NgIcon, HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-white p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <!-- Skip button (top-right) -->
      <button
        type="button"
        hlmBtn
        variant="ghost"
        size="sm"
        class="absolute top-6 right-6"
        (click)="onSkip()"
        aria-label="Passer l'onboarding"
      >
        Passer
      </button>

      <!-- Slide content -->
      <div class="flex flex-col items-center text-center max-w-md">
        <!-- Icon -->
        <ng-icon
          [name]="slide().iconName"
          size="3xl"
          class="text-foreground mb-8"
        />

        <!-- Title -->
        <h2
          id="onboarding-title"
          class="text-2xl font-semibold tracking-tight text-[#0a0a0a] mb-4"
        >
          {{ slide().title }}
        </h2>

        <!-- Description -->
        <p class="text-base text-[#737373] mb-10">
          {{ slide().description }}
        </p>

        <!-- Pagination -->
        <span class="text-sm text-[#737373] mb-8">
          {{ currentSlide() + 1 }} / {{ totalSlides() }}
        </span>

        <!-- Navigation buttons -->
        <div class="flex items-center gap-3">
          @if (currentSlide() > 0) {
            <button
              type="button"
              hlmBtn
              variant="outline"
              (click)="onPrev()"
              aria-label="Slide précédente"
            >
              Précédent
            </button>
          }

          @if (currentSlide() < 3) {
            <button
              type="button"
              hlmBtn
              variant="default"
              (click)="onNext()"
              aria-label="Slide suivante"
            >
              Suivant
            </button>
          } @else {
            <button
              type="button"
              hlmBtn
              variant="default"
              (click)="onNext()"
              aria-label="Commencer"
            >
              Commencer
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class OnboardingModalComponent {
  private readonly onboardingService = inject(OnboardingService);

  readonly currentSlide = input<number>(0);
  readonly next = output<void>();
  readonly prev = output<void>();
  readonly skip = output<void>();

  readonly totalSlides = computed(() => this.onboardingService.slides.length);

  readonly slide = computed(() => {
    const index = this.currentSlide();
    return this.onboardingService.slides[index] ?? this.onboardingService.slides[0];
  });

  onNext(): void {
    this.next.emit();
  }

  onPrev(): void {
    this.prev.emit();
  }

  onSkip(): void {
    this.skip.emit();
  }
}
