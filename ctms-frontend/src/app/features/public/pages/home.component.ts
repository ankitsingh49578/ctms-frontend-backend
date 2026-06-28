import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ctms-home',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="hero">
      <div class="container hero-container">
        <div class="hero-content slide-up">
          <h1>Advance Medical Research. Change Lives.</h1>
          <p>Join clinical trials and help shape the future of medicine. Discover cutting-edge treatments and make a difference.</p>
          <div class="hero-actions">
            <a routerLink="/trials" class="btn btn-primary btn-lg">Browse Clinical Trials</a>
            <a routerLink="/register" class="btn btn-outline btn-lg">Join As Participant</a>
          </div>
        </div>
        <div class="hero-image fade-in delay-2">
          <div class="hero-illustration">
            <img src="/images/home-hero.png" alt="Medical Research Team" />
          </div>
        </div>
      </div>
    </div>

    <section class="statistics slide-up delay-1">
      <div class="container">
        <div class="grid grid--stats stat-grid">
          <div class="stat-card">
            <div class="stat-val">120+</div>
            <div class="stat-label">Active Trials</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">5,000+</div>
            <div class="stat-label">Participants Enrolled</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">45</div>
            <div class="stat-label">Research Centers</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">98%</div>
            <div class="stat-label">Success Rate</div>
          </div>
        </div>
      </div>
    </section>

    <section class="benefits slide-up delay-2">
      <div class="container">
        <h2 class="section-title">Why Participate?</h2>
        <div class="grid grid--cards">
          <div class="card benefit-card card--hover">
            <mat-icon class="icon">science</mat-icon>
            <h3>Access New Treatments</h3>
            <p>Gain access to new treatments before they are widely available to the public.</p>
          </div>
          <div class="card benefit-card card--hover">
            <mat-icon class="icon">medical_services</mat-icon>
            <h3>Expert Medical Care</h3>
            <p>Receive regular and careful medical attention from leading healthcare professionals.</p>
          </div>
          <div class="card benefit-card card--hover">
            <mat-icon class="icon">payments</mat-icon>
            <h3>Compensation Opportunities</h3>
            <p>Receive compensation for your time and travel while participating in the study.</p>
          </div>
          <div class="card benefit-card card--hover">
            <mat-icon class="icon">volunteer_activism</mat-icon>
            <h3>Contribute To Science</h3>
            <p>Contribute to medical research that can save lives and improve health for future generations.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="process slide-up delay-3">
      <div class="container">
        <h2 class="section-title">How It Works</h2>
        <div class="process-steps">
          <div class="step">
            <div class="step-num">1</div>
            <h3>Create Account</h3>
            <p>Sign up securely and complete your basic health profile.</p>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <h3>Find Trial</h3>
            <p>Browse our database of active clinical trials that match your profile.</p>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <h3>Enroll</h3>
            <p>Apply for a trial and go through the screening and consent process.</p>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <h3>Participate</h3>
            <p>Attend visits, receive care, and track your progress in the portal.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="faq slide-up delay-4">
      <div class="container">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-grid">
          <div class="faq-card">
            <h4>What is a clinical trial?</h4>
            <p>A clinical trial is a research study conducted with human volunteers to evaluate new medical treatments, drugs, or devices for safety and effectiveness.</p>
          </div>
          <div class="faq-card">
            <h4>Are clinical trials safe?</h4>
            <p>Yes, all clinical trials are strictly regulated by health authorities and an Institutional Review Board (IRB) to ensure participant safety is the top priority.</p>
          </div>
          <div class="faq-card">
            <h4>Can I leave a trial after it starts?</h4>
            <p>Absolutely. Your participation is completely voluntary. You can withdraw from a study at any time, for any reason, without any penalty to your standard medical care.</p>
          </div>
          <div class="faq-card">
            <h4>Will I be compensated?</h4>
            <p>Many trials offer compensation for your time and travel expenses. Specific details are provided in the trial's informed consent document before you join.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section slide-up delay-5">
      <div class="container">
        <h2>Join Clinical Research Today</h2>
        <p>Your participation could be the key to the next medical breakthrough.</p>
        <div class="cta-actions">
          <a routerLink="/register" class="btn btn-primary btn-lg">Register Now</a>
          <a routerLink="/trials" class="btn btn-outline-dark btn-lg">Browse Trials</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
    
    .hero {
      background: linear-gradient(135deg, var(--ctms-sidebar, #0f1f2c) 0%, color-mix(in srgb, var(--ctms-primary) 50%, #0f1f2c) 100%);
      color: white;
      padding: 100px 0;
      position: relative;
      overflow: hidden;
    }
    .hero-container {
      display: grid;
      gap: 40px;
      align-items: center;
    }
    @media (min-width: 900px) {
      .hero-container { grid-template-columns: 1fr 1fr; }
    }
    .hero-content h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin: 0 0 24px;
      line-height: 1.1;
      letter-spacing: -0.02em;
    }
    .hero-content p {
      font-size: 1.25rem;
      margin: 0 0 40px;
      opacity: 0.9;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .btn { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; text-decoration: none; border-radius: 8px; transition: all 0.2s; cursor: pointer; }
    .btn-lg { padding: 14px 28px; font-size: 1.1rem; }
    .btn-primary { background: var(--ctms-primary); color: white; border: 2px solid var(--ctms-primary); }
    .btn-primary:hover { background: color-mix(in srgb, var(--ctms-primary) 80%, black); border-color: color-mix(in srgb, var(--ctms-primary) 80%, black); }
    .btn-outline { border: 2px solid white; color: white; background: transparent; }
    .btn-outline:hover { background: white; color: var(--ctms-sidebar); }
    .btn-outline-dark { border: 2px solid var(--ctms-ink); color: var(--ctms-ink); background: transparent; }
    .btn-outline-dark:hover { background: var(--ctms-ink); color: white; }

    .hero-illustration {
      width: 100%;
      aspect-ratio: 4/3;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.1);
      overflow: hidden;
      display: flex;
    }
    
    .hero-illustration img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      color: var(--ctms-ink);
      margin-bottom: 50px;
      font-family: Fraunces, Georgia, serif;
    }

    .statistics { padding: 60px 0; background: var(--ctms-surface); border-bottom: 1px solid var(--ctms-border); }
    .stat-grid { text-align: center; }
    .stat-card { padding: 20px; }
    .stat-val { font-size: 2.5rem; font-weight: 800; color: var(--ctms-primary); font-family: Fraunces, serif; margin-bottom: 8px; }
    .stat-label { font-size: 1rem; color: var(--ctms-ink-soft); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

    .benefits { padding: 80px 0; background: var(--ctms-bg); }
    .benefit-card { text-align: center; padding: 40px 30px; }
    .benefit-card .icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 24px; color: var(--ctms-primary); }
    .benefit-card h3 { font-size: 1.4rem; margin: 0 0 16px; }
    .benefit-card p { color: var(--ctms-ink-soft); line-height: 1.6; margin: 0; }

    .process { padding: 80px 0; background: var(--ctms-surface); }
    .process-steps { display: grid; gap: 30px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .step { text-align: center; position: relative; padding: 20px; }
    .step-num { width: 60px; height: 60px; border-radius: 50%; background: var(--ctms-primary-bg, #e3f1f8); color: var(--ctms-primary); font-size: 1.5rem; font-weight: 800; display: grid; place-items: center; margin: 0 auto 20px; border: 2px solid var(--ctms-primary); }
    .step h3 { margin: 0 0 12px; font-size: 1.3rem; }
    .step p { color: var(--ctms-ink-soft); line-height: 1.5; margin: 0; }

    .faq { padding: 80px 0; background: var(--ctms-bg); }
    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .faq-card {
      background: var(--ctms-surface);
      padding: 32px;
      border-radius: 12px;
      border: 1px solid var(--ctms-border);
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .faq-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.06);
    }
    .faq-card h4 { margin: 0 0 12px; font-size: 1.25rem; font-family: Fraunces, serif; color: var(--ctms-ink); }
    .faq-card p { margin: 0; color: var(--ctms-ink-soft); line-height: 1.6; font-size: 1rem; }

    .cta-section { padding: 100px 0; background: var(--ctms-surface); text-align: center; border-top: 1px solid var(--ctms-border); }
    .cta-section h2 { font-size: 2.8rem; margin: 0 0 20px; font-family: Fraunces, serif; }
    .cta-section p { font-size: 1.2rem; color: var(--ctms-ink-soft); margin: 0 0 40px; }
    .cta-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  `]
})
export class HomeComponent {}
