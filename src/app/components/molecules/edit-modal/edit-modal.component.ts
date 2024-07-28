import { Component, Inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { PrimaryButtonComponent } from '@components/atoms/primary-button/primary-button.component';
import { SecondaryButtonComponent } from '@components/atoms/secondary-button/secondary-button.component';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatInputModule,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
  ],
})
export class EditModalComponent implements OnInit {
  modalForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      cancel: string;
      confirm: string;
      text: string;
    }
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadForm();
  }

  initForm(): void {
    this.modalForm = new FormGroup({
      title: new FormControl(''),
    });
  }

  loadForm(): void {
    this.modalForm.patchValue({
      title: this.data.text,
    });
  }

  clickConfirm(): void {
    this.dialogRef.close({
      action: 'confirm',
      value: this.modalForm.get('title')?.value,
    });
  }

  clickCancel(): void {
    this.dialogRef.close({
      action: 'cancel',
      value: '',
    });
  }
}
