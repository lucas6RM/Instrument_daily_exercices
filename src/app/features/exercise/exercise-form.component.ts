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
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p id="name-error" class="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
              </svg>
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
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          @if (form.get('durationMinutes')?.invalid && form.get('durationMinutes')?.touched) {
            <p id="duration-error" class="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
              </svg>
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
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          ></textarea>
        </div>

        <!-- Submit -->
        <div class="pt-2">
          @if (exercise()) {
            <button
              type="submit"
              [disabled]="form.invalid"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.35 3.106a.5.5 0 0 1 .711 0l5.75 5.75a.5.5 0 0 1 0 .711l-9.39 9.39a1.5 1.5 0 0 1-.711.39L3.5 19.5v-4.25a.5.5 0 0 1 .146-.354l8.704-8.704Z"
                />
              </svg>
              Modifier l'exercice
            </button>
          } @else {
            <button
              type="submit"
              [disabled]="form.invalid"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Ajouter l'exercice
            </button>
          }
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
