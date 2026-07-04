import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlay, lucideX } from '@ng-icons/lucide';

import { CatchUpModalComponent } from './catch-up-modal.component';
import { ProgressService } from '../../progress/progress.service';
import { Exercise } from '../../../core/models';

// Mock child component with proper inputs
@Component({
  selector: 'app-exercise-time-display',
  template: '<span mock-time-display></span>',
  standalone: true,
})
class MockExerciseTimeDisplayComponent {
  readonly actualMinutes = input<number>(0);
  readonly bonusMinutes = input<number>(0);
  readonly completed = input<boolean>(false);
  readonly playCount = input<number>(1);
}

describe('CatchUpModalComponent', () => {
  let progressService: ProgressService;

  const testExercises: Exercise[] = [
    { id: 'e1', name: 'Chromatique', durationMinutes: 30, order: 1 },
    { id: 'e2', name: 'Gammes', durationMinutes: 60, order: 2 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CatchUpModalComponent],
      providers: [
        {
          provide: ProgressService,
          useValue: {
            getOrCreateSession: vi.fn(() => ({ date: '', exercises: [] })),
            addSession: vi.fn(),
            dailySessions: vi.fn(() => []),
          },
        },
      ],
    });

    TestBed.overrideComponent(CatchUpModalComponent, {
      set: {
        imports: [
          MockExerciseTimeDisplayComponent,
          HlmButton,
          HlmCheckbox,
          NgIcon,
        ],
        providers: [provideIcons({ lucidePlay, lucideX })],
      },
    });

    progressService = TestBed.inject(ProgressService);
  });

  function createFixture(date = '2025-01-06', exercises: Exercise[] = testExercises) {
    const fixture = TestBed.createComponent(CatchUpModalComponent);
    fixture.componentRef.setInput('date', date);
    fixture.componentRef.setInput('exercises', exercises);
    return fixture;
  }

  /* ------------------------------------------------------------------ */
  /* Ouverture du modal (initialisation avec la bonne session)           */
  /* ------------------------------------------------------------------ */

  describe('ouverture du modal', () => {
    it('should call getOrCreateSession with the correct date on init', async () => {
      const session = { date: '2025-01-06', exercises: [] };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = createFixture();
      await fixture.whenStable();

      expect(progressService.getOrCreateSession).toHaveBeenCalledWith('2025-01-06');
    });

    it('should initialize localSession from the returned session', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 30, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      const catchUpExercises = component.catchUpExercises();
      expect(catchUpExercises).toHaveLength(2); // e1 (completed) + e2 (incomplete)
      expect(catchUpExercises[0].status).toBe('completed');
      expect(catchUpExercises[0].actualMinutes).toBe(30);
    });

    it('should re-initialize when date input changes', async () => {
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue({
        date: '',
        exercises: [],
      });

      const fixture = createFixture();
      await fixture.whenStable();

      expect(progressService.getOrCreateSession).toHaveBeenCalledWith('2025-01-06');

      fixture.componentRef.setInput('date', '2025-01-07');
      await fixture.whenStable();

      expect(progressService.getOrCreateSession).toHaveBeenCalledWith('2025-01-07');
    });
  });

  /* ------------------------------------------------------------------ */
  /* Fermeture du modal                                                  */
  /* ------------------------------------------------------------------ */

  describe('fermeture du modal', () => {
    it('should emit closed when closeModal() is called', async () => {
      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      let closedEmitted = false;
      component.closed.subscribe(() => {
        closedEmitted = true;
      });

      component.closeModal();
      expect(closedEmitted).toBe(true);
    });

    it('should have a close button with aria-label', async () => {
      const fixture = createFixture();
      await fixture.whenStable();

      const closeBtn = fixture.nativeElement.querySelector('[aria-label="Fermer le modal"]');
      expect(closeBtn).not.toBeNull();
    });

    it('should have the Fermer button in the footer', async () => {
      const fixture = createFixture();
      await fixture.whenStable();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      const fermerBtn = Array.from(buttons).find((b) => (b as HTMLElement).textContent?.includes('Fermer'));
      expect(fermerBtn).not.toBeUndefined();
    });
  });

  /* ------------------------------------------------------------------ */
  /* Émission de playExercise                                            */
  /* ------------------------------------------------------------------ */

  describe('playExercise output', () => {
    it('should emit playExercise with correct data when clicking play', async () => {
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue({
        date: '2025-01-06',
        exercises: [],
      });

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      let emitted = false;
      component.playExercise.subscribe((event) => {
        emitted = true;
        expect(event.exerciseId).toBe('e1');
        expect(event.name).toBe('Chromatique');
        expect(event.durationMinutes).toBe(30);
      });

      component.onPlay('e1');
      expect(emitted).toBe(true);
    });

    it('should emit closed when playing an exercise', async () => {
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue({
        date: '2025-01-06',
        exercises: [],
      });

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      let closedEmitted = false;
      component.closed.subscribe(() => {
        closedEmitted = true;
      });

      component.onPlay('e1');
      expect(closedEmitted).toBe(true);
    });

    it('should not emit playExercise for removed exercise', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e_removed', exerciseName: 'Ancien', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = TestBed.createComponent(CatchUpModalComponent);
      fixture.componentRef.setInput('date', '2025-01-06');
      fixture.componentRef.setInput('exercises', []);
      await fixture.whenStable();
      const component = fixture.componentInstance;

      let emitted = false;
      component.playExercise.subscribe(() => {
        emitted = true;
      });

      component.onPlay('e_removed');
      expect(emitted).toBe(false);
    });

    it('should not emit playExercise for non-existent exercise', async () => {
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue({
        date: '2025-01-06',
        exercises: [],
      });

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      let emitted = false;
      component.playExercise.subscribe(() => {
        emitted = true;
      });

      component.onPlay('non-existent');
      expect(emitted).toBe(false);
    });

    it('should not emit closed for non-existent exercise', async () => {
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue({
        date: '2025-01-06',
        exercises: [],
      });

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      let closedEmitted = false;
      component.closed.subscribe(() => {
        closedEmitted = true;
      });

      component.onPlay('non-existent');
      expect(closedEmitted).toBe(false);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Affichage des exercices supprimés                                   */
  /* ------------------------------------------------------------------ */

  describe('exercices supprimés', () => {
    it('should display exercises from session that are no longer in routine', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', exerciseName: 'Chromatique', completed: true, actualMinutes: 30, bonusMinutes: 0 },
          { exerciseId: 'e_removed', exerciseName: 'Ancien Exercice', completed: true, actualMinutes: 20, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      const exercises = component.catchUpExercises();
      const removed = exercises.find((e) => e.exerciseId === 'e_removed');
      expect(removed).not.toBeUndefined();
      expect(removed!.status).toBe('removed');
      expect(removed!.name).toBe('Ancien Exercice');
    });

    it('should use fallback name when exerciseName is missing', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e_removed', completed: true, actualMinutes: 20, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      const exercises = component.catchUpExercises();
      const removed = exercises.find((e) => e.exerciseId === 'e_removed');
      expect(removed!.name).toBe('(nom inconnu)');
    });

    it('should show "(supprimé)" text in the template for removed exercises', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e_removed', exerciseName: 'Ancien', completed: true, actualMinutes: 20, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = TestBed.createComponent(CatchUpModalComponent);
      fixture.componentRef.setInput('date', '2025-01-06');
      fixture.componentRef.setInput('exercises', []);
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('(supprimé)');
    });

    it('should NOT render a play button for removed exercises', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e_removed', exerciseName: 'Ancien', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = TestBed.createComponent(CatchUpModalComponent);
      fixture.componentRef.setInput('date', '2025-01-06');
      fixture.componentRef.setInput('exercises', []);
      await fixture.whenStable();

      const listItems = fixture.nativeElement.querySelectorAll('[role="listitem"]');
      expect(listItems.length).toBe(1);
      const playButtons = listItems[0].querySelectorAll('button[aria-label*="Lancer"]');
      expect(playButtons.length).toBe(0);
    });

    it('should render removed exercises with reduced opacity (grisé)', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e_removed', exerciseName: 'Ancien', completed: true, actualMinutes: 20, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = TestBed.createComponent(CatchUpModalComponent);
      fixture.componentRef.setInput('date', '2025-01-06');
      fixture.componentRef.setInput('exercises', []);
      await fixture.whenStable();

      const listItems = fixture.nativeElement.querySelectorAll('[role="listitem"]');
      expect(listItems[0].classList.contains('opacity-60')).toBe(true);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Accessibilité (aria attributes)                                     */
  /* ------------------------------------------------------------------ */

  describe('accessibilité', () => {
    it('should have the title element with the correct id', async () => {
      const fixture = createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('#catch-up-modal-title');
      expect(titleElement).not.toBeNull();
      expect(titleElement?.textContent).toContain('Rattrapage');
    });

    it('should have aria-label on the close button', async () => {
      const fixture = createFixture();
      await fixture.whenStable();

      const closeBtn = fixture.nativeElement.querySelector('[aria-label="Fermer le modal"]');
      expect(closeBtn).not.toBeNull();
    });

    it('should have role="list" on the exercise list container', async () => {
      const fixture = createFixture();
      await fixture.whenStable();

      const list = fixture.nativeElement.querySelector('[role="list"]');
      expect(list).not.toBeNull();
    });

    it('should have role="listitem" on each exercise item', async () => {
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue({
        date: '2025-01-06',
        exercises: [],
      });

      const fixture = createFixture();
      await fixture.whenStable();

      const items = fixture.nativeElement.querySelectorAll('[role="listitem"]');
      expect(items.length).toBe(2);
    });

    it('should have checkboxes with role="checkbox"', async () => {
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue({
        date: '2025-01-06',
        exercises: [],
      });

      const fixture = createFixture();
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const checkboxButtons = fixture.nativeElement.querySelectorAll('button[role="checkbox"]') as NodeListOf<HTMLElement>;
      expect(checkboxButtons.length).toBeGreaterThan(0);
    });

    it('should have aria-label on play buttons', async () => {
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue({
        date: '2025-01-06',
        exercises: [],
      });

      const fixture = createFixture();
      await fixture.whenStable();

      const playButtons = fixture.nativeElement.querySelectorAll('button[aria-label*="Lancer le timer"]');
      expect(playButtons.length).toBe(2);
    });
  });

  /* ------------------------------------------------------------------ */
  /* catchUpExercises computed                                           */
  /* ------------------------------------------------------------------ */

  describe('catchUpExercises computed', () => {
    it('should map routine exercises with session status', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 30, bonusMinutes: 0 },
          { exerciseId: 'e2', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      const exercises = component.catchUpExercises();
      expect(exercises[0].exerciseId).toBe('e1');
      expect(exercises[0].name).toBe('Chromatique');
      expect(exercises[0].status).toBe('completed');
      expect(exercises[0].completed).toBe(true);
      expect(exercises[1].exerciseId).toBe('e2');
      expect(exercises[1].status).toBe('incomplete');
      expect(exercises[1].completed).toBe(false);
    });

    it('should default to incomplete when exercise not in session', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      const exercises = component.catchUpExercises();
      expect(exercises[0].status).toBe('incomplete');
      expect(exercises[0].completed).toBe(false);
      expect(exercises[0].actualMinutes).toBe(0);
      expect(exercises[0].bonusMinutes).toBe(0);
    });

    it('should compute playCount correctly for completed exercises', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: true, actualMinutes: 30, bonusMinutes: 60 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      const exercises = component.catchUpExercises();
      expect(exercises[0].playCount).toBe(3);
    });

    it('should compute playCount as 0 for incomplete exercises', async () => {
      const session = {
        date: '2025-01-06',
        exercises: [
          { exerciseId: 'e1', completed: false, actualMinutes: 0, bonusMinutes: 0 },
        ],
      };
      (progressService.getOrCreateSession as ReturnType<typeof vi.fn>).mockReturnValue(session);

      const fixture = createFixture();
      await fixture.whenStable();
      const component = fixture.componentInstance;

      const exercises = component.catchUpExercises();
      expect(exercises[0].playCount).toBe(0);
    });
  });
});
