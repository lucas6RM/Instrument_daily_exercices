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
    <main class="mx-auto max-w-4xl px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900">Ma routine d'exercices</h1>

      <section aria-label="Liste des exercices" class="mt-6">
        @if (sortedExercises().length > 0) {
          <div class="space-y-4" role="list">
            @for (exercise of sortedExercises(); track exercise.id) {
              <app-exercise-card
                [exercise]="exercise"
                (edit)="onEdit($event)"
                (delete)="onDelete($event)"
              />
            }
          </div>
        } @else {
          <p class="mt-4 text-gray-500">Aucun exercice. Ajoutez-en un ci-dessous.</p>
        }
      </section>

      <section aria-label="Formulaire d'ajout d'exercice" class="mt-8">
        <h2 class="text-xl font-semibold text-gray-900">
          @if (editingExercise()) {
            Modifier l'exercice
          } @else {
            Ajouter un exercice
          }
        </h2>
        <div class="mt-4">
          <app-exercise-form
            [exercise]="editingExercise()"
            (save)="onSave($event)"
          />
        </div>
      </section>
    </main>
  `,
})
export class RoutineComponent {
  private readonly store = inject(ExerciseStore);

  readonly sortedExercises = computed(() => this.store.sortedExercises());

  private readonly editingExerciseSig = signal<Exercise | null>(null);

  readonly editingExercise = this.editingExerciseSig.asReadonly();

  onSave(value: ExerciseFormValue): void {
    const editing = this.editingExerciseSig();
    if (editing) {
      this.store.updateExercise(editing.id, value);
      this.editingExerciseSig.set(null);
    } else {
      const nextOrder = this.store.exercises().length;
      this.store.addExercise({
        ...value,
        order: nextOrder,
      });
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
    }
  }
}
