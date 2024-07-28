import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, retry, throwError } from 'rxjs';
import {
  IResponseAnswer,
  IRequestAnswer,
  IRequestImage,
  IResponseImage,
  IRequestCommand,
  IRequestVision,
} from '@shared/models/api-answer.model';
import { environment } from 'src/environments/environment';
import {
  IRequestFeedback,
  IResponseFeedback,
} from '@shared/models/api-feedback.model';
import {
  IRequestIssueReport,
  IResponseIssueReport,
} from '@shared/models/api-issues-report.model';
import {
  IModelsResponse,
  IResponseFiles,
} from '@shared/models/chat-interaction.model';
import { SessionService } from '../utils/session.service';
import { Constants } from '@shared/utils/constants';
import { HttpErrorResponseBack } from '@shared/models/http-error-response.model';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  hasError!: boolean;
  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private translate: TranslateService,
    private router: Router
  ) {}

  getAnswer(
    request: IRequestAnswer,
    idMessage: number,
    path: string = '/chat/knowledgebase/search'
  ): Observable<{
    response: IResponseAnswer;
    request: IRequestAnswer;
    idAnswer: number;
  }> {
    let options;
    const zendeskToken = sessionStorage.getItem('tokenZendesk');
    if (zendeskToken) {
      options = {
        headers: new HttpHeaders({
          'User-Profile-Token': 'Bearer ' + zendeskToken,
        }),
      };
    } else {
      options = {};
    }

    this.hasError = false;
    return this.http
      .post(
        environment.apiUrl + path + Constants.API_BYPASS_CACHE,
        request,
        options
      )
      .pipe(
        retry<any>({ count: 3, delay: this.genericRetryHandler }),
        map((response: IResponseAnswer) => ({
          response,
          request,
          idAnswer: idMessage,
        })),
        catchError((error: HttpErrorResponseBack) =>
          this.handleError(error, {
            ...request,
            idAnswer: idMessage,
          })
        )
      );
  }

  getAnswerCommand(
    request: IRequestCommand,
    idMessage: number
  ): Observable<{
    response: IResponseAnswer;
    request: IRequestCommand;
    idAnswer: number;
  }> {
    this.hasError = false;
    return this.http
      .post(
        environment.apiUrl +
          '/commands' +
          request.command +
          Constants.API_BYPASS_CACHE,
        {}
      )
      .pipe(
        retry<any>({ count: 3, delay: this.genericRetryHandler }),
        map((response: IResponseAnswer) => ({
          response,
          request,
          idAnswer: idMessage,
        })),
        catchError((error: HttpErrorResponseBack) =>
          this.handleError(error, {
            request,
            idAnswer: idMessage,
          })
        )
      );
  }

  genericRetryHandler = (error: any, _numRetry: number) => {
    return new Observable<any>(observer => {
      if (Constants.HTTP_CODES_NOT_RETRY.includes(error.status)) {
        observer.error(error);
        observer.complete();
        return;
      }
      observer.next(error);
    });
  };

  generateImage(
    request: IRequestImage,
    idMessage: number
  ): Observable<{
    response: IResponseImage[];
    request: IRequestImage;
    idAnswer: number;
  }> {
    this.hasError = false;
    return this.http
      .post(
        environment.apiUrl +
          Constants.API_IMAGES_GENERATE +
          Constants.API_BYPASS_CACHE +
          `&preview=${request.preview}`,
        request
      )
      .pipe(
        retry<any>({ count: 3, delay: this.genericRetryHandler }),
        map<any, any>((response: IResponseImage[]) => ({
          response,
          request,
          idAnswer: idMessage,
        })),
        catchError((error: HttpErrorResponseBack) =>
          this.handleError(error, {
            ...request,
            type: 'image',
            idAnswer: idMessage,
          })
        )
      );
  }

  generateImagePreview(
    request: IRequestVision,
    idMessage: number
  ): Observable<any> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http
      .post(
        environment.apiUrl + Constants.API_IMAGES_DESCRIBE,
        request.formDataImage,
        { headers }
      )
      .pipe(
        retry<any>({ count: 3, delay: this.genericRetryHandler }),
        map<any, any>((response: IResponseImage[]) => ({
          response,
          request,
          idAnswer: idMessage,
        })),
        catchError((error: HttpErrorResponseBack) =>
          this.handleError(error, {
            ...request,
            type: 'text',
            idAnswer: idMessage,
          })
        )
      );
  }

  generateSingUrl(
    blob_name: string,
    expiration: number
  ): Observable<{ signed_url: string }> {
    return this.http
      .get<{
        signed_url: string;
      }>(
        environment.apiUrl +
          Constants.API_SIGNED_URL +
          `?blob_name=${blob_name}&url_expiration_time=${expiration}`
      )
      .pipe(retry(3));
  }

  sendFeedBack(request: IRequestFeedback): Observable<IResponseFeedback> {
    return this.http
      .post(environment.apiUrl + Constants.API_FEEDBACK, request)
      .pipe(retry(3));
  }

  sendIssueReport(
    request: IRequestIssueReport
  ): Observable<IResponseIssueReport> {
    return this.http
      .post(environment.apiUrl + Constants.API_ISSUES, request)
      .pipe(retry(3));
  }

  getPromptsExamples(
    filter: any,
    chatValue?: string
  ): Observable<{ response: any[]; chatValue?: string }> {
    const params = {
      filter: JSON.stringify(filter),
    };
    const options = {
      params: new HttpParams({ fromObject: params }),
    };
    return this.http
      .get<any>(
        environment.apiUrl + Constants.API_INTERACTIONS_POPULAR,
        options
      )
      .pipe(
        retry(3),
        map((response: any[]) => ({
          response,
          chatValue,
        }))
      );
  }

  getLocalPromptsExamples(path: string): Observable<any> {
    return this.http.get(path).pipe(retry(3));
  }

  getModels(): Observable<IModelsResponse[]> {
    return this.http
      .get<IModelsResponse[]>(environment.apiUrl + Constants.API_MODELS)
      .pipe(retry({ count: 3, delay: 500 }));
  }

  uploadFile(request: FormData): Observable<IResponseFiles> {
    const headers = {
      headers: new HttpHeaders({
        responseType: 'json',
      }),
    };
    return this.http
      .post<IResponseFiles>(
        environment.apiUrl + Constants.API_FILES,
        request,
        headers
      )
      .pipe(retry(3));
  }

  embeddings(text: string): Observable<any> {
    return this.http
      .post(environment.apiUrl + Constants.API_EMBEDDINGS, {
        text,
      })
      .pipe(retry(3));
  }

  private handleError = (err: HttpErrorResponseBack, request: any) => {
    if (err.status === 0) {
      console.error('An error occurred:', err.url + ' ' + err.error);
      return throwError(() => ({
        ...err,
        message:
          request.type === 'image'
            ? this.translate.instant('NO_IMAGES_GENERATE')
            : this.translate.instant('ERROR_RESPONSE_GENERAL'),
        ...request,
      }));
    } else {
      console.error(err);
      console.error(
        `Backend returned code ${err.status}, url: ${err.url}, body was: ${err.error.detail}` +
          ' ' +
          err.statusText +
          ' ' +
          (err.error != null ? err.error.errorStack : '')
      );
    }

    const message =
      err.error instanceof ErrorEvent
        ? err.error.message
        : `Call to ${err.url} failed with status code ${err.status}`;
    this.sessionService.storeError(message);

    if (err.status === 401 || err.status === 403) {
      this.sessionService.logout();
      this.router.navigate(['/login']);
    } else {
      const codeBackend: string =
        typeof err?.error?.detail === 'string' &&
        err?.error?.detail?.charAt(0) === '{'
          ? JSON.parse(err.error.detail).code
          : 'ERROR_RESPONSE_GENERAL';
      const codeBackendMessage = this.translate.instant(codeBackend);
      return throwError(() => ({
        ...err,
        message:
          codeBackendMessage === codeBackend
            ? this.translate.instant('ERROR_RESPONSE_GENERAL')
            : codeBackendMessage,
        ...request,
      }));
    }
    return throwError(() => ({ ...err, ...request }));
  };

  async getZendeskToken() {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: 'Bearer ' + token,
    };

    const res = await firstValueFrom(
      this.http.get<any>(
        environment.apiUrl + Constants.API_TOKEN_USER_ZENDESK,
        { headers }
      )
    );

    sessionStorage.setItem('tokenZendesk', res.token);
  }
}
