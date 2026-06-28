import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Exercise } from '../../core/models/exercise';

@Component({
  selector: 'app-exercise-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let ex = exercise();

    <article
      class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      role="listitem"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ ex.name }}
          </h3>

          <p class="mt-1 text-sm text-gray-600">
            Durée : {{ ex.durationMinutes }} min
          </p>

          @if (ex.youtubeUrl) {
            <p class="mt-1 text-sm">
              <a
                [href]="ex.youtubeUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 underline hover:text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Voir la vidéo YouTube
              </a>
            </p>
          }

          @if (ex.description) {
            <p class="mt-2 text-sm text-gray-700">
              {{ ex.description }}
            </p>
          }
        </div>

        <div class="flex shrink-0 gap-2">
          <button
            type="button"
            (click)="edit.emit(ex)"
            aria-label="Modifier {{ ex.name }}"
            class="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            Modifier
          </button>

          <button
            type="button"
            (click)="delete.emit(ex.id)"
            aria-label="Supprimer {{ ex.name }}"
            class="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ExerciseCardComponent {
  readonly exercise = input.required<Exercise>();
  readonly edit = output<Exercise>();
  readonly delete = output<string>();
}
