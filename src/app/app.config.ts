import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBarChart3,
  lucideCalendar,
  lucideCheck,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCircleAlert,
  lucideClock,
  lucidePen,
  lucidePause,
  lucidePlay,
  lucidePlus,
  lucideRotateCcw,
  lucideTrash,
  lucideX,
  lucideYoutube,
} from '@ng-icons/lucide';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIcons({
      // Navigation / Actions
      lucidePlay,
      lucidePause,
      lucideRotateCcw,
      lucideX,
      lucideChevronLeft,
      lucideChevronRight,
      // CRUD
      lucidePlus,
      lucidePen,
      lucideTrash,
      // États
      lucideCheck,
      lucideCircleAlert,
      // Navigation
      lucideCalendar,
      // Media / Data
      lucideYoutube,
      lucideBarChart3,
      lucideClock,
    }),
  ],
};
