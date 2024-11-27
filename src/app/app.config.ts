import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { loggingInterceptor } from '../interceptor';

// https://stackoverflow.com/questions/75690545/nullinjectorerror-root-standalone-component-does-not-import-httpclientmodule-p
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimations(), provideHttpClient(withInterceptors([loggingInterceptor]))]
};
