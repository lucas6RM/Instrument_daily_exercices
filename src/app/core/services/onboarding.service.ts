import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_KEYS } from './storage-keys';
import { StorageService } from './storage.service';

export interface OnboardingSlide {
  title: string;
  description: string;
  iconName: string; // nom Lucide
  screenshotAlt: string; // alt text pour le screenshot
}

export const SLIDES: readonly OnboardingSlide[] = [
  {
    title: 'Bienvenue',
    description:
      'Organisez votre pratique musicale quotidienne en quelques clics. Voici comment ça marche.',
    iconName: 'lucideMusic',
    screenshotAlt: 'Vue d\'ensemble de l\'application',
  },
  {
    title: 'Configurez votre routine',
    description:
      'Définissez vos exercices avec nom, durée et un lien YouTube pour votre backing track.',
    iconName: 'lucideListTodo',
    screenshotAlt: 'Page de configuration de la routine',
  },
  {
    title: 'Jouez vos exercices',
    description:
      'Chaque jour, accédez à votre séance pour timer et cocher vos exercices au fur et à mesure.',
    iconName: 'lucidePlay',
    screenshotAlt: 'Page de séance du jour',
  },
  {
    title: 'Suivez votre progression',
    description:
      'Consultez votre historique hebdomadaire et rattrapez les jours manqués.',
    iconName: 'lucideBarChart3',
    screenshotAlt: 'Page d\'historique et progression',
  },
] as const;

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly _storage = inject(StorageService);

  private readonly _isCompleted = signal<boolean>(false);

  readonly isCompleted = computed(() => this._isCompleted());

  readonly slides = SLIDES;

  private readonly _init = effect(() => {
    const stored = this._storage.get<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    this._isCompleted.set(!!stored);
  });

  complete(): void {
    this._storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    this._isCompleted.set(true);
  }
}
