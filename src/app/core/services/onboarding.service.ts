import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { STORAGE_KEYS } from './storage-keys';
import { StorageService } from './storage.service';

export interface OnboardingSlide {
  title: string;
  description: string;
  iconName: string;
  screenshotUrl: string;
  screenshotAlt: string;
}

export const SLIDES: readonly OnboardingSlide[] = [
  {
    title: 'Bienvenue',
    description:
      'Organisez et suivez votre pratique musicale quotidienne en quelques clics. Voici comment ça marche.',
    iconName: 'lucideMusic',
    screenshotUrl: 'onboarding-bienvenue-step1.jpg',
    screenshotAlt: "Vue d'ensemble de l'application",
  },
  {
    title: 'Configurez votre routine',
    description:
      'Définissez vos exercices avec nom, durée, lien YouTube (pour votre backing track par exemple) et description.',
    iconName: 'lucideListTodo',
    screenshotUrl: 'onboarding-routine-step2.jpg',
    screenshotAlt: 'Page de configuration de la routine',
  },
  {
    title: 'Jouez vos exercices',
    description: 'Chaque jour, accédez à votre séance pour jouer vos exercices avec un timer.',
    iconName: 'lucidePlay',
    screenshotUrl: 'onboarding-session-step3.jpg',
    screenshotAlt: 'Page de séance du jour',
  },
  {
    title: 'Suivez votre progression',
    description: 'Consultez votre historique hebdomadaire avec le résumé de vos temps de pratique.',
    iconName: 'lucideBarChart3',
    screenshotUrl: 'onboarding-history-step4.jpg',
    screenshotAlt: "Page d'historique et de progression hebdomadaire",
  },
  {
    title: 'Rattrapez les jours manqués',
    description:
      "Vous avez raté un jour ? Rattrapez vos exercices en retard directement depuis l'historique.",
    iconName: 'lucideRotateCcw',
    screenshotUrl: 'onboarding-rattrapage-step5.jpg',
    screenshotAlt: "Modal de rattrapage d'un exercice manqué",
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
