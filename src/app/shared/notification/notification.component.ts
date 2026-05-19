import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@core/services';

@Component({
  selector: 'app-notification',
  standalone: true, // Kept standalone configuration
  imports: [CommonModule], // Added to prevent template directive compilation errors
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  constructor(public notify: NotificationService) {}
}