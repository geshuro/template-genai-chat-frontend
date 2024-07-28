import { Component } from '@angular/core';
import { HeaderManagementComponent } from '@components/organisms/header-management/header-management.component';
import { ListMenuManagementComponent } from '@components/organisms/list-menu-management/list-menu-management.component';
import { GoldenSetManagementComponent } from '../golden-set-management/golden-set-management.component';
import { RouterOutlet } from '@angular/router';
import { ContinuousReviewManagementComponent } from '../continuous-review-management/continuous-review-management.component';

@Component({
  selector: 'app-layout-management',
  standalone: true,
  imports: [
    HeaderManagementComponent,
    ListMenuManagementComponent,
    GoldenSetManagementComponent,
    RouterOutlet,
    ContinuousReviewManagementComponent,
  ],
  templateUrl: './layout-management.component.html',
  styleUrl: './layout-management.component.scss',
})
export class LayoutManagementComponent {}
