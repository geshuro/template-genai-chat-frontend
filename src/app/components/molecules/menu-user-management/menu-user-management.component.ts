import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-user-management',
  standalone: true,
  imports: [MatMenuModule, MatIconModule],
  templateUrl: './menu-user-management.component.html',
  styleUrl: './menu-user-management.component.scss',
})
export class MenuUserManagementComponent {
  @Input()
  userName: string = 'Usuario';

  constructor(private router: Router) {}

  backToChat(): void {
    this.router.navigate(['/chat']);
  }
}
