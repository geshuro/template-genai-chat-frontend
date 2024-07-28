import { NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-optimized-img',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './optimized-img.component.html',
  styleUrl: './optimized-img.component.scss',
})
export class OptimizedImgComponent {
  @Input()
  src!: string;
  @Input()
  placeholder!: string | boolean;
  @Input()
  width!: number;
  @Input()
  height!: number;
}
