import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Exercise } from '../../../../core/models/exercise';

@Component({
  selector: 'app-exercise-row',
  templateUrl: './exercise-row.component.html',
})
export class ExerciseRowComponent {
  readonly exercise = input.required<Exercise>();
  readonly isCompleted = input<boolean>(false);

  readonly playExercise = output<void>();
}
