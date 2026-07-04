import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { STORAGE_KEYS } from './storage-keys';
import { OnboardingService, SLIDES, type OnboardingSlide } from './onboarding.service';
import { StorageService } from './storage.service';

describe('OnboardingService', () => {
  let service: OnboardingService;

  const mockStorageService = (getFn: (key: string) => unknown) => ({
    get: getFn,
    set: vi.fn(),
  });

  describe('isCompleted()', () => {
    it('should return false by default when localStorage is empty', () => {
      TestBed.configureTestingModule({
        providers: [
          OnboardingService,
          { provide: StorageService, useValue: mockStorageService(() => null) },
        ],
      });

      service = TestBed.inject(OnboardingService);

      expect(service.isCompleted()).toBe(false);
    });

    it('should return true after complete()', () => {
      const setSpy = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          OnboardingService,
          {
            provide: StorageService,
            useValue: {
              get: () => null,
              set: setSpy,
            },
          },
        ],
      });

      service = TestBed.inject(OnboardingService);

      expect(service.isCompleted()).toBe(false);

      service.complete();

      expect(service.isCompleted()).toBe(true);
      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    });
  });

  describe('slides', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          OnboardingService,
          { provide: StorageService, useValue: mockStorageService(() => null) },
        ],
      });

      service = TestBed.inject(OnboardingService);
    });

    it('should contain exactly 4 slides', () => {
      expect(service.slides.length).toBe(4);
    });

    it('should have the correct slide 0 (Bienvenue)', () => {
      const slide: OnboardingSlide = service.slides[0];
      expect(slide.title).toBe('Bienvenue');
      expect(slide.description).toBe(
        'Organisez votre pratique musicale quotidienne en quelques clics. Voici comment ça marche.',
      );
      expect(slide.iconName).toBe('lucideMusic');
    });

    it('should have the correct slide 1 (Configurez votre routine)', () => {
      const slide: OnboardingSlide = service.slides[1];
      expect(slide.title).toBe('Configurez votre routine');
      expect(slide.description).toBe(
        'Définissez vos exercices avec nom, durée et un lien YouTube pour votre backing track.',
      );
      expect(slide.iconName).toBe('lucideListTodo');
    });

    it('should have the correct slide 2 (Jouez vos exercices)', () => {
      const slide: OnboardingSlide = service.slides[2];
      expect(slide.title).toBe('Jouez vos exercices');
      expect(slide.description).toBe(
        'Chaque jour, accédez à votre séance pour timer et cocher vos exercices au fur et à mesure.',
      );
      expect(slide.iconName).toBe('lucidePlay');
    });

    it('should have the correct slide 3 (Suivez votre progression)', () => {
      const slide: OnboardingSlide = service.slides[3];
      expect(slide.title).toBe('Suivez votre progression');
      expect(slide.description).toBe(
        'Consultez votre historique hebdomadaire et rattrapez les jours manqués.',
      );
      expect(slide.iconName).toBe('lucideBarChart3');
    });
  });

  describe('complete()', () => {
    it('should call storage.set with the correct key and value', () => {
      const setSpy = vi.fn();
      TestBed.configureTestingModule({
        providers: [
          OnboardingService,
          {
            provide: StorageService,
            useValue: {
              get: () => null,
              set: setSpy,
            },
          },
        ],
      });

      service = TestBed.inject(OnboardingService);

      service.complete();

      expect(setSpy).toHaveBeenCalledWith(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    });

    it('should update the isCompleted signal synchronously', () => {
      TestBed.configureTestingModule({
        providers: [
          OnboardingService,
          {
            provide: StorageService,
            useValue: {
              get: () => null,
              set: vi.fn(),
            },
          },
        ],
      });

      service = TestBed.inject(OnboardingService);

      expect(service.isCompleted()).toBe(false);

      service.complete();

      expect(service.isCompleted()).toBe(true);
    });
  });

  describe('SLIDES constant', () => {
    it('should be the exported SLIDES array', () => {
      TestBed.configureTestingModule({
        providers: [
          OnboardingService,
          { provide: StorageService, useValue: mockStorageService(() => null) },
        ],
      });

      service = TestBed.inject(OnboardingService);

      expect(service.slides).toBe(SLIDES);
    });
  });
});
