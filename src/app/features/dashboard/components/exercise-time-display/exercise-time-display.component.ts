import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-exercise-time-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [attr.aria-label]="displayText()" class="inline-flex items-center text-xs font-medium">
      {{ displayText() }}
    </span>
  `,
})
export class ExerciseTimeDisplayComponent {
  readonly actualMinutes = input<number>(0);
  readonly bonusMinutes = input<number>(0);
  readonly completed = input<boolean>(false);
  readonly playCount = input<number>(1);

  readonly displayText = computed(() => {
    const completed = this.completed();
    const actualMinutes = this.actualMinutes();
    const bonusMinutes = this.bonusMinutes();
    const playCount = this.playCount();

    if (!completed) {
      return `⏳ ${actualMinutes}min`;
    }

    if (bonusMinutes > 0) {
      return `✅ ${actualMinutes}min + ${bonusMinutes}min bonus (${playCount}×)`;
    }

    return `✅ ${actualMinutes}min`;
  });
}
