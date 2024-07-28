declare const google: any;
declare const gapi: any;

import { inject, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OverlayBlockService } from '../overlay-block.service';
import { IndexedDBChatApiService } from '../indexedb-chat-api.service';

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  private clientId = environment.gClientId;
  private apikey = environment.gApiKey;
  private tokenClient: any;
  private pickerApiLoaded = false;
  private oauthToken!: string;

  private pickerSelectFileSubject = new Subject<any>();
  private pickerDownloadFileSubject = new Subject<any>();

  private loadingService = inject(OverlayBlockService);
  private indexedDBChatApiService = inject(IndexedDBChatApiService);

  constructor(private ngZone: NgZone) {
    this.initClient();
  }

  private initClient() {
    gapi.load('client:picker', () => {
      gapi.client
        .init({
          apiKey: this.apikey,
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          ],
        })
        .then(() => {
          this.pickerApiLoaded = true;
        });
    });

    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (tokenResponse: any) => {
        this.oauthToken = tokenResponse.access_token;
        this.ngZone.run(() => this.createPicker());
      },
    });
  }

  signIn() {
    this.tokenClient.requestAccessToken();
  }

  signOut() {
    this.oauthToken = '';
  }

  createPicker() {
    if (!this.oauthToken) {
      this.signIn();
      return;
    }

    if (this.pickerApiLoaded) {
      const view = new google.picker.View(google.picker.ViewId.DOCS);
      view.setMimeTypes('application/pdf');

      const picker = new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(this.oauthToken)
        .setDeveloperKey(this.apikey)
        .setCallback(this.pickerCallback.bind(this))
        .build();
      picker.setVisible(true);
    }
  }

  async pickerCallback(data: any) {
    if (data.action === google.picker.Action.PICKED) {
      this.pickerSelectFileSubject.next(data.docs);
      this.loadingService.message = 'UPLOAD_FILES_MESSAGE';
      this.loadingService.showLoading();
      const file = data.docs[0];
      const fileInBD = await this.indexedDBChatApiService.getFileByName(
        file.name
      );
      if (!fileInBD || fileInBD.length === 0)
        await this.getFileArrayBuffer(file.id, file.name, file.mimeType);
      else this.loadingService.hideLoading();
    }
  }

  getFileArrayBuffer = async (
    fileId: string,
    name: string,
    mimeType: string
  ) => {
    try {
      const accessToken = this.oauthToken;
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          method: 'GET',
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
          }),
        }
      );
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        this.pickerDownloadFileSubject.next({
          body: arrayBuffer,
          name,
          mimeType,
        });
      } else {
        console.error('Error al obtener el archivo:', response.statusText);
      }
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
    }
  };

  async getDownloadUrl(fileId: string, fileName: string) {
    try {
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'webContentLink',
      });
      const downloadUrl = response.result.webContentLink;
      this.downloadFile(downloadUrl, fileName);
    } catch (error) {
      console.error('Error getting download URL:', error);
    }
  }

  downloadFile(url: string, name: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  }

  pickerSelectFile() {
    return this.pickerSelectFileSubject.asObservable();
  }

  onPickerDownloadFile() {
    return this.pickerDownloadFileSubject.asObservable();
  }
}
