import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MenuEventsService } from '@shared/services/utils/menu-events.service';
import {
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { ThemingService } from '@shared/services/utils/theming.service';

@Component({
  selector: 'app-help-menu',
  templateUrl: './help-menu.component.html',
  styleUrl: './help-menu.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    TranslateModule,
    RouterModule,
    NgIf,
    NgFor,
    MatCardModule,
  ],
})
export class HelpMenuComponent {
  links: any[] = [];
  darkMode: boolean = true;

  themeService = inject(ThemingService);

  constructor(
    private menuEventsService: MenuEventsService,
    private taggingService: TaggingService
  ) {}

  startTour() {
    this.taggingService.tag(TaggingEvents.open_tour);
    this.menuEventsService.showTour();
  }

  openReportIssue() {
    this.taggingService.tag(TaggingEvents.open_error_report);
    this.menuEventsService.openReportIssue();
  }

  openUpdates() {
    this.taggingService.tag(TaggingEvents.open_updates);
    this.menuEventsService.openUpdates();
  }
}
