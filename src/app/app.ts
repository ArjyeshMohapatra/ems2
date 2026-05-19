import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { LoadingComponent, NotificationComponent } from '@shared'

@Component({
  selector: 'app-root',
  standalone: true, // Configures this component as a standalone shell for Angular 21
  imports: [
    RouterOutlet,
    LoadingComponent,
    NotificationComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'employee-management-system';
}