import { ThemingService } from '@shared/services/utils/theming.service';
import { OverlayBlockService } from '../../shared/services/utils/overlay-block.service';
import {
  AfterViewInit,
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '@components/templates/layout/layout.component';
import { ChatContainerComponent } from '@components/templates/chat-container/chat-container.component';
import { SideNavComponent } from '@components/organisms/side-nav/side-nav.component';
import { SpinnerComponent } from '@components/atoms/spinner/spinner.component';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutManagementComponent } from '@components/templates/layout-management/layout-management.component';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    LayoutManagementComponent,
    ChatContainerComponent,
    SideNavComponent,
    SpinnerComponent,
    TranslateModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewInit {
  @ViewChild('loadingTemplate', { static: true })
  loadingTemplate!: TemplateRef<any>;
  @ViewChild('loadingContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  private themingService = inject(ThemingService);
  private loadingService = inject(OverlayBlockService);

  ngAfterViewInit() {
    if (this.loadingTemplate) {
      this.loadingService.setContainerTemplate(
        this.loadingTemplate,
        this.container
      );
      this.loadingService.showLoading();
    }
  }

  get loadingFirst(): boolean {
    return this.themingService.loadingFirst;
  }

  get message(): string {
    return this.loadingService.message;
  }
}
