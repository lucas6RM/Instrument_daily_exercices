import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';

import { OnboardingService } from '../../../services/onboarding.service';

@Component({
  selector: 'app-onboarding-modal',
  imports: [NgOptimizedImage, NgIcon, HlmButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff] p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      tabindex="-1"
    >
      <div class="flex flex-col items-center text-center max-w-2xl w-full" aria-live="polite">
        <div class="self-end mb-6">
          <button
            type="button"
            hlmBtn
            variant="ghost"
            size="sm"
            (click)="onSkip()"
            aria-label="Passer l'onboarding"
          >
            Passer
          </button>
        </div>

        <ng-icon
          [name]="slide().iconName"
          size="3xl"
          class="text-[#0a0a0a] mb-6"
          aria-hidden="true"
          role="presentation"
        />

        <h2
          id="onboarding-title"
          class="text-2xl font-semibold tracking-tight text-[#0a0a0a] mb-4"
        >
          {{ slide().title }}
        </h2>

        <p class="text-base text-[#737373] leading-relaxed mb-8">
          {{ slide().description }}
        </p>

        <img
          [ngSrc]="slide().screenshotUrl"
          width="800"
          height="500"
          [alt]="slide().screenshotAlt"
          class="w-full max-w-lg rounded-[14px] mb-12"
          decoding="async"
        />

        <span class="text-xs text-[#737373] mb-8" aria-live="polite">
          {{ currentSlide() + 1 }} / {{ totalSlides() }}
        </span>

        <div class="flex items-center gap-2">
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

          @if (currentSlide() < totalSlides() - 1) {
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
