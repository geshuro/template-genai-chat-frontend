import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { SessionService } from '@shared/services/utils/session.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  sessionService = inject(SessionService);

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.
    const authToken = 'Bearer ' + this.sessionService.usr?.token;

    /*
		* The verbose way:
		// Clone the request and replace the original headers with
		// cloned headers, updated with the authorization.
		const authReq = req.clone({
		  headers: req.headers.set('Authorization', authToken)
		});
		*/
    // Clone the request and set the new header in one step.
    const authReq = req.clone({ setHeaders: { Authorization: authToken } });

    // send cloned request with header to the next handler.
    return next.handle(authReq);
  }
}
