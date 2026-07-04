import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { lucideBarChart3, lucideListTodo, lucideMusic, lucidePlay } from '@ng-icons/lucide';

import { OnboardingService } from '../../../services/onboarding.service';
import { StorageService } from '../../../services/storage.service';
import { OnboardingModalComponent } from './onboarding-modal.component';

@Component({
  selector: 'app-test-host',
  imports: [OnboardingModalComponent],
  template: `
    <app-onboarding-modal
      [currentSlide]="currentSlide()"
      (next)="onNext()"
      (prev)="onPrev()"
      (skip)="onSkip()"
    />
  `,
})
class TestHostComponent {
  currentSlide = signal(0);
  nextEmitted = false;
  prevEmitted = false;
  skipEmitted = false;

  onNext(): void {
    this.nextEmitted = true;
  }

  onPrev(): void {
    this.prevEmitted = true;
  }

  onSkip(): void {
    this.skipEmitted = true;
  }
}

describe('OnboardingModalComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        OnboardingService,
        StorageService,
        provideIcons({
          lucideMusic,
          lucideListTodo,
          lucidePlay,
          lucideBarChart3,
        }),
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the first slide by default', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const host = fixture.componentInstance;
    expect(host.nextEmitted).toBe(false);
    expect(host.prevEmitted).toBe(false);
    expect(host.skipEmitted).toBe(false);
  });

  it('should emit next when clicking "Suivant" button', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const host = fixture.componentInstance;
    const suivantBtn = fixture.nativeElement.querySelector('button[aria-label="Slide suivante"]');
    suivantBtn.click();
    fixture.detectChanges();

    expect(host.nextEmitted).toBe(true);
  });

  it('should emit skip when clicking "Passer" button', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const host = fixture.componentInstance;
    const skipBtn = fixture.nativeElement.querySelector('button[aria-label="Passer l\'onboarding"]');
    skipBtn.click();
    fixture.detectChanges();

    expect(host.skipEmitted).toBe(true);
  });

  it('should not show "Précédent" button on the first slide', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('button[aria-label="Slide précédente"]');
    expect(prevBtn).toBeNull();
  });

  it('should show "Précédent" button when slide > 0', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.currentSlide.set(1);
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('button[aria-label="Slide précédente"]');
    expect(prevBtn).toBeTruthy();
  });

  it('should emit prev when clicking "Précédent" button', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.currentSlide.set(2);
    fixture.detectChanges();

    const prevBtn = fixture.nativeElement.querySelector('button[aria-label="Slide précédente"]');
    prevBtn.click();
    fixture.detectChanges();

    expect(host.prevEmitted).toBe(true);
  });

  it('should show "Commencer" button on the last slide', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.currentSlide.set(3);
    fixture.detectChanges();

    const commencerBtn = fixture.nativeElement.querySelector('button[aria-label="Commencer"]');
    expect(commencerBtn).toBeTruthy();
  });

  it('should emit next when clicking "Commencer" button', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.currentSlide.set(3);
    fixture.detectChanges();

    const commencerBtn = fixture.nativeElement.querySelector('button[aria-label="Commencer"]');
    commencerBtn.click();
    fixture.detectChanges();

    expect(host.nextEmitted).toBe(true);
  });

  it('should not show "Suivant" button on the last slide', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.currentSlide.set(3);
    fixture.detectChanges();

    const suivantBtn = fixture.nativeElement.querySelector('button[aria-label="Slide suivante"]');
    expect(suivantBtn).toBeNull();
  });

  it('should display correct slide title for each slide', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    const titles = ['Bienvenue', 'Configurez votre routine', 'Jouez vos exercices', 'Suivez votre progression'];

    for (let i = 0; i < titles.length; i++) {
      host.currentSlide.set(i);
      fixture.detectChanges();

      const titleEl = fixture.nativeElement.querySelector('#onboarding-title');
      expect(titleEl.textContent.trim()).toBe(titles[i]);
    }
  });

  it('should display correct pagination for each slide', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;

    for (let i = 0; i < 4; i++) {
      host.currentSlide.set(i);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(`${i + 1} / 4`);
    }
  });

  it('should have role="dialog" and aria-modal="true" on the overlay', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('should have aria-labelledby pointing to the title', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.getAttribute('aria-labelledby')).toBe('onboarding-title');
  });
});
