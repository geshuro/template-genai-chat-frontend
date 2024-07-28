import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatDialogClose } from '@angular/material/dialog';

@Component({
  selector: 'app-help-guide',
  standalone: true,
  imports: [
    MatIcon,
    TranslateModule,
    MatCardModule,
    CommonModule,
    MatDialogClose,
  ],
  templateUrl: './help-guide.component.html',
  styleUrl: './help-guide.component.scss',
})
export class HelpGuideComponent {
  title: string = 'TITLE_HELP_GUIDE';
}
