import { Component } from '@angular/core';
import { ItemMenuManagementComponent } from '@components/molecules/item-menu-management/item-menu-management.component';

@Component({
  selector: 'app-list-menu-management',
  standalone: true,
  imports: [ItemMenuManagementComponent],
  templateUrl: './list-menu-management.component.html',
  styleUrl: './list-menu-management.component.scss',
})
export class ListMenuManagementComponent {}
