import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FooterComponent } from '@components/organisms/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info-question-dialog',
  templateUrl: './info-question-dialog.component.html',
  styleUrls: ['./info-question-dialog.component.scss'],
  standalone: true,
  imports: [FooterComponent, TranslateModule, MatDialogModule, MatButtonModule],
})
export class InfoQuestionDialogComponent {
  yesVisible: boolean = false;
  noVisible: boolean = false;
  cancelVisible: boolean = false;
  okVisible: boolean = false;
  desistVisible: boolean = false;

  title: string;
  subtitle: string;
  description: string;

  seconds: number;

  closed: boolean;

  constructor(
    public dialogRef: MatDialogRef<InfoQuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.description = data.description;

    this.yesVisible = data.yesVisible;
    this.noVisible = data.noVisible;
    this.okVisible = data.okVisible;
    this.cancelVisible = data.cancelVisible;
    this.desistVisible = data.desistVisible;

    this.seconds = data.seconds;

    this.closed = false;

    this.dialogRef.disableClose = data.disableClose;

    if (this.seconds != null && this.seconds > 0) {
      setInterval(() => {
        if (data.description.includes('_SECONDS_')) {
          this.description = data.description.replace(
            '_SECONDS_',
            this.seconds.toString()
          );
        }

        this.seconds = this.seconds - 1;

        if (this.seconds <= 0) {
          this.dialogRef.close();
        }
      }, 1000);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
