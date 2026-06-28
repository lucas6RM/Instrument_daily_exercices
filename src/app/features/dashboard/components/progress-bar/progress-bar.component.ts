import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let pct = percentage();
    @let completed = completedCount();
    @let total = totalCount();
    @let text = displayText();

    <div class="w-full" role="region" aria-label="Barre de progression">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700" id="progress-label">
          {{ text }}
        </span>
      </div>

      <div
        class="h-4 w-full overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin="0"
        [attr.aria-valuemax]="total"
        [attr.aria-valuenow]="completed"
        [attr.aria-labelledby]="'progress-label'"
        aria-valuetext="{{ text }}"
      >
        <div
          class="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
          [style.width.%]="pct"
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
