import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { IGridImage } from '@shared/models/chat-interaction.model';
import { VisorService } from '@shared/services/utils/visor-image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-visor-image',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './visor-image.component.html',
  styleUrl: './visor-image.component.scss',
})
export class VisorImageComponent implements OnInit, OnDestroy {
  public image!: IGridImage;
  private subscription?: Subscription;

  constructor(
    private ref: ChangeDetectorRef,
    private readonly visorService: VisorService
  ) {}

  ngOnInit(): void {
    this.getImageSelected();
  }

  getImageSelected(): void {
    this.subscription = this.visorService
      .getImageSelected()
      .subscribe((image: IGridImage) => {
        this.image = image;
        this.ref.detectChanges();
      });
  }

  changeImg(move: number): void {
    this.image = this.visorImages.find(
      img => img.position === this.image.position + move
    )!;
    this.visorService.selectImage(this.image);
  }

  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.image.src;
    link.download = `${this.image.position}-image-generate.png`;
    link.dispatchEvent(new MouseEvent('click'));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get visorImages(): IGridImage[] {
    return this.visorService.visorImages;
  }
}
