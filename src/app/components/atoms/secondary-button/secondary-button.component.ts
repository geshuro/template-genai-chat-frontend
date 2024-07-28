import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-secondary-button',
  standalone: true,
  imports: [],
  templateUrl: './secondary-button.component.html',
  styleUrl: './secondary-button.component.scss',
})
export class SecondaryButtonComponent {
  @Input() name: string = '';
  @Output() eventClick = new EventEmitter<any>();

  onClick() {
    this.eventClick.emit();
  }
}
