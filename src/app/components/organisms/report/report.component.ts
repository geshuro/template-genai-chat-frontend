import { Component } from '@angular/core';
import {
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

import { take } from 'rxjs';
import { ApiClientService } from '@shared/services/external/api-client.service';
import { Base64Pipe } from '@shared/pipes/base64.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  ErrorReportTypeEnum,
  TaggingEvents,
  TaggingService,
} from '@shared/services/utils/tagging-service';
import { SessionService } from '@shared/services/utils/session.service';
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogClose,
    MatIconModule,
  ],
  providers: [Base64Pipe],
})
export class ReportComponent {
  selectedFile: any = null;
  nonWhitespaceRegExp: RegExp = new RegExp('\\S');
  reportForm = this.formBuilder.group({
    type: [
      '',
      [Validators.required, Validators.pattern(this.nonWhitespaceRegExp)],
    ],
    title: [
      '',
      [Validators.required, Validators.pattern(this.nonWhitespaceRegExp)],
    ],
    description: [
      '',
      [Validators.required, Validators.pattern(this.nonWhitespaceRegExp)],
    ],
    file: '',
  });

  isSubmitted = false;
  backResponse = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiClientService,
    private base64Pipe: Base64Pipe,
    private tagginService: TaggingService,
    private sessionService: SessionService
  ) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  clear(fileInput: any): void {
    fileInput.value = '';
    this.selectedFile = null;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.reportForm.invalid) {
      return;
    }
    this.reportForm.disable();
    this.loading = true;

    const bugType = this.reportForm.get('type')?.value;
    const encodedRequest = {
      type: this.base64Pipe.transform(bugType ?? '' ?? ''),
      title: this.base64Pipe.transform(
        this.reportForm.get('title')?.value ?? ''
      ),
      description: this.base64Pipe.transform(
        this.reportForm.get('description')?.value ?? ''
      ),
      email_hash: this.base64Pipe.transform(this.sessionService.getUserEmail()),
    };
    this.tagginService.tag(TaggingEvents.send_error_report, {
      type: ErrorReportTypeEnum[bugType as keyof typeof ErrorReportTypeEnum],
    });
    try {
      this.apiService
        .sendIssueReport(encodedRequest)
        .pipe(take(1))
        .subscribe({
          next: () => {
            if (this.isSubmitted) {
              this.backResponse = true;
            }
            this.loading = false;
            this.reportForm.enable();
          },
          error: () => {
            this.reportForm.enable();
          },
        });
    } catch (error) {
      console.log('Error:', error);
    }
  }
}
