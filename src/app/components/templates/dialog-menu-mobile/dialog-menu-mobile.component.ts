import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ListMenuMobileComponent } from '@components/organisms/list-menu-mobile/list-menu-mobile.component';
import { MenuEventsService } from '@shared/services/utils/menu-events.service';

@Component({
  selector: 'app-dialog-menu-mobile',
  standalone: true,
  imports: [MatDialogModule, ListMenuMobileComponent],
  templateUrl: './dialog-menu-mobile.component.html',
  styleUrl: './dialog-menu-mobile.component.scss',
})
export class DialogMenuMobileComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private menuEventsService: MenuEventsService
  ) {}

  ngOnInit(): void {
    this.menuEventsService.onShowMenuMobile().subscribe(show => {
      if (show) {
        this.openDialog();
      }
    });
  }

  openDialog() {
    this.dialog.open(ListMenuMobileComponent, {});
  }
}
