import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { marked } from 'marked';
import { MatDialog } from '@angular/material/dialog';
import { UpdatesComponent } from '@components/organisms/updates/updates.component';
import { ReportComponent } from '@components/organisms/report/report.component';
import { HelpGuideComponent } from '@components/organisms/help-guide/help-guide.component';

marked.use({
  breaks: true,
});

@Injectable({
  providedIn: 'root',
})
export class MenuEventsService {
  private showTourSubject = new Subject<boolean>();
  private showUpdatesSubject = new Subject<boolean>();
  private showReportIssueSubject = new Subject<boolean>();
  private showMenuMobileSubject = new Subject<boolean>();

  constructor(public dialog: MatDialog) {}

  showTour() {
    this.showTourSubject.next(true);
  }

  openReportIssue() {
    this.dialog.open(ReportComponent, {});
  }

  openUpdates() {
    this.dialog.open(UpdatesComponent, {});
  }
  openMenuMobile() {
    this.showMenuMobileSubject.next(true);
  }

  onShowTour(): Observable<boolean> {
    return this.showTourSubject.asObservable();
  }

  onShowReportIssue(): Observable<boolean> {
    return this.showReportIssueSubject.asObservable();
  }

  onShowUpdates(): Observable<boolean> {
    return this.showUpdatesSubject.asObservable();
  }
  onShowMenuMobile(): Observable<boolean> {
    return this.showMenuMobileSubject.asObservable();
  }
  openHelpGuide() {
    this.dialog.open(HelpGuideComponent, {});
  }
}
