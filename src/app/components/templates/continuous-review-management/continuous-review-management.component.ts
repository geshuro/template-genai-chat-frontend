import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ResponseDocumentManagementComponent } from '@components/organisms/response-document-management/response-document-management.component';

@Component({
  selector: 'app-continuous-review-management',
  standalone: true,
  imports: [ResponseDocumentManagementComponent],
  templateUrl: './continuous-review-management.component.html',
  styleUrl: './continuous-review-management.component.scss',
})
export class ContinuousReviewManagementComponent {
  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {}
  backToMenu(): void {
    this.router.navigate(['/management-menu']);
  }
  onKeyup() {}
}
