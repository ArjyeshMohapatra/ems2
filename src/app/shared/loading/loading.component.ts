import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provides template features like *ngIf and async pipe
import { LoadingService } from '@core/services';

@Component({
  selector: 'app-loading',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Encapsulates its own template dependencies
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {

  constructor(public loader: LoadingService) { }

  ngOnInit(): void {
  }

}