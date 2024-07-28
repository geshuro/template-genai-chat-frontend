import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

/**
 * Handling an unrecoverable state
 * https://angular.io/guide/service-worker-communications#handling-an-unrecoverable-state
 */
@Injectable({
  providedIn: 'root',
})
export class HandleUnrecoverableStateService {
  constructor(updates: SwUpdate) {
    if (!updates.isEnabled) return;

    updates.unrecoverable.subscribe(event => {
      console.error(
        'An error occurred that we cannot recover from:\n' +
          event.reason +
          '\n\nPlease reload the page.'
      );
    });
  }
}
