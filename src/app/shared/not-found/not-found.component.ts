// src/app/shared/not-found/not-found.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Replaces CommonModule from the old module file
import { Router } from '@angular/router';
import { SessionService } from '@core/services';

@Component({
  selector: 'app-not-found',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Template dependencies provided directly
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private router: Router,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    this.isLoggedIn = !!token && !this.session.isExpired(token);
  }

  goBack(): void {
    this.router.navigate([this.isLoggedIn ? '/dashboard' : '/login']);
  }
}