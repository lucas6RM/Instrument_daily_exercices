import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let pct = percentage();
    @let completed = completedCount();
    @let total = totalCount();
    @let text = displayText();
    @let isComplete = pct === 100;

    <div class="w-full rounded-xl bg-gray-50 p-4 sm:p-5" role="region" aria-label="Barre de progression">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-700 sm:text-base" id="progress-label">
          {{ text }}
        </span>
        @if (isComplete) {
          <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Séance terminée !
          </span>
        }
      </div>

      <div
        class="h-3 w-full overflow-hidden rounded-full bg-gray-200 sm:h-4"
        role="progressbar"
        aria-valuemin="0"
        [attr.aria-valuemax]="total"
        [attr.aria-valuenow]="completed"
        [attr.aria-labelledby]="'progress-label'"
        aria-valuetext="{{ text }}"
      >
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          [style.width.%]="pct"
          [class.from-green-500]="isComplete"
          [class.to-green-600]="isComplete"
        ></div>
      </div>
    </div>
  `,
})
export class ProgressBarComponent {
  readonly completedCount = input<number>(0);
  readonly totalCount = input<number>(0);

  readonly percentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.completedCount() / total) * 100);
  });

  readonly displayText = computed(() => {
    const completed = this.completedCount();
    const total = this.totalCount();
    const pct = this.percentage();
    return `${completed}/${total} (${pct}%)`;
  });
}
