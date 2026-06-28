import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'ctms-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="public-layout">
      <header class="public-header">
        <div class="container">
          <a routerLink="/" class="logo">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z"/>
            </svg>
            CTMS Portal
          </a>
          <nav class="public-nav">
            <a routerLink="/home" routerLinkActive="active">Home</a>
            <a routerLink="/about" routerLinkActive="active">About</a>
            <a routerLink="/trials" routerLinkActive="active">Trials</a>
            <a routerLink="/contact" routerLinkActive="active">Contact</a>
          </nav>
          <div class="public-actions">
            <a routerLink="/login" class="btn btn-outline">Login</a>
            <a routerLink="/register" class="btn btn-primary">Register</a>
          </div>
        </div>
      </header>

      <main class="public-main">
        <router-outlet></router-outlet>
      </main>

      <footer class="public-footer">
        <div class="container">
          <p>&copy; 2026 CTMS Clinical Trials. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .public-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
    }
    .public-header {
      height: 70px;
      background: white;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--primary, #0056b3);
      text-decoration: none;
    }
    .public-nav {
      display: flex;
      gap: 20px;
    }
    .public-nav a {
      text-decoration: none;
      color: #555;
      font-weight: 500;
      transition: color 0.2s;
    }
    .public-nav a:hover, .public-nav a.active {
      color: var(--primary, #0056b3);
    }
    .public-actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-outline {
      border: 1px solid var(--primary, #0056b3);
      color: var(--primary, #0056b3);
    }
    .btn-outline:hover {
      background: var(--primary, #0056b3);
      color: white;
    }
    .btn-primary {
      background: var(--primary, #0056b3);
      color: white;
      border: 1px solid var(--primary, #0056b3);
    }
    .btn-primary:hover {
      background: #004494;
    }
    .public-main {
      flex: 1;
    }
    .public-footer {
      background: #f8f9fa;
      padding: 40px 0;
      text-align: center;
      color: #666;
      border-top: 1px solid #eee;
    }
  `]
})
export class PublicLayoutComponent {}
