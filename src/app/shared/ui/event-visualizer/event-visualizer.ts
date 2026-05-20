import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { EventLoggerService, AppEvent } from '@core/services';
import { scan } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-visualizer',
  standalone: true,
  imports: [
    DatePipe,
    JsonPipe,
    CommonModule
  ],
  templateUrl: './event-visualizer.html',
  styleUrl: './event-visualizer.css',
})
export class EventVisualizerComponent {
  private logger = inject(EventLoggerService);
  
  // 'scan' accumulates events into an array so we have a full history
  events$: Observable<AppEvent[]> = this.logger.events$.pipe(
    scan((acc: AppEvent[], curr: AppEvent) => [curr, ...acc], [])
  );
}
