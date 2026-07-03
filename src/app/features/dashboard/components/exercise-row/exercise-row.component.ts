import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { Exercise } from '../../../../core/models/exercise';
import { ExerciseTimeDisplayComponent } from '../exercise-time-display/exercise-time-display.component';

@Component({
  selector: 'app-exercise-row',
  imports: [ExerciseTimeDisplayComponent, NgIcon, HlmButtonImports, HlmCheckboxImports],
  templateUrl: './exercise-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExerciseRowComponent {
  readonly exercise = input.required<Exercise>();
  readonly isCompleted = input<boolean>(false);
  readonly actualMinutes = input<number>(0);
  readonly bonusMinutes = input<number>(0);
  readonly playCount = input<number>(1);

  readonly playExercise = output<void>();
}
