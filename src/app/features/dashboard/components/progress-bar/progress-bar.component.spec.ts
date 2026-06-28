import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('percentage computation', () => {
    it('should return 0% when totalCount is 0', () => {
      fixture.componentRef.setInput('completedCount', 0);
      fixture.componentRef.setInput('totalCount', 0);
      fixture.detectChanges();

      expect(component.percentage()).toBe(0);
    });

    it('should return 0% when completedCount is 0 and totalCount > 0', () => {
      fixture.componentRef.setInput('completedCount', 0);
      fixture.componentRef.setInput('totalCount', 5);
      fixture.detectChanges();

      expect(component.percentage()).toBe(0);
    });

    it('should return 100% when completedCount equals totalCount', () => {
      fixture.componentRef.setInput('completedCount', 5);
      fixture.componentRef.setInput('totalCount', 5);
      fixture.detectChanges();

      expect(component.percentage()).toBe(100);
    });

    it('should return correct percentage for partial completion', () => {
      fixture.componentRef.setInput('completedCount', 3);
      fixture.componentRef.setInput('totalCount', 5);
      fixture.detectChanges();

      expect(component.percentage()).toBe(60);
    });

    it('should round percentage correctly', () => {
      fixture.componentRef.setInput('completedCount', 1);
      fixture.componentRef.setInput('totalCount', 3);
      fixture.detectChanges();

      expect(component.percentage()).toBe(33);
    });
  });

  describe('displayText', () => {
    it('should display "0/0 (0%)" when both counts are 0', () => {
      fixture.componentRef.setInput('completedCount', 0);
      fixture.componentRef.setInput('totalCount', 0);
      fixture.detectChanges();

      expect(component.displayText()).toBe('0/0 (0%)');
    });

    it('should display "3/5 (60%)" for partial completion', () => {
      fixture.componentRef.setInput('completedCount', 3);
      fixture.componentRef.setInput('totalCount', 5);
      fixture.detectChanges();

      expect(component.displayText()).toBe('3/5 (60%)');
    });

    it('should display "5/5 (100%)" for full completion', () => {
      fixture.componentRef.setInput('completedCount', 5);
      fixture.componentRef.setInput('totalCount', 5);
      fixture.detectChanges();

      expect(component.displayText()).toBe('5/5 (100%)');
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('completedCount', 3);
      fixture.componentRef.setInput('totalCount', 5);
      fixture.detectChanges();
    });

    it('should display the progress text in the label', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const label = nativeElement.querySelector('#progress-label');
      expect(label?.textContent?.trim()).toBe('3/5 (60%)');
    });

    it('should render the progress bar wrapper', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('[role="progressbar"]');
      expect(progressBar).toBeTruthy();
    });

    it('should set the correct width on the fill element', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const fill = nativeElement.querySelector('[role="progressbar"] > div') as HTMLElement | null;
      expect(fill).toBeTruthy();
      expect(fill?.style.width).toBe('60%');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('completedCount', 3);
      fixture.componentRef.setInput('totalCount', 5);
      fixture.detectChanges();
    });

    it('should have role="progressbar" on the bar element', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('[role="progressbar"]');
      expect(progressBar).toBeTruthy();
    });

    it('should have aria-valuemin="0"', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('[role="progressbar"]') as HTMLElement | null;
      expect(progressBar?.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should have aria-valuemax set to totalCount', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('[role="progressbar"]') as HTMLElement | null;
      expect(progressBar?.getAttribute('aria-valuemax')).toBe('5');
    });

    it('should have aria-valuenow set to completedCount', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('[role="progressbar"]') as HTMLElement | null;
      expect(progressBar?.getAttribute('aria-valuenow')).toBe('3');
    });

    it('should have aria-valuetext with the display text', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('[role="progressbar"]') as HTMLElement | null;
      expect(progressBar?.getAttribute('aria-valuetext')).toBe('3/5 (60%)');
    });

    it('should have aria-labelledby referencing the progress label', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const progressBar = nativeElement.querySelector('[role="progressbar"]') as HTMLElement | null;
      expect(progressBar?.getAttribute('aria-labelledby')).toBe('progress-label');
    });

    it('should have a region with aria-label for the progress area', () => {
      const nativeElement = fixture.nativeElement as HTMLElement;
      const region = nativeElement.querySelector('[role="region"]');
      expect(region).toBeTruthy();
      expect(region?.getAttribute('aria-label')).toBe('Barre de progression');
    });
  });

  describe('reactivity', () => {
    it('should update percentage when inputs change', () => {
      fixture.componentRef.setInput('completedCount', 1);
      fixture.componentRef.setInput('totalCount', 4);
      fixture.detectChanges();

      expect(component.percentage()).toBe(25);

      fixture.componentRef.setInput('completedCount', 3);
      fixture.detectChanges();

      expect(component.percentage()).toBe(75);
    });

    it('should update aria attributes when inputs change', () => {
      fixture.componentRef.setInput('completedCount', 1);
      fixture.componentRef.setInput('totalCount', 4);
      fixture.detectChanges();

      const nativeElement = fixture.nativeElement as HTMLElement;
      let progressBar = nativeElement.querySelector('[role="progressbar"]') as HTMLElement | null;
      expect(progressBar?.getAttribute('aria-valuenow')).toBe('1');

      fixture.componentRef.setInput('completedCount', 3);
      fixture.detectChanges();

      progressBar = nativeElement.querySelector('[role="progressbar"]') as HTMLElement | null;
      expect(progressBar?.getAttribute('aria-valuenow')).toBe('3');
    });
  });
});
