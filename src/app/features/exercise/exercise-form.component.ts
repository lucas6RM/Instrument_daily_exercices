import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Exercise } from '../../core/models/exercise';

interface ExerciseFormValue {
  name: string;
  durationMinutes: number;
  youtubeUrl: string;
  description: string;
}

function positiveNumberValidator(): (control: AbstractControl<number | null>) => ValidationErrors | null {
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" aria-label="Formulaire d'exercice">
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label for="exercise-name" class="block text-sm font-medium text-gray-700">
            Nom de l'exercice
            <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="exercise-name"
            type="text"
            formControlName="name"
            required
            [attr.aria-invalid]="form.get('name')?.invalid && form.get('name')?.touched ? 'true' : null"
            [attr.aria-describedby]="form.get('name')?.invalid && form.get('name')?.touched ? 'name-error' : null"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p id="name-error" class="mt-1 text-sm text-red-600" role="alert">
              Le nom de l'exercice est requis.
            </p>
          }
        </div>

        <!-- Duration -->
        <div>
          <label for="exercise-duration" class="block text-sm font-medium text-gray-700">
            Durée (minutes)
            <span class="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="exercise-duration"
            type="number"
            min="1"
            formControlName="durationMinutes"
            required
            [attr.aria-invalid]="form.get('durationMinutes')?.invalid && form.get('durationMinutes')?.touched ? 'true' : null"
            [attr.aria-describedby]="form.get('durationMinutes')?.invalid && form.get('durationMinutes')?.touched ? 'duration-error' : null"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          @if (form.get('durationMinutes')?.invalid && form.get('durationMinutes')?.touched) {
            <p id="duration-error" class="mt-1 text-sm text-red-600" role="alert">
              @if (form.get('durationMinutes')?.errors?.['required']) {
                La durée est requise.
              } @else if (form.get('durationMinutes')?.errors?.['positive']) {
                La durée doit être supérieure à 0.
              }
            </p>
          }
        </div>

        <!-- YouTube URL -->
        <div>
          <label for="exercise-youtube" class="block text-sm font-medium text-gray-700">
            Lien YouTube
          </label>
          <input
            id="exercise-youtube"
            type="url"
            formControlName="youtubeUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="exercise-description" class="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="exercise-description"
            formControlName="description"
            rows="3"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Submit -->
        <div>
          <button
            type="submit"
            [disabled]="form.invalid"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            @if (exercise()) {
              Modifier l'exercice
            } @else {
              Ajouter l'exercice
            }
          </button>
        </div>
      </div>
    </form>
  `,
})
export class ExerciseFormComponent {
  readonly exercise = input<Exercise | null>(null);
  readonly save = output<ExerciseFormValue>();

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
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.save.emit(this.form.value as ExerciseFormValue);
    }
  }
}
