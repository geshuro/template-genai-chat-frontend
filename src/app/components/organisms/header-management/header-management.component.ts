import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MenuUserManagementComponent } from '@components/molecules/menu-user-management/menu-user-management.component';

@Component({
  selector: 'app-header-management',
  standalone: true,
  imports: [MatToolbarModule, MenuUserManagementComponent],
  templateUrl: './header-management.component.html',
  styleUrl: './header-management.component.scss',
})
export class HeaderManagementComponent {}
