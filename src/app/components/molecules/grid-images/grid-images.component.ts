import { Component, Input, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { IGridImage } from '@shared/models/chat-interaction.model';
import { VisorImageComponent } from '../visor-image/visor-image.component';
import { MatDialog } from '@angular/material/dialog';
import { VisorService } from '@shared/services/utils/visor-image.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-grid-images',
  standalone: true,
  imports: [MatGridListModule, TranslateModule],
  templateUrl: './grid-images.component.html',
  styleUrl: './grid-images.component.scss',
})
export class GridImagesComponent implements OnInit {
  @Input() images: IGridImage[] = [];
  breakpoint: number = 4;
  isMobile: boolean = false;
  rowHeight: string = '321';

  constructor(
    public dialog: MatDialog,
    public visorService: VisorService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.breakpoint = this.isMobile ? 2 : 4;
        this.rowHeight = this.isMobile ? '1:1' : '321';
      });
  }

  openDialog(image: IGridImage) {
    this.visorService.visorImages = this.images;
    this.visorService.selectImage(image);
    this.dialog.open(VisorImageComponent, {
      panelClass: 'custom-dialog-container',
    });
  }
}
