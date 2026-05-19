// src/app/shared/error-control/error-control.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provides structural directives (*ngIf)
import { AbstractControl } from '@angular/forms';
import { ErrorMsgPipe } from '@core/pipes';

@Component({
  selector: 'app-error-control',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    ErrorMsgPipe
  ], // Encapsulates its own template dependencies
  templateUrl: './error-control.component.html',
  styleUrls: ['./error-control.component.css']
})
export class ErrorControlComponent {
  @Input() control!: AbstractControl | null;
  @Input() labelName: string = 'Field';
}