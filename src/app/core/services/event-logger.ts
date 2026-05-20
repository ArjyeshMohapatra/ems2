import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppEvent {
  timestamp: Date;
  source: string;
  action: string;
  metadata: any;
}

@Injectable({ providedIn: 'root' })
export class EventLoggerService {
  // Use BehaviorSubject to hold the history array
  private eventHistory: AppEvent[] = [];
  private eventSubject = new BehaviorSubject<AppEvent[]>([]);

  // Expose as an observable
  events$ = this.eventSubject.asObservable();

  constructor() {
    // DEV ONLY: Load from storage on init, and listen to other tabs
    this.loadLogs();
    
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'dev_logs') {
        this.loadLogs();
      }
    });
  }

  private loadLogs() {
    try {
      const logs = localStorage.getItem('dev_logs');
      if (logs) {
        this.eventHistory = JSON.parse(logs);
      } else {
        this.eventHistory = [];
      }
      this.eventSubject.next(this.eventHistory);
    } catch {
      this.eventHistory = [];
      this.eventSubject.next(this.eventHistory);
    }
  }

  log(source: string, action: string, metadata: any) {
    const newEvent: AppEvent = {
      timestamp: new Date(),
      source,
      action,
      metadata
    };
    
    // Add to our history array (append to end for chronological order)
    this.eventHistory = [...this.eventHistory, newEvent].slice(-50); 
    
    // Push the updated array to all subscribers
    this.eventSubject.next(this.eventHistory);

    // Save to local storage for cross-tab live view (developer only)
    localStorage.setItem('dev_logs', JSON.stringify(this.eventHistory));
  }

  clearLogs() {
    this.eventHistory = [];
    this.eventSubject.next(this.eventHistory);
    localStorage.removeItem('dev_logs');
  }
}