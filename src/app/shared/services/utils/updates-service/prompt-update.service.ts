import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { filter, Observable, switchMap } from 'rxjs';

/**
 * Updating to the latest version
 * https://angular.io/guide/service-worker-communications#updating-to-the-latest-version
 */
@Injectable({
  providedIn: 'root',
})
export class PromptUpdateService {
  constructor(
    swUpdate: SwUpdate,
    private matSnackBar: MatSnackBar,
    private router: Router
  ) {
    if (!swUpdate.isEnabled) return;

    swUpdate.versionUpdates
      .pipe(
        filter(event => event.type === 'VERSION_READY'),
        switchMap(() => this.promptUser())
      )
      .subscribe(() => this.reloadApplication());
  }

  private promptUser(): Observable<MatSnackBarDismiss> {
    return this.matSnackBar
      .open('💡 A new version is available, click OK to refresh.', 'OK', {
        verticalPosition: 'top',
      })
      .afterDismissed();
  }
  private reloadApplication(): void {
    this.router.navigate(['/']).then(() => {
      document.location.reload();
    });
  }
}
