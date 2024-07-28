import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserEventsService {
  private subject = new Subject<any>();
  private promptExamplesSubject = new Subject<{
    isCustom: boolean;
    isFiles: boolean;
  }>();

  sendClickEvent(text: string, action: string): void {
    this.subject.next({ title: text, action });
  }
  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  sendUpdatePromptExamples(isCustom: boolean, isFiles: boolean = false) {
    this.promptExamplesSubject.next({ isCustom, isFiles });
  }
  getUpdatePromptExamples(): Observable<{
    isCustom: boolean;
    isFiles: boolean;
  }> {
    return this.promptExamplesSubject.asObservable();
  }
}
