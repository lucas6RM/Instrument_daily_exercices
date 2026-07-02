import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmProgressImports } from '@spartan-ng/helm/progress';

@Component({
  selector: 'app-progress-bar',
  imports: [HlmProgressImports, HlmBadgeImports],
  templateUrl: './progress-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
