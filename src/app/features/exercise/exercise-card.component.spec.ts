import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciseCardComponent } from './exercise-card.component';
import { Exercise } from '../../core/models/exercise';

describe('ExerciseCardComponent', () => {
  let component: ExerciseCardComponent;
  let fixture: ComponentFixture<ExerciseCardComponent>;

  const mockExercise: Exercise = {
    id: 'test-id',
    name: 'Chromatic Scales',
    durationMinutes: 10,
    youtubeUrl: 'https://www.youtube.com/watch?v=abc123',
    description: 'Practice chromatic scales on all strings.',
    order: 1,
  };

  const mockExerciseMinimal: Exercise = {
    id: 'minimal-id',
    name: 'Simple Exercise',
    durationMinutes: 5,
    order: 2,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(ExerciseCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('exercise', mockExercise);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('display', () => {
    it('should display the exercise name', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.querySelector('h3')?.textContent?.trim()).toBe('Chromatic Scales');
    });

    it('should display the duration', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const durationParagraphs = nativeElement.querySelectorAll('p');
      const durationText = Array.from(durationParagraphs).find(
        (p) => p.textContent?.includes('Durée'),
      );
      expect(durationText?.textContent?.trim()).toBe('Durée : 10 min');
    });

    it('should display the YouTube link when youtubeUrl is provided', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const link = nativeElement.querySelector('a') as HTMLAnchorElement | null;
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://www.youtube.com/watch?v=abc123');
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link?.textContent?.trim()).toBe('Voir la vidéo YouTube');
    });

    it('should not display the YouTube link when youtubeUrl is not provided', () => {
      fixture.componentRef.setInput('exercise', mockExerciseMinimal);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const link = nativeElement.querySelector('a') as HTMLAnchorElement | null;
      expect(link).toBeNull();
    });

    it('should display the description when provided', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Practice chromatic scales on all strings.');
    });

    it('should not display description when not provided', () => {
      fixture.componentRef.setInput('exercise', mockExerciseMinimal);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).not.toContain('description');
    });
  });

  describe('edit button', () => {
    it('should emit edit with the exercise when edit button is clicked', async () => {
      let emittedExercise: Exercise | undefined;
      component.edit.subscribe((ex) => {
        emittedExercise = ex;
      });

      const nativeElement = fixture.nativeElement as HTMLElement;
      const editButton = nativeElement.querySelector('[aria-label="Modifier Chromatic Scales"]') as HTMLElement | null;
      expect(editButton).toBeTruthy();
      editButton?.click();
      fixture.detectChanges();

      expect(emittedExercise).toEqual(mockExercise);
    });
  });

  describe('delete button', () => {
    it('should emit delete with the exercise id when delete button is clicked', async () => {
      let emittedId: string | undefined;
      component.delete.subscribe((id) => {
        emittedId = id;
      });

      const nativeElement = fixture.nativeElement as HTMLElement;
      const deleteButton = nativeElement.querySelector('[aria-label="Supprimer Chromatic Scales"]') as HTMLElement | null;
      expect(deleteButton).toBeTruthy();
      deleteButton?.click();
      fixture.detectChanges();

      expect(emittedId).toBe('test-id');
    });
  });

  describe('accessibility', () => {
    it('should have an article element with role listitem', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const article = nativeElement.querySelector('article') as HTMLElement | null;
      expect(article).toBeTruthy();
      expect(article?.getAttribute('role')).toBe('listitem');
    });

    it('should have aria-label on edit button', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const editButton = nativeElement.querySelector('[aria-label="Modifier Chromatic Scales"]') as HTMLElement | null;
      expect(editButton).toBeTruthy();
    });

    it('should have aria-label on delete button', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const deleteButton = nativeElement.querySelector('[aria-label="Supprimer Chromatic Scales"]') as HTMLElement | null;
      expect(deleteButton).toBeTruthy();
    });

    it('should have focus-visible styles on interactive elements', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const buttons = nativeElement.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect((btn as HTMLElement).classList.contains('focus-visible:outline')).toBe(true);
      });
    });
  });
});
