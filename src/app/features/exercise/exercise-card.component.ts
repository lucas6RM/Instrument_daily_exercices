import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Exercise } from '../../core/models/exercise';

@Component({
  selector: 'app-exercise-card',
  templateUrl: './exercise-card.component.html',
})
export class ExerciseCardComponent {
  readonly exercise = input.required<Exercise>();
  readonly edit = output<Exercise>();
  readonly delete = output<string>();
}
