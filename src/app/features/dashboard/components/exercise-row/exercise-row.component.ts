import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Exercise } from '../../../../core/models/exercise';

@Component({
  selector: 'app-exercise-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let ex = exercise();
    @let completed = isCompleted();

    <div
      class="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-200 ease-in-out hover:border-blue-200 hover:shadow-md sm:gap-4"
      [class.border-green-200]="completed"
      [class.bg-green-50]="completed"
    >
      <div class="flex shrink-0 items-center">
        <input
          type="checkbox"
          [id]="'checkbox-' + ex.id"
          [checked]="completed"
          (change)="toggleComplete.emit()"
          class="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 shadow-sm transition-all duration-150 ease-in-out hover:border-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          [class.border-green-400]="completed"
          [class.text-green-600]="completed"
        />
        <label
          [for]="'checkbox-' + ex.id"
          class="sr-only"
        >
          Marquer {{ ex.name }} comme terminé
        </label>
      </div>

      <div class="min-w-0 flex-1">
        <span
          [class.line-through]="completed"
          [class.text-gray-400]="completed"
          class="block truncate text-sm font-medium text-gray-900 transition-colors duration-200"
        >
          {{ ex.name }}
        </span>
        <span class="block truncate text-xs text-gray-500">
          {{ ex.durationMinutes }} min
        </span>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <button
          type="button"
          (click)="playExercise.emit()"
          aria-label="Lancer le timer pour {{ ex.name }}"
          class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-blue-500 hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
        >
          <svg
            class="h-3.5 w-3.5 sm:h-4 sm:w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          PLAY
        </button>

        @if (ex.youtubeUrl) {
          <a
            [href]="ex.youtubeUrl"
            target="_blank"
            rel="noopener noreferrer"
            [attr.aria-label]="'Voir la vidéo YouTube pour ' + ex.name"
            class="inline-flex items-center rounded-lg p-1.5 text-red-600 transition-all duration-150 ease-in-out hover:bg-red-50 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
              />
            </svg>
          </a>
        }
      </div>
    </div>
  `,
})
export class ExerciseRowComponent {
  readonly exercise = input.required<Exercise>();
  readonly isCompleted = input<boolean>(false);

  readonly toggleComplete = output<void>();
  readonly playExercise = output<void>();
}
