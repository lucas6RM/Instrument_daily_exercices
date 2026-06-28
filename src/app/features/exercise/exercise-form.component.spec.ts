import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciseFormComponent } from './exercise-form.component';
import { Exercise } from '../../core/models/exercise';

describe('ExerciseFormComponent', () => {
  let component: ExerciseFormComponent;
  let fixture: ComponentFixture<ExerciseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(ExerciseFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should have name as required', async () => {
      await fixture.whenStable();
      expect(component.form.get('name')?.valid).toBe(false);
    });

    it('should mark name as valid when filled', async () => {
      await fixture.whenStable();
      component.form.get('name')?.setValue('Test Exercise');
      expect(component.form.get('name')?.valid).toBe(true);
    });

    it('should require durationMinutes', async () => {
      await fixture.whenStable();
      component.form.get('durationMinutes')?.setValue(0);
      expect(component.form.get('durationMinutes')?.valid).toBe(false);
    });

    it('should reject negative durationMinutes', async () => {
      await fixture.whenStable();
      component.form.get('durationMinutes')?.setValue(-5);
      expect(component.form.get('durationMinutes')?.valid).toBe(false);
      expect(component.form.get('durationMinutes')?.errors?.['positive']).toBe(true);
    });

    it('should accept positive durationMinutes', async () => {
      await fixture.whenStable();
      component.form.get('durationMinutes')?.setValue(10);
      expect(component.form.get('durationMinutes')?.valid).toBe(true);
    });

    it('should be invalid when required fields are empty', async () => {
      await fixture.whenStable();
      expect(component.form.valid).toBe(false);
    });

    it('should be valid when all required fields are filled', async () => {
      await fixture.whenStable();
      component.form.patchValue({
        name: 'Test Exercise',
        durationMinutes: 10,
      });
      expect(component.form.valid).toBe(true);
    });
  });

  describe('exercise input (edit mode)', () => {
    const mockExercise: Exercise = {
      id: 'test-id',
      name: 'Edit Exercise',
      durationMinutes: 15,
      youtubeUrl: 'https://youtube.com/watch?v=test',
      description: 'Test description',
      order: 1,
    };

    it('should pre-fill the form when exercise input is provided', async () => {
      fixture.componentRef.setInput('exercise', mockExercise);
      await fixture.whenStable();

      expect(component.form.get('name')?.value).toBe('Edit Exercise');
      expect(component.form.get('durationMinutes')?.value).toBe(15);
      expect(component.form.get('youtubeUrl')?.value).toBe('https://youtube.com/watch?v=test');
      expect(component.form.get('description')?.value).toBe('Test description');
    });

    it('should reset the form when exercise input is cleared', async () => {
      fixture.componentRef.setInput('exercise', mockExercise);
      await fixture.whenStable();

      fixture.componentRef.setInput('exercise', null);
      await fixture.whenStable();

      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('durationMinutes')?.value).toBe(0);
      expect(component.form.get('youtubeUrl')?.value).toBe('');
      expect(component.form.get('description')?.value).toBe('');
    });
  });

  describe('submit', () => {
    it('should emit save with form value when valid', async () => {
      await fixture.whenStable();

      const emittedValue = new Promise((resolve) => {
        component.save.subscribe(resolve);
      });

      component.form.patchValue({
        name: 'New Exercise',
        durationMinutes: 5,
        youtubeUrl: 'https://youtube.com/watch?v=abc',
        description: 'A new exercise',
      });

      component.onSubmit();

      const value = await emittedValue;
      expect(value).toEqual({
        name: 'New Exercise',
        durationMinutes: 5,
        youtubeUrl: 'https://youtube.com/watch?v=abc',
        description: 'A new exercise',
      });
    });

    it('should not emit save when form is invalid', async () => {
      await fixture.whenStable();

      let emitted = false;
      component.save.subscribe(() => {
        emitted = true;
      });

      component.onSubmit();

      expect(emitted).toBe(false);
    });
  });
});
