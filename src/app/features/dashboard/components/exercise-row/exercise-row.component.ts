import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Exercise } from '../../../../core/models/exercise';
import { ExerciseTimeDisplayComponent } from '../exercise-time-display/exercise-time-display.component';

@Component({
  selector: 'app-exercise-row',
  imports: [ExerciseTimeDisplayComponent],
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
