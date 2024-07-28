import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-item-menu-management',
  standalone: true,
  imports: [NgFor, RouterModule],
  templateUrl: './item-menu-management.component.html',
  styleUrl: './item-menu-management.component.scss',
})
export class ItemMenuManagementComponent {
  items = [
    {
      imageUrl: '/assets/icons/icons-management/golden-set.png',
      text: 'Administación Golden Sets',
      url: '/management-menu/golden-set',
    },
    {
      imageUrl: '/assets/icons/icons-management/revision-continua.png',
      text: 'Revisión Continua',
      url: '/management-menu/continuous-review',
    },
    {
      imageUrl: '/assets/icons/icons-management/correccion-continua.png',
      text: 'Corrección Continua',
    },
  ];

  constructor(private router: Router) {}

  backToUrl(url: string | undefined): void {
    this.router.navigate([url]);
  }
  onKeyup() {}
}
