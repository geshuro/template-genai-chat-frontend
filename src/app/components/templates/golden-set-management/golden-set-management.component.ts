import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UploadDocumentDialogComponent } from '@components/molecules/upload-document-dialog/upload-document-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { ManagementTableComponent } from '@components/atoms/management-table/management-table.component';
import { ManagementTable } from '@shared/models/management-table.model';
import { TimelineModalManagementComponent } from '@components/molecules/timeline-modal-management/timeline-modal-management.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-golden-set-management',
  standalone: true,
  imports: [
    MatButtonModule,
    UploadDocumentDialogComponent,
    MatTableModule,
    ManagementTableComponent,
    TimelineModalManagementComponent,
    RouterModule,
  ],
  templateUrl: './golden-set-management.component.html',
  styleUrl: './golden-set-management.component.scss',
})
export class GoldenSetManagementComponent {
  itemsTable: ManagementTable[] = [
    {
      position: '1',
      nameGoldenSet: 'Lorem ipsum',
      descriptionGoldenSet: 'sit amet consectetur adispiscing elit',
      originDate: '02/04/2024',
      updateDate: '04/04/2024',
      questions: 'Pregunta 1',
      answers: 'Respuesta 1',
      feedback: true,
    },
    {
      position: '2',
      nameGoldenSet: 'Lorem ipsum',
      descriptionGoldenSet: 'sit amet consectetur adispiscing elit',
      originDate: '02/04/2024',
      updateDate: '04/04/2024',
      questions: 'Pregunta 2',
      answers: 'Respuesta 2',
      feedback: false,
    },
    {
      position: '3',
      nameGoldenSet: 'Lorem ipsum',
      descriptionGoldenSet: 'sit amet consectetur adispiscing elit',
      originDate: '02/04/2024',
      updateDate: '04/04/2024',
      questions: 'Pregunta 3',
      answers: 'Respuesta 3',
      feedback: true,
    },
  ];

  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {
    console.log(this.itemsTable);
  }
  openModal(): void {
    this.dialog.open(UploadDocumentDialogComponent);
  }
  backToMenu(): void {
    this.router.navigate(['/management-menu']);
  }
  onKeyup() {}
}
