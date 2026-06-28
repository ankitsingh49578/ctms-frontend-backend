import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ctms-about',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="page-header fade-in">
      <div class="container">
        <h1>About CTMS Research</h1>
        <p>Pioneering clinical research to build a healthier tomorrow.</p>
      </div>
    </div>
    
    <div class="container" style="padding: 60px 24px;">
      <div class="content-grid slide-up delay-1">
        <div class="text-block">
          <h2 class="section-title" style="text-align:left;margin-bottom:20px;">Our Mission</h2>
          <p class="lead">We are dedicated to advancing medical science through rigorous, ethical, and patient-centered clinical trials.</p>
          <p>Our goal is to bring safe and effective treatments to those who need them most by facilitating seamless collaboration between researchers, clinicians, and volunteer participants.</p>
          
          <h2 class="section-title" style="text-align:left;margin-top:40px;margin-bottom:20px;">Our Vision</h2>
          <p>To be the world's most trusted and efficient platform for clinical research, accelerating the timeline from laboratory discoveries to life-saving therapies.</p>
        </div>
        <div class="image-block">
          <div class="placeholder-img" style="overflow: hidden; padding: 0;">
            <img src="/images/about-lab.png" alt="Laboratory" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;" />
          </div>
        </div>
      </div>

      <div class="pillars-grid slide-up delay-2">
        <div class="card pillar-card">
          <mat-icon class="icon">workspace_premium</mat-icon>
          <h3>Research Excellence</h3>
          <p>We partner with leading academic institutions and pharmaceutical companies to ensure every study meets the highest standards of scientific rigor.</p>
        </div>
        <div class="card pillar-card">
          <mat-icon class="icon">health_and_safety</mat-icon>
          <h3>Safety Standards</h3>
          <p>Participant safety is our highest priority. All trials are strictly monitored by independent review boards and follow international medical protocols.</p>
        </div>
        <div class="card pillar-card">
          <mat-icon class="icon">verified_user</mat-icon>
          <h3>Regulatory Compliance</h3>
          <p>Our platform and processes are fully compliant with FDA, EMA, HIPAA, and GDPR regulations to ensure data integrity and patient privacy.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1280px; margin: 0 auto; }
    .page-header {
      background: linear-gradient(135deg, var(--ctms-sidebar) 0%, color-mix(in srgb, var(--ctms-primary) 60%, var(--ctms-sidebar)) 100%);
      color: white;
      padding: 80px 24px;
      text-align: center;
    }
    .page-header h1 { margin: 0 0 16px; font-size: 3rem; font-family: Fraunces, serif; }
    .page-header p { font-size: 1.25rem; opacity: 0.9; margin: 0; max-width: 600px; margin: 0 auto; }
    
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      margin-bottom: 80px;
    }
    @media (max-width: 900px) {
      .content-grid { grid-template-columns: 1fr; }
    }
    
    .section-title { color: var(--ctms-ink); font-family: Fraunces, serif; font-size: 2.2rem; }
    p { line-height: 1.7; color: var(--ctms-ink-soft); font-size: 1.1rem; margin-bottom: 16px; }
    .lead { font-size: 1.3rem; color: var(--ctms-ink); font-weight: 500; }
    
    .placeholder-img {
      background: var(--ctms-bg);
      aspect-ratio: 4/3;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.05);
      border: 1px solid var(--ctms-border);
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }
    .pillar-card {
      padding: 40px 30px;
      text-align: center;
      transition: transform 0.3s;
    }
    .pillar-card:hover { transform: translateY(-5px); box-shadow: 0 14px 28px -18px rgba(0,0,0,0.1); }
    .pillar-card .icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--ctms-primary);
      margin-bottom: 20px;
    }
    .pillar-card h3 { font-size: 1.4rem; margin: 0 0 16px; font-family: Fraunces, serif; }
    .pillar-card p { font-size: 1rem; margin: 0; }
  `]
})
export class AboutComponent {}
