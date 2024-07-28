import {
  Injectable,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root',
})
export class OverlayBlockService {
  loadingTemplate!: TemplateRef<any>;
  viewContainerRef!: ViewContainerRef;
  message: string = '';

  private overlay = inject(Overlay);
  private overlayRef?: OverlayRef;

  setContainerTemplate(
    loadingTemplate: TemplateRef<any>,
    viewContainerRef: ViewContainerRef
  ) {
    this.loadingTemplate = loadingTemplate;
    this.viewContainerRef = viewContainerRef;
  }

  showLoading() {
    if (!this.loadingTemplate) {
      console.error('TemplateRef is required');
      return;
    }
    if (!this.viewContainerRef) {
      console.error('ViewContainerRef is required');
      return;
    }
    if (!this.overlayRef) {
      const positionStrategy = this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically();
      const overlayConfig = new OverlayConfig({
        positionStrategy,
        hasBackdrop: true,
        backdropClass: 'loading-backdrop',
        scrollStrategy: this.overlay.scrollStrategies.block(),
      });

      this.overlayRef = this.overlay.create(overlayConfig);
      const portal = new TemplatePortal(
        this.loadingTemplate,
        this.viewContainerRef
      );
      this.overlayRef.attach(portal);
    }
  }

  hideLoading() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef.detach();
      this.overlayRef = undefined;
    }
    this.message = '';
  }
}
