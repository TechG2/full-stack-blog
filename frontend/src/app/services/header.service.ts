import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  urlChanged: EventEmitter<string> = new EventEmitter<string>();
  mobileChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {}

  setUrl(url: string): void {
    this.urlChanged.emit(url);
  }

  setMobile(isMobile: boolean): void {
    this.mobileChanged.emit(isMobile);
  }
}
