import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { SessionService } from '@shared/services/utils/session.service';

@Directive({
  selector: '[appRoleBased]',
  standalone: true,
})
export class RoleBasedDirective implements OnInit {
  @Input() appRoleBased: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: SessionService
  ) {}

  ngOnInit(): void {
    const action = this.appRoleBased;
    if (this.authService.checkRoleForAction(action)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
