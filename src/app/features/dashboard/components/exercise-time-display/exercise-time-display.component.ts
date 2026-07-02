import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-exercise-time-display',
  imports: [HlmBadgeImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [attr.aria-label]="displayText()" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      @if (completed()) {
        <span>✓ {{ actualMinutes() }}min</span>
        @if (bonusMinutes() > 0) {
          <span hlmBadge variant="secondary">+{{ bonusMinutes() }}min bonus ({{ playCount() }}×)</span>
        }
      } @else {
        <span>⏳ {{ actualMinutes() }}min</span>
      }
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
