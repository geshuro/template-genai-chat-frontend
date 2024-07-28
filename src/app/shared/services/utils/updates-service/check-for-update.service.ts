import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

/**
 * Checking for updates
 * https://angular.io/guide/service-worker-communications#checking-for-updates
 */
@Injectable({
  providedIn: 'root',
})
export class CheckForUpdateService {
  constructor(applicationRef: ApplicationRef, swUpdate: SwUpdate) {
    if (!swUpdate.isEnabled) return;

    // Allow the app to stabilize first, before starting
    // polling for updates with `interval()`.
    const appIsStable$ = applicationRef.isStable.pipe(
      first(isStable => isStable)
    );

    // const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const interval$ = interval(10 * 60 * 1000); //m * s * ms

    // const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
    const intervalAfterStable$ = concat(appIsStable$, interval$);

    intervalAfterStable$.subscribe(async () => {
      try {
        const updateFound = await swUpdate.checkForUpdate();
        console.log(
          updateFound
            ? 'A new version is available.'
            : 'Already on the latest version.'
        );
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }
}
