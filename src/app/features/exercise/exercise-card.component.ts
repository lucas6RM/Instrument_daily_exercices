import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Exercise } from '../../core/models/exercise';

@Component({
  selector: 'app-exercise-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let ex = exercise();

    <article
      class="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
      role="listitem"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-semibold text-gray-900 sm:text-lg">
            {{ ex.name }}
          </h3>

          <p class="mt-1 text-sm text-gray-600">
            Durée : {{ ex.durationMinutes }} min
          </p>

          @if (ex.youtubeUrl) {
            <p class="mt-2">
               <a
                 [href]="ex.youtubeUrl"
                 target="_blank"
                 rel="noopener noreferrer"
                 [attr.aria-label]="'Voir la vidéo YouTube pour ' + ex.name"
                 class="inline-flex items-center gap-1 text-sm font-medium text-red-600 underline decoration-red-600/30 underline-offset-2 transition-colors hover:text-red-500 hover:decoration-red-500/30 focus-visible:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
               >
                <svg
                  class="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                  />
                </svg>
                Voir la vidéo YouTube
              </a>
            </p>
          }

          @if (ex.description) {
            <p class="mt-2 text-sm leading-relaxed text-gray-600">
              {{ ex.description }}
            </p>
          }
        </div>

        <div class="flex shrink-0 gap-2 sm:flex-col">
          <button
            type="button"
            (click)="edit.emit(ex)"
            aria-label="Modifier {{ ex.name }}"
            class="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
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
            Modifier
          </button>

          <button
            type="button"
            (click)="delete.emit(ex.id)"
            aria-label="Supprimer {{ ex.name }}"
            class="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
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
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
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
