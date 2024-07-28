import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-document-modal-management',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './delete-document-modal-management.component.html',
  styleUrl: './delete-document-modal-management.component.scss',
})
export class DeleteDocumentModalManagementComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteDocumentModalManagementComponent>
  ) {}
  closeModal(): void {
    this.dialogRef.close();
  }
}
