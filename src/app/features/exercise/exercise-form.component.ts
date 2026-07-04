import { ChangeDetectionStrategy, Component, afterNextRender, effect, input, output, viewChild } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { Exercise } from '../../core/models/exercise';

interface ExerciseFormValue {
  name: string;
  durationMinutes: number;
  youtubeUrl: string;
  description: string;
}

function positiveNumberValidator(): (
  control: AbstractControl<number | null>,
) => ValidationErrors | null {
  return (control) => {
    const value = control.value;
    if (value == null) {
      return null;
    }
    return value > 0 ? null : { positive: true };
  };
}

@Component({
  selector: 'app-exercise-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    HlmFieldImports,
    HlmInputImports,
    HlmTextareaImports,
    HlmButtonImports,
    NgIcon,
  ],
  templateUrl: './exercise-form.component.html',
})
export class ExerciseFormComponent {
  readonly exercise = input<Exercise | null>(null);
  readonly save = output<ExerciseFormValue>();

  readonly nameInput = viewChild<HTMLInputElement>('nameInput');

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    durationMinutes: new FormControl(0, [Validators.required, positiveNumberValidator()]),
    youtubeUrl: new FormControl(''),
    description: new FormControl(''),
  });

  constructor() {
    effect(() => {
      const ex = this.exercise();
      if (ex) {
        this.form.patchValue({
          name: ex.name,
          durationMinutes: ex.durationMinutes,
          youtubeUrl: ex.youtubeUrl ?? '',
          description: ex.description ?? '',
        });
      } else {
        this.form.reset({
          name: '',
          durationMinutes: 0,
          youtubeUrl: '',
          description: '',
        });
      }
    });

    afterNextRender(() => {
      const el = this.nameInput();
      if (el && typeof el.focus === 'function') {
        el.focus();
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.save.emit(this.form.value as ExerciseFormValue);

      // After adding a new exercise, reset the form and refocus the name input
      if (!this.exercise()) {
        this.form.reset();
        const el = this.nameInput();
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
      }
    }
  }
}
