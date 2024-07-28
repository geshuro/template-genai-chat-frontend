import { Component, Input, OnInit } from '@angular/core';
import { ManagementTable } from '@shared/models/management-table.model';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TimelineModalManagementComponent } from '@components/molecules/timeline-modal-management/timeline-modal-management.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDocumentModalManagementComponent } from '@components/molecules/delete-document-modal-management/delete-document-modal-management.component';

@Component({
  selector: 'app-management-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatPaginatorModule,
    TimelineModalManagementComponent,
    DeleteDocumentModalManagementComponent,
  ],
  templateUrl: './management-table.component.html',
  styleUrl: './management-table.component.scss',
})
export class ManagementTableComponent implements OnInit {
  @Input() itemsTable!: ManagementTable[];
  @Input() isGoldenSet!: boolean;

  displayedColumns: string[] = [];
  dataSource!: ManagementTable[];

  constructor(private dialog: MatDialog) {}
  openTimeLineModal(): void {
    this.dialog.open(TimelineModalManagementComponent);
  }

  openDeleteModal(): void {
    this.dialog.open(DeleteDocumentModalManagementComponent);
  }

  ngOnInit(): void {
    this.buildTable();
  }

  buildTable(): void {
    this.dataSource = this.itemsTable;
    if (this.isGoldenSet) {
      this.displayedColumns = [
        'position',
        'nameGoldenSet',
        'descriptionGoldenSet',
        'originDate',
        'updateDate',
        'actions',
      ];
    } else {
      this.displayedColumns = [
        'position',
        'questions',
        'answers',
        'feedback',
        'actions',
      ];
    }
  }
}
