import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { Exercise } from '../../core/models/exercise';

@Component({
  selector: 'app-exercise-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    NgIcon,
  ],
  templateUrl: './exercise-card.component.html',
})
export class ExerciseCardComponent {
  readonly exercise = input.required<Exercise>();
  readonly edit = output<Exercise>();
  readonly delete = output<string>();
}
