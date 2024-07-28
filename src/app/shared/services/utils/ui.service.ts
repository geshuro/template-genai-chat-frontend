import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { InfoQuestionDialogComponent } from '@components/molecules/info-question-dialog/info-question-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  constructor(
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog
  ) {}

  public async showQuestionDialog(
    title: string,
    question: string,
    panelClass: any = 'full-screen-modal',
    seconds: number = 0
  ) {
    const dialogRef = this.dialog.open(InfoQuestionDialogComponent, {
      panelClass: panelClass,
      autoFocus: false,
      data: {
        yesVisible: true,
        noVisible: true,
        title: title,
        description: question,
        seconds: seconds,
      },
    });

    return await dialogRef.afterClosed().toPromise();
  }

  public async showInfoDialog(
    title: string,
    description: string,
    panelClass: any = 'full-screen-modal'
  ) {
    const dialogRef = this.dialog.open(InfoQuestionDialogComponent, {
      panelClass: panelClass,
      autoFocus: false,
      data: {
        okVisible: true,
        title: title,
        description: description,
      },
    });

    return await dialogRef.afterClosed().toPromise();
  }

  public async showErrorDialog(
    title: string,
    description: string,
    panelClass: any = 'full-screen-modal'
  ) {
    const dialogRef = this.dialog.open(InfoQuestionDialogComponent, {
      panelClass: panelClass,
      autoFocus: false,
      data: {
        okVisible: true,
        title: title,
        description: description,
      },
    });

    return await dialogRef.afterClosed().toPromise();
  }
}
