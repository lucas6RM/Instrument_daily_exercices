import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePen, lucideTrash, lucideYoutube } from '@ng-icons/lucide';
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
  providers: [provideIcons({ lucidePen, lucideTrash, lucideYoutube })],
  templateUrl: './exercise-card.component.html',
})
export class ExerciseCardComponent {
  readonly exercise = input.required<Exercise>();
  readonly edit = output<Exercise>();
  readonly delete = output<string>();
}
