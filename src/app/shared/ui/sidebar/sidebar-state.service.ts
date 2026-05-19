import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router'; // 1. Import Router Events

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private readonly body: HTMLElement;

  isCollapsed = signal(false);
  isMobileOpen = signal(false);

  constructor(@Inject(DOCUMENT) document: Document, private router: Router) { // 2. Inject Router
    this.body = document.body;
    this.isCollapsed.set(localStorage.getItem('emsSidebarCollapsed') === 'true');
    this.syncBodyClasses();

    // 3. Automatically freeze animations ONLY during page switches
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.body.classList.add('no-transitions');
      } else if (event instanceof NavigationEnd) {
        // Allow a brief moment for the new page layout to settle before restoring animations
        setTimeout(() => {
          this.body.classList.remove('no-transitions');
        }, 150);
      }
    });
  }

  toggleDesktopSidebar(): void {
    this.isCollapsed.set(!this.isCollapsed());
    localStorage.setItem('emsSidebarCollapsed', String(this.isCollapsed()));
    this.syncBodyClasses();
  }

  toggleMobileSidebar(): void {
    this.isMobileOpen.set(!this.isMobileOpen());
    this.syncBodyClasses();
  }

  closeMobileSidebar(): void {
    if (!this.isMobileOpen()) {
      return;
    }
    this.isMobileOpen.set(false);
    this.syncBodyClasses();
  }

  private syncBodyClasses(): void {
    this.body.classList.toggle('sidebar-collapsed', this.isCollapsed());
    this.body.classList.toggle('mobile-sidebar-open', this.isMobileOpen());
  }
}