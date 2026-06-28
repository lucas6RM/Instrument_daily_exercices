import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ExerciseStore } from '../exercise/exercise.store';
import { ExerciseCardComponent } from '../exercise/exercise-card.component';
import { ExerciseFormComponent } from '../exercise/exercise-form.component';
import { Exercise } from '../../core/models/exercise';

interface ExerciseFormValue {
  name: string;
  durationMinutes: number;
  youtubeUrl: string;
  description: string;
}

@Component({
  selector: 'app-routine',
  imports: [ExerciseCardComponent, ExerciseFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header class="mb-6 sm:mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Ma routine d'exercices
        </h1>
        <p class="mt-2 text-sm text-gray-500">
          Gérez vos exercices quotidiens : ajoutez, modifiez ou supprimez.
        </p>
      </header>

      <!-- Live region for accessibility announcements -->
      <div
        #liveRegion
        class="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ liveMessage() }}
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        <!-- Liste des exercices -->
        <section aria-label="Liste des exercices" class="lg:col-span-3">
          @if (sortedExercises().length > 0) {
            <div class="space-y-3" role="list">
              @for (exercise of sortedExercises(); track exercise.id) {
                <app-exercise-card
                  [exercise]="exercise"
                  (edit)="onEdit($event)"
                  (delete)="onDelete($event)"
                />
              }
            </div>
          } @else {
            <div
              class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center"
            >
              <svg
                class="mb-3 h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <p class="text-sm font-medium text-gray-500">
                Aucun exercice pour le moment
              </p>
              <p class="mt-1 text-xs text-gray-500">
                Ajoutez votre premier exercice ci-contre.
              </p>
            </div>
          }
        </section>

        <!-- Formulaire -->
        <section
          aria-label="Formulaire d'exercice"
          class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2 lg:sticky lg:top-6"
        >
          <h2 class="text-lg font-semibold text-gray-900">
            @if (editingExercise()) {
              <span class="flex items-center gap-2">
                <svg
                  class="h-5 w-5 text-amber-600"
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
              </span>
            } @else {
              <span class="flex items-center gap-2">
                <svg
                  class="h-5 w-5 text-green-600"
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
                Ajouter un exercice
              </span>
            }
          </h2>
          <div class="mt-4">
            <app-exercise-form
              [exercise]="editingExercise()"
              (save)="onSave($event)"
            />
          </div>
        </section>
      </div>
    </main>
  `,
})
export class RoutineComponent {
  private readonly store = inject(ExerciseStore);

  readonly sortedExercises = computed(() => this.store.sortedExercises());

  private readonly editingExerciseSig = signal<Exercise | null>(null);

  readonly editingExercise = this.editingExerciseSig.asReadonly();

  private readonly liveMessageSig = signal('');
  readonly liveMessage = this.liveMessageSig.asReadonly();

  onSave(value: ExerciseFormValue): void {
    const editing = this.editingExerciseSig();
    if (editing) {
      this.store.updateExercise(editing.id, value);
      this.editingExerciseSig.set(null);
      this.liveMessageSig.set(`Exercice « ${value.name} » modifié avec succès.`);
    } else {
      const nextOrder = this.store.exercises().length;
      this.store.addExercise({
        ...value,
        order: nextOrder,
      });
      this.liveMessageSig.set(`Exercice « ${value.name} » ajouté avec succès.`);
    }
  }

  onEdit(exercise: Exercise): void {
    this.editingExerciseSig.set(exercise);
  }

  onDelete(id: string): void {
    const exercise = this.store.exercises().find((e) => e.id === id);
    if (!exercise) {
      return;
    }
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer « ${exercise.name} » ?`,
    );
    if (confirmed) {
      this.store.deleteExercise(id);
      this.liveMessageSig.set(`Exercice « ${exercise.name} » supprimé.`);
    }
  }
}
