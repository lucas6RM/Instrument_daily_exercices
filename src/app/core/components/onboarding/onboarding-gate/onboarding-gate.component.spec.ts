import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBarChart3,
  lucideListTodo,
  lucideMusic,
  lucidePlay,
  lucideRotateCcw,
} from '@ng-icons/lucide';
import { vi } from 'vitest';

import { OnboardingService } from '../../../services/onboarding.service';
import { StorageService } from '../../../services/storage.service';
import { OnboardingGateComponent } from './onboarding-gate.component';

@Component({
  selector: 'app-test-host',
  imports: [OnboardingGateComponent],
  template: `<app-onboarding-gate />`,
})
class TestHostComponent {}

describe('OnboardingGateComponent', () => {
  let router: Router;

  const configureTestingModule = (isCompleted = false) => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        OnboardingService,
        provideRouter([]),
        provideIcons({
          lucideMusic,
          lucideListTodo,
          lucidePlay,
          lucideBarChart3,
          lucideRotateCcw,
        }),
        {
          provide: StorageService,
          useValue: {
            get: () => isCompleted,
            set: () => { /* no-op */ },
          },
        },
      ],
    });
  };

  it('should create', () => {
    configureTestingModule();
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show router-outlet when onboarding is completed', () => {
    configureTestingModule(true);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();

    const modal = fixture.nativeElement.querySelector('app-onboarding-modal');
    expect(modal).toBeNull();
  });

  it('should show onboarding-modal when onboarding is not completed', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeNull();

    const modal = fixture.nativeElement.querySelector('app-onboarding-modal');
    expect(modal).toBeTruthy();
  });

  it('should show focus trap when onboarding is not completed', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const focusTrap = fixture.nativeElement.querySelector('[cdkTrapFocus]');
    expect(focusTrap).toBeTruthy();
  });

  it('should increment slide on next when not on last slide', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    expect(gateComponent.currentSlide()).toBe(0);

    gateComponent.onNext();
    expect(gateComponent.currentSlide()).toBe(1);

    gateComponent.onNext();
    expect(gateComponent.currentSlide()).toBe(2);
  });

  it('should complete onboarding and navigate to /routine on next from last slide', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    router = TestBed.inject(Router);
    const onboardingService = TestBed.inject(OnboardingService);

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    // Go to last slide
    gateComponent.currentSlide.set(4);

    vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    gateComponent.onNext();

    expect(onboardingService.isCompleted()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/routine']);
  });

  it('should decrement slide on prev', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    gateComponent.currentSlide.set(2);
    gateComponent.onPrev();
    expect(gateComponent.currentSlide()).toBe(1);
  });

  it('should not go below 0 on prev', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    gateComponent.currentSlide.set(0);
    gateComponent.onPrev();
    expect(gateComponent.currentSlide()).toBe(0);
  });

  it('should complete onboarding and navigate to / on skip', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    router = TestBed.inject(Router);
    const onboardingService = TestBed.inject(OnboardingService);

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    gateComponent.onSkip();

    expect(onboardingService.isCompleted()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to next slide on ArrowRight', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    gateComponent.currentSlide.set(0);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    gateComponent.onKeyDown(event);

    expect(gateComponent.currentSlide()).toBe(1);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should navigate to previous slide on ArrowLeft', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    gateComponent.currentSlide.set(2);

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    gateComponent.onKeyDown(event);

    expect(gateComponent.currentSlide()).toBe(1);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should skip on Escape', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    router = TestBed.inject(Router);
    const onboardingService = TestBed.inject(OnboardingService);

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    gateComponent.onKeyDown(event);

    expect(onboardingService.isCompleted()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not go below 0 on ArrowLeft', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    gateComponent.currentSlide.set(0);

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

    gateComponent.onKeyDown(event);

    expect(gateComponent.currentSlide()).toBe(0);
  });

  it('should not go above max slide on ArrowRight', () => {
    configureTestingModule(false);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    gateComponent.currentSlide.set(4);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

    gateComponent.onKeyDown(event);

    expect(gateComponent.currentSlide()).toBe(4);
  });

  it('should not respond to keyboard when onboarding is completed', () => {
    configureTestingModule(true);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const gateComponent = fixture.debugElement.query(
      (el) => el.componentInstance instanceof OnboardingGateComponent
    ).componentInstance as OnboardingGateComponent;

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

    gateComponent.onKeyDown(event);

    expect(gateComponent.currentSlide()).toBe(0);
  });
});
