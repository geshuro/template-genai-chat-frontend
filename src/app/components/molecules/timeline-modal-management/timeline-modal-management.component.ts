import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-timeline-modal-management',
  standalone: true,
  imports: [MatButtonModule, MatExpansionModule],
  templateUrl: './timeline-modal-management.component.html',
  styleUrl: './timeline-modal-management.component.scss',
})
export class TimelineModalManagementComponent {
  panelOpenState = false;
  constructor(
    public dialogRef: MatDialogRef<TimelineModalManagementComponent>
  ) {}

  closeModal(): void {
    this.dialogRef.close();
  }
}
