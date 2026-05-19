import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Provides structural directives (*ngIf, [ngClass])
import { RouterModule } from '@angular/router'; // Enables routerLink navigation directives
import { interval, startWith } from 'rxjs';

// Services
import { SidebarStateService } from './sidebar-state.service';
import { LeaveService, SessionService } from '@core/services';

@Component({
  selector: 'app-sidebar',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    RouterModule
  ], // Dependencies provided directly to the template parser
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(
    public sidebarState: SidebarStateService,
    public leaveService: LeaveService,
    public sessionService: SessionService
  ) { }

  ngOnInit(): void {
    interval(10000).pipe(startWith(0)).subscribe(() => {
      this.leaveService.refreshState();
    })
  }

  toggleSidebar(): void {
    this.sidebarState.toggleDesktopSidebar();
  }

  closeMobileSidebar(): void {
    this.sidebarState.closeMobileSidebar();
  }

  get hrPortalBlocked(): boolean {
    return localStorage.getItem('hrPortalBlocked') === 'true';
  }
}