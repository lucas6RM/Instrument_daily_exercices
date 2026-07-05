import {
  ApplicationConfig,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
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
  lucideListTodo,
  lucideMusic,
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
import { seedFakeData } from './core/utils/seed-fake-data';

const initApp = (): () => void => () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('seed') === 'fake') {
    seedFakeData();
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: APP_INITIALIZER, useFactory: initApp, multi: true },
    provideIcons({
      lucidePlay,
      lucidePause,
      lucideRotateCcw,
      lucideX,
      lucideChevronLeft,
      lucideChevronRight,
      lucidePlus,
      lucidePen,
      lucideTrash,
      lucideCheck,
      lucideCircleAlert,
      lucideCalendar,
      lucideYoutube,
      lucideBarChart3,
      lucideClock,
      lucideMusic,
      lucideListTodo,
    }),
  ],
};
