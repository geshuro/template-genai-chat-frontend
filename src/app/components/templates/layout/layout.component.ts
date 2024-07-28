import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgIf } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '@components/organisms/header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DialogMenuMobileComponent } from '../dialog-menu-mobile/dialog-menu-mobile.component';
import { SidenavService } from '@shared/services/utils/sidenav.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    MatSidenavModule,
    NgIf,
    MatButtonModule,
    HeaderComponent,
    MatIconModule,
    MatToolbarModule,
    DialogMenuMobileComponent,
  ],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  isOpened: boolean = true;
  isMobile: boolean = false;
  showFiller = false;
  constructor(
    private breakpointObserver: BreakpointObserver,
    private sidenavService: SidenavService
  ) {}

  @ViewChild('drawer') sidenav!: MatSidenav;

  ngAfterViewInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this.isOpened = !result.matches;
        this.isMobile = result.matches;
      });
  }
}
