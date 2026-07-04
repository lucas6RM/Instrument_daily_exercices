import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { Exercise } from '../../core/models/exercise';
import { ExerciseCardComponent } from '../exercise/exercise-card.component';
import { ExerciseFormComponent } from '../exercise/exercise-form.component';
import { ExerciseService } from '../exercise/exercise.service';

interface ExerciseFormValue {
  name: string;
  durationMinutes: number;
  youtubeUrl: string;
  description: string;
}

@Component({
  selector: 'app-routine',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ExerciseCardComponent,
    ExerciseFormComponent,
    ...HlmCardImports,
    ...HlmEmptyImports,
    NgIcon,
  ],
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
    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer « ${exercise.name} » ?`);
    if (confirmed) {
      this.exerciseService.deleteExercise(id);
      this.liveMessageSig.set(`Exercice « ${exercise.name} » supprimé.`);
    }
  }
}
