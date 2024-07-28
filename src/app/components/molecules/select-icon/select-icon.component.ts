import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ISelectorItem } from '@shared/models/selector-top.model';
import { TitleCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-select-icon',
  standalone: true,
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    NgClass,
    TitleCasePipe,
    TranslateModule,
  ],
  templateUrl: './select-icon.component.html',
  styleUrl: './select-icon.component.scss',
})
export class SelectIconComponent {
  @Input() items?: ISelectorItem[];
  @Input() itemSelected?: ISelectorItem;
  @Input() disabled?: boolean;
  @Input() idField?: string;

  @Output() selectedItemEvent = new EventEmitter<ISelectorItem>();

  onSelected(item: MatSelectChange) {
    this.itemSelected = item.value;
    this.selectedItemEvent.emit(item.value);
  }
}
