import { Injectable,signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading = signal(false);
  show() {
    this.loading.set(true);
  }

  hide(startTime: number, minMs = 1000): void {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(minMs - elapsed, 0);
  
    setTimeout(() => {
      this.loading.set(false);
    }, remaining);
  }
}
