import { Component, afterNextRender, effect, input, output, viewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Exercise } from '../../core/models/exercise';

interface ExerciseFormValue {
  name: string;
  durationSeconds: number;
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
  imports: [ReactiveFormsModule],
  templateUrl: './exercise-form.component.html',
})
export class ExerciseFormComponent {
  readonly exercise = input<Exercise | null>(null);
  readonly save = output<ExerciseFormValue>();

  readonly nameInput = viewChild<HTMLInputElement>('nameInput');

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    durationSeconds: new FormControl(0, [Validators.required, positiveNumberValidator()]),
    youtubeUrl: new FormControl(''),
    description: new FormControl(''),
  });

  constructor() {
    effect(() => {
      const ex = this.exercise();
      if (ex) {
        this.form.patchValue({
          name: ex.name,
          durationSeconds: ex.durationSeconds,
          youtubeUrl: ex.youtubeUrl ?? '',
          description: ex.description ?? '',
        });
      } else {
        this.form.reset({
          name: '',
          durationSeconds: 0,
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

      // After adding a new exercise, refocus the name input
      if (!this.exercise()) {
        const el = this.nameInput();
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
      }
    }
  }
}
