import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provides template features like *ngIf
import { RouterModule } from '@angular/router'; // Supports active navigation routes

// Services
import { SessionService } from '@core/services';
import { SidebarStateService } from '../sidebar/sidebar-state.service';

@Component({
  selector: 'app-header',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    RouterModule
  ], // UI dependencies provided directly
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() title = 'Dashboard';

  showPopup = false;

  constructor(
    private session: SessionService,
    public sidebarState: SidebarStateService
  ) {}

  togglePopup(event: MouseEvent): void {
    event.stopPropagation();
    this.showPopup = !this.showPopup;
  }

  toggleMobileSidebar(event: MouseEvent): void {
    event.stopPropagation();
    this.sidebarState.toggleMobileSidebar();
  }

  @HostListener('document:click')
  closePopup(): void {
    this.showPopup = false;
  }

  logout(): void {
    this.session.logout();
  }
}