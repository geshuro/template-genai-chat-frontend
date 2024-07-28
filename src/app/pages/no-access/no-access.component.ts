import { CommonModule } from '@angular/common';
import { Component, Renderer2, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { FooterComponent } from '@components/organisms/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  ThemeInfix,
  ThemePrefix,
} from '@shared/services/utils/model/theme.model';
import { SessionService } from '@shared/services/utils/session.service';
import { ThemingService } from '@shared/services/utils/theming.service';

@Component({
  selector: 'app-no-access',
  templateUrl: './no-access.component.html',
  styleUrls: ['./no-access.component.scss'],
  standalone: true,
  imports: [
    FooterComponent,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    CommonModule,
  ],
})
export class NoAccessComponent {
  private themeService = inject(ThemingService);
  private renderer = inject(Renderer2);
  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {
    setTimeout(() => {
      this.themeService.themePrefix.set(ThemePrefix['RH+']);
      this.themeService.themeInfix.set(ThemeInfix.light);
      this.renderer.setAttribute(document.body, 'data-theme', 'light');
    }, 100);
  }

  async logout() {
    this.sessionService.logout();
    this.router.navigate(['/login']);
  }
}
