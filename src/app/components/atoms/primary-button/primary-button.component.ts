import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-primary-button',
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.scss'],
  standalone: true,
})
export class PrimaryButtonComponent {
  @Input() name: string = '';
  @Input() hasIcon: boolean = false;
  @Output() clickEvent = new EventEmitter<any>();

  onClick() {
    this.clickEvent.emit();
  }
}
