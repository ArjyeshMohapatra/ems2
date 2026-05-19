import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private readonly body: HTMLElement;

  isCollapsed = false;
  isMobileOpen = false;

  constructor(@Inject(DOCUMENT) document: Document) {
    this.body = document.body;
    this.isCollapsed = localStorage.getItem('emsSidebarCollapsed') === 'true';
    this.syncBodyClasses();
  }

  toggleDesktopSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('emsSidebarCollapsed', String(this.isCollapsed));
    this.syncBodyClasses();
  }

  toggleMobileSidebar(): void {
    this.isMobileOpen = !this.isMobileOpen;
    this.syncBodyClasses();
  }

  closeMobileSidebar(): void {
    if (!this.isMobileOpen) {
      return;
    }

    this.isMobileOpen = false;
    this.syncBodyClasses();
  }

  private syncBodyClasses(): void {
    this.body.classList.toggle('sidebar-collapsed', this.isCollapsed);
    this.body.classList.toggle('mobile-sidebar-open', this.isMobileOpen);
  }
}