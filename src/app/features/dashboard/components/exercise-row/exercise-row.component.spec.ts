import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { ExerciseRowComponent } from './exercise-row.component';
import { Exercise } from '../../../../core/models/exercise';

describe('ExerciseRowComponent', () => {
  let component: ExerciseRowComponent;
  let fixture: ComponentFixture<ExerciseRowComponent>;

  const mockExercise: Exercise = {
    id: 'test-id',
    name: 'Scale Practice',
    durationMinutes: 5,
    youtubeUrl: 'https://www.youtube.com/watch?v=abc123',
    order: 1,
  };

  const mockExerciseNoYoutube: Exercise = {
    id: 'no-yt-id',
    name: 'Metronome Drills',
    durationMinutes: 10,
    order: 2,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(ExerciseRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('exercise', mockExercise);
    fixture.componentRef.setInput('isCompleted', false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('display', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display the exercise name', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('Scale Practice');
    });

    it('should display the duration', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toContain('5 min');
    });

    it('should display the PLAY button', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const playButton = nativeElement.querySelector('button') as HTMLElement | null;
      expect(playButton).toBeTruthy();
      expect(playButton?.textContent).toContain('PLAY');
    });

    it('should display the YouTube link when youtubeUrl is provided', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const link = nativeElement.querySelector('a') as HTMLAnchorElement | null;
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://www.youtube.com/watch?v=abc123');
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should not display the YouTube link when youtubeUrl is not provided', () => {
      fixture.componentRef.setInput('exercise', mockExerciseNoYoutube);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const link = nativeElement.querySelector('a') as HTMLAnchorElement | null;
      expect(link).toBeNull();
    });
  });

  describe('checkbox', () => {
    it('should render an unchecked checkbox when isCompleted is false', () => {
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const checkbox = nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      expect(checkbox).toBeTruthy();
      expect(checkbox?.checked).toBe(false);
    });

    it('should render a checked checkbox when isCompleted is true', () => {
      fixture.componentRef.setInput('isCompleted', true);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const checkbox = nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      expect(checkbox?.checked).toBe(true);
    });

    it('should emit toggleComplete when checkbox changes', () => {
      fixture.detectChanges();

      let emitted = false;
      component.toggleComplete.subscribe(() => {
        emitted = true;
      });

      const nativeElement = fixture.nativeElement as HTMLElement;
      const checkbox = nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      checkbox?.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(emitted).toBe(true);
    });

    it('should apply line-through and gray text when completed', () => {
      fixture.componentRef.setInput('isCompleted', true);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const nameSpan = nativeElement.querySelector('span.line-through') as HTMLElement | null;
      expect(nameSpan).toBeTruthy();
      expect(nameSpan?.classList.contains('text-gray-400')).toBe(true);
    });

    it('should not apply line-through when not completed', () => {
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const nameSpans = nativeElement.querySelectorAll('span.line-through');
      expect(nameSpans.length).toBe(0);
    });
  });

  describe('PLAY button', () => {
    it('should emit playExercise when PLAY button is clicked', () => {
      fixture.detectChanges();

      let emitted = false;
      component.playExercise.subscribe(() => {
        emitted = true;
      });

      const nativeElement = fixture.nativeElement as HTMLElement;
      const playButton = nativeElement.querySelector('button') as HTMLElement | null;
      playButton?.click();
      fixture.detectChanges();

      expect(emitted).toBe(true);
    });

    it('should have correct aria-label on PLAY button', () => {
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      const playButton = nativeElement.querySelector('button') as HTMLElement | null;
      expect(playButton?.getAttribute('aria-label')).toBe('Lancer le timer pour Scale Practice');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have a screen-reader-only label for the checkbox', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const srLabel = nativeElement.querySelector('label.sr-only');
      expect(srLabel).toBeTruthy();
      expect(srLabel?.textContent?.trim()).toBe('Marquer Scale Practice comme terminé');
    });

    it('should have a for attribute on the label matching the checkbox id', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const checkbox = nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      const label = nativeElement.querySelector('label');
      expect(checkbox?.id).toBe('checkbox-test-id');
      expect(label?.getAttribute('for')).toBe('checkbox-test-id');
    });

    it('should have aria-label on the PLAY button', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const playButton = nativeElement.querySelector('button') as HTMLElement | null;
      expect(playButton?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have aria-label on the YouTube link', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const link = nativeElement.querySelector('a') as HTMLAnchorElement | null;
      expect(link?.getAttribute('aria-label')).toBe('Voir la vidéo YouTube pour Scale Practice');
    });

    it('should have focus-visible styles on interactive elements', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const button = nativeElement.querySelector('button') as HTMLElement | null;
      expect(button?.classList.contains('focus-visible:outline')).toBe(true);
    });

    it('should have focus-visible styles on the YouTube link', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const link = nativeElement.querySelector('a') as HTMLElement | null;
      expect(link?.classList.contains('focus-visible:outline')).toBe(true);
    });

    it('should have focus-visible styles on the checkbox', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const checkbox = nativeElement.querySelector('input[type="checkbox"]') as HTMLElement | null;
      expect(checkbox?.classList.contains('focus-visible:outline')).toBe(true);
    });
  });

  describe('reactivity', () => {
    it('should update display when exercise input changes', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Scale Practice');

      fixture.componentRef.setInput('exercise', mockExerciseNoYoutube);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Metronome Drills');
      expect(fixture.nativeElement.textContent).toContain('10 min');
    });

    it('should update checkbox state when isCompleted changes', () => {
      fixture.componentRef.setInput('isCompleted', false);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      let checkbox = nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      expect(checkbox?.checked).toBe(false);

      fixture.componentRef.setInput('isCompleted', true);
      fixture.detectChanges();

      checkbox = nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      expect(checkbox?.checked).toBe(true);
    });

    it('should update PLAY button aria-label when exercise changes', () => {
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      let playButton = nativeElement.querySelector('button') as HTMLElement | null;
      expect(playButton?.getAttribute('aria-label')).toBe('Lancer le timer pour Scale Practice');

      fixture.componentRef.setInput('exercise', mockExerciseNoYoutube);
      fixture.detectChanges();

      playButton = nativeElement.querySelector('button') as HTMLElement | null;
      expect(playButton?.getAttribute('aria-label')).toBe('Lancer le timer pour Metronome Drills');
    });
  });
});
