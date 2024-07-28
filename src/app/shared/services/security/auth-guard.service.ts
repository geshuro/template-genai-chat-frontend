import { Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { SessionService } from '../utils/session.service';

@Injectable()
export class AuthGuardService {
  constructor(
    protected router: Router,
    private sessionService: SessionService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    // No login no cry...
    if (route.url[0].path.indexOf('/secure/') >= 0) {
      if (this.sessionService.getAuthorizationToken() === 'null') {
        this.router.navigate(['/login']);
        return false;
      }
    }

    if (!(await this.sessionService.isLoggedIn())) {
      this.sessionService.logout();
      this.router.navigate(['/login']);
      return false;
    }
    const ret = await this.sessionService.canUserAccessRoute(route.url[0].path);

    if (ret === false) {
      this.router.navigate(['/no-access']);
    }

    return ret;
  }

  async canActivateChild(route: ActivatedRouteSnapshot) {
    return await this.canActivate(route);
  }
}
