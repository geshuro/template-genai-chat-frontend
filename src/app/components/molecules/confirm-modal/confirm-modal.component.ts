import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { PrimaryButtonComponent } from '@components/atoms/primary-button/primary-button.component';
import { SecondaryButtonComponent } from '@components/atoms/secondary-button/secondary-button.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [TranslateModule, PrimaryButtonComponent, SecondaryButtonComponent],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      question: string;
      cancel: string;
      confirm: string;
      text: string;
    }
  ) {}

  clickConfirm(): void {
    this.dialogRef.close({ action: 'confirm' });
  }

  clickCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}
