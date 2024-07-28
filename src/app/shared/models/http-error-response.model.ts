import { HttpHeaders, HttpResponseBase } from '@angular/common/http';

export declare class HttpErrorResponseBack
  extends HttpResponseBase
  implements Error
{
  readonly name = 'HttpErrorResponse';
  readonly detail: string;
  readonly message: string;
  readonly error: any | null;
  /**
   * Errors are never okay, even when the status code is in the 2xx success range.
   */
  readonly ok = false;
  constructor(init: {
    error?: any;
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
  });
}
