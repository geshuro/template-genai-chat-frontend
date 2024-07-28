import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.scss'],
  standalone: true,
  imports: [TranslateModule, MatButtonModule, MatIconModule, MatDialogClose],
})
export class UpdatesComponent {
  title: string = 'UPDATES_TITLE';
}
