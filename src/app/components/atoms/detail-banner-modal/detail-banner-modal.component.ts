import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-detail-banner-modal',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './detail-banner-modal.component.html',
  styleUrl: './detail-banner-modal.component.scss',
})
export class DetailBannerModalComponent {
  constructor(
    public dialogRef: MatDialogRef<DetailBannerModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      description: string;
    }
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }
}
