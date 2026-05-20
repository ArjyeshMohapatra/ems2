import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppEvent {
  timestamp: string;
  source: string;
  action: string;
  metadata: any;
}

@Injectable({ providedIn: 'root' })
export class EventLoggerService {
  private eventStream = new Subject<AppEvent>();
  events$ = this.eventStream.asObservable();

  log(source: string, action: string, metadata: any) {
    this.eventStream.next({
      timestamp: new Date().toISOString(),
      source,
      action,
      metadata
    });
  }
}