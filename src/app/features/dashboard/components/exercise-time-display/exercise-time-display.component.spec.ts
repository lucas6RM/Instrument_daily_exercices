import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ExerciseTimeDisplayComponent } from './exercise-time-display.component';

@Component({
  selector: 'app-test-host',
  imports: [ExerciseTimeDisplayComponent],
  template: `
    <app-exercise-time-display
      [actualMinutes]="actualMinutes"
      [bonusMinutes]="bonusMinutes"
      [completed]="completed"
      [playCount]="playCount"
    />
  `,
})
class TestHostComponent {
  actualMinutes = 0;
  bonusMinutes = 0;
  completed = false;
  playCount = 1;
}

describe('ExerciseTimeDisplayComponent', () => {
  describe('displayText', () => {
    it('should show completed with bonus and playCount when completed and bonusMinutes > 0', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 20;
      host.componentInstance.bonusMinutes = 10;
      host.componentInstance.completed = true;
      host.componentInstance.playCount = 2;
      host.detectChanges();

      const component = host.debugElement.children[0].componentInstance as ExerciseTimeDisplayComponent;
      expect(component.displayText()).toBe('✅ 20min + 10min bonus (2×)');
    });

    it('should show completed without bonus when completed and bonusMinutes === 0', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 30;
      host.componentInstance.bonusMinutes = 0;
      host.componentInstance.completed = true;
      host.componentInstance.playCount = 1;
      host.detectChanges();

      const component = host.debugElement.children[0].componentInstance as ExerciseTimeDisplayComponent;
      expect(component.displayText()).toBe('✅ 30min');
    });

    it('should show pending (⏳) when not completed', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 0;
      host.componentInstance.bonusMinutes = 0;
      host.componentInstance.completed = false;
      host.componentInstance.playCount = 1;
      host.detectChanges();

      const component = host.debugElement.children[0].componentInstance as ExerciseTimeDisplayComponent;
      expect(component.displayText()).toBe('⏳ 0min');
    });

    it('should show pending with actualMinutes when not completed but has time', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 15;
      host.componentInstance.bonusMinutes = 0;
      host.componentInstance.completed = false;
      host.componentInstance.playCount = 1;
      host.detectChanges();

      const component = host.debugElement.children[0].componentInstance as ExerciseTimeDisplayComponent;
      expect(component.displayText()).toBe('⏳ 15min');
    });

    it('should use correct playCount value in display', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 20;
      host.componentInstance.bonusMinutes = 40;
      host.componentInstance.completed = true;
      host.componentInstance.playCount = 3;
      host.detectChanges();

      const component = host.debugElement.children[0].componentInstance as ExerciseTimeDisplayComponent;
      expect(component.displayText()).toBe('✅ 20min + 40min bonus (3×)');
    });

    it('should show completed with bonus when completed and bonusMinutes > 0', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 30;
      host.componentInstance.bonusMinutes = 30;
      host.componentInstance.completed = true;
      host.componentInstance.playCount = 2;
      host.detectChanges();

      const component = host.debugElement.children[0].componentInstance as ExerciseTimeDisplayComponent;
      expect(component.displayText()).toBe('✅ 30min + 30min bonus (2×)');
    });
  });

  describe('template rendering', () => {
    it('should render completed text in the DOM', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 20;
      host.componentInstance.bonusMinutes = 10;
      host.componentInstance.completed = true;
      host.componentInstance.playCount = 2;
      host.detectChanges();

      expect(host.nativeElement.textContent).toContain('✅ 20min + 10min bonus (2×)');
    });

    it('should set aria-label attribute on the span', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 20;
      host.componentInstance.bonusMinutes = 10;
      host.componentInstance.completed = true;
      host.componentInstance.playCount = 2;
      host.detectChanges();

      const span = host.nativeElement.querySelector('span');
      expect(span.getAttribute('aria-label')).toBe('✅ 20min + 10min bonus (2×)');
    });

    it('should render pending text in the DOM', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 0;
      host.componentInstance.bonusMinutes = 0;
      host.componentInstance.completed = false;
      host.componentInstance.playCount = 1;
      host.detectChanges();

      expect(host.nativeElement.textContent).toContain('⏳ 0min');
    });

    it('should render completed without bonus in the DOM', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.componentInstance.actualMinutes = 25;
      host.componentInstance.bonusMinutes = 0;
      host.componentInstance.completed = true;
      host.componentInstance.playCount = 1;
      host.detectChanges();

      expect(host.nativeElement.textContent).toContain('✅ 25min');
    });
  });

  describe('default input values', () => {
    it('should use defaults when no inputs are provided', () => {
      const host = TestBed.createComponent(TestHostComponent);
      host.detectChanges();

      const component = host.debugElement.children[0].componentInstance as ExerciseTimeDisplayComponent;
      expect(component.displayText()).toBe('⏳ 0min');
    });
  });
});
