import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ExerciseService } from '../exercise/exercise.service';
import { ExerciseCardComponent } from '../exercise/exercise-card.component';
import { ExerciseFormComponent } from '../exercise/exercise-form.component';
import { Exercise } from '../../core/models/exercise';

interface ExerciseFormValue {
  name: string;
  durationSeconds: number;
  youtubeUrl: string;
  description: string;
}

@Component({
  selector: 'app-routine',
  imports: [ExerciseCardComponent, ExerciseFormComponent],
  templateUrl: './routine.component.html',
})
export class RoutineComponent {
  private readonly exerciseService = inject(ExerciseService);

  readonly sortedExercises = computed(() => this.exerciseService.sortedExercises());

  private readonly editingExerciseSig = signal<Exercise | null>(null);

  readonly editingExercise = this.editingExerciseSig.asReadonly();

  private readonly liveMessageSig = signal('');
  readonly liveMessage = this.liveMessageSig.asReadonly();

  onSave(value: ExerciseFormValue): void {
    const editing = this.editingExerciseSig();
    if (editing) {
      this.exerciseService.updateExercise(editing.id, value);
      this.editingExerciseSig.set(null);
      this.liveMessageSig.set(`Exercice « ${value.name} » modifié avec succès.`);
    } else {
      const nextOrder = this.exerciseService.exercises().length;
      this.exerciseService.addExercise({
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
    const exercise = this.exerciseService.exercises().find((e) => e.id === id);
    if (!exercise) {
      return;
    }
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer « ${exercise.name} » ?`,
    );
    if (confirmed) {
      this.exerciseService.deleteExercise(id);
      this.liveMessageSig.set(`Exercice « ${exercise.name} » supprimé.`);
    }
  }
}
