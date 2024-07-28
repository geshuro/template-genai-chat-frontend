import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

/**
 * Version updates
 * https://angular.io/guide/service-worker-communications#version-updates
 */
@Injectable({
  providedIn: 'root',
})
export class LogUpdateService {
  constructor(swUpdate: SwUpdate) {
    if (!swUpdate.isEnabled) return;

    swUpdate.versionUpdates.subscribe(event => {
      switch (event.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${event.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${event.currentVersion.hash}`);
          console.log(
            `New app version ready for use: ${event.latestVersion.hash}`
          );
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(
            `Failed to install app version '${event.version.hash}': ${event.error}`
          );
          break;
      }
    });
  }
}
