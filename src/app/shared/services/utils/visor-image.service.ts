import { Injectable } from '@angular/core';
import { IGridImage } from '@shared/models/chat-interaction.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VisorService {
  public visorImages: IGridImage[] = [];

  private visorSelected$: BehaviorSubject<IGridImage | any> =
    new BehaviorSubject(undefined);

  getImageSelected(): Observable<IGridImage> {
    return this.visorSelected$.asObservable();
  }

  selectImage(visorImages: IGridImage): void {
    this.visorSelected$.next(visorImages);
  }
}
