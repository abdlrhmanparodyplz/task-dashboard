import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { ConfirmationService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { mockApiInterceptor } from './core/interceptors/mock-api.interceptor';
import { AppTheme } from './core/theme/app-theme';
import { TasksEffects } from './state/tasks';
import { tasksFeature } from './state/tasks/tasks.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([mockApiInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AppTheme,
        options: { darkModeSelector: false },
      },
    }),
    ConfirmationService,
    provideStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideState(tasksFeature),
    provideEffects(TasksEffects),
  ],
};
