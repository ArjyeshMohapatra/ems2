import { DOCUMENT } from '@angular/common';
import { Injectable, signal, inject, afterNextRender } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly body = this.document.body;

  isCollapsed = signal(false);
  isMobileOpen = signal(false);

  constructor() {
    // initialize state after it has finished rendering for 1st time
    afterNextRender(() => {
      this.isCollapsed.set(localStorage.getItem('emsSidebarCollapsed') === 'true');
    });
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