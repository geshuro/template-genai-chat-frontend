import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DetailBannerModalComponent } from '../detail-banner-modal/detail-banner-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [NgClass],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent implements OnInit {
  @Input() iconName!: string;
  @Input() title: string = '';
  @Input() hasModal!: boolean;
  @Input() color: string = '';

  currentBgClass!: string;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.currentBgClass = this.color;
  }

  openDetail(): void {
    this.dialog.open(DetailBannerModalComponent, {
      data: {
        title: this.title,
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      },
    });
  }
}
