import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { EventLoggerService } from '@core/services';

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
  events$ = this.logger.events$;

  clear() {
    this.logger.clearLogs();
  }
}
