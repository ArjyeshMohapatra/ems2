// src/app/shared/ui/page-layout/page-layout.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provides structural directives (*ngIf)
import { RouterModule } from '@angular/router'; // Supports routing layout outlets

// Material Layout Module (Moved from PageLayoutModule)
import { MatToolbarModule } from "@angular/material/toolbar";
import { CdkTableModule } from "@angular/cdk/table"; // Kept from original module parameters

// Sub-component Shell Layout Dependencies
import { HeaderComponent } from '../header/header.component'; // Standalone Header
import { SidebarComponent } from '../sidebar/sidebar.component';
import { SidebarStateService } from '../sidebar/sidebar-state.service';

@Component({
  selector: 'app-page-layout',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    CdkTableModule,
    HeaderComponent,
    SidebarComponent
  ], // Dependencies moved directly from the old module file
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.css']
})
export class PageLayoutComponent {
  @Input() title = '';
  @Input() isLoading = false;

  constructor(public sidebarState: SidebarStateService) {}
}