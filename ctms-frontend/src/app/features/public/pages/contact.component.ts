import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ctms-contact',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="page-header fade-in">
      <div class="container">
        <h1>Contact & Support</h1>
        <p>We're here to answer any questions about our clinical trials.</p>
      </div>
    </div>
    
    <div class="container" style="padding: 60px 24px;">
      
      <div class="contact-grid slide-up delay-1">
        
        <div class="contact-info">
          <h2 class="section-title" style="text-align:left;">Get in Touch</h2>
          <p class="subtitle">Reach out to our clinical research coordinators directly.</p>
          
          <div class="info-item">
            <mat-icon>email</mat-icon>
            <div>
              <strong>Email</strong>
              <p>info&#64;ctms-trials.org</p>
            </div>
          </div>
          
          <div class="info-item">
            <mat-icon>phone</mat-icon>
            <div>
              <strong>Phone</strong>
              <p>+1 (800) 555-0199</p>
              <p class="muted">Mon-Fri, 9am - 5pm EST</p>
            </div>
          </div>
          
          <div class="info-item">
            <mat-icon>location_on</mat-icon>
            <div>
              <strong>Headquarters</strong>
              <p>123 Medical Research Blvd<br>Science City, SC 12345</p>
            </div>
          </div>

          <h3 style="margin-top:40px;font-family:Fraunces,serif;font-size:1.5rem;">Help Center</h3>
          <p class="muted">For technical issues with the participant portal, please email <a href="mailto:support@ctms-trials.org">support&#64;ctms-trials.org</a>.</p>
        </div>
        
        <div class="contact-form">
          <div class="card form-card">
            <h3 style="margin:0 0 24px;font-family:Fraunces,serif;font-size:1.8rem;color:var(--ctms-ink);">Send a Message</h3>
            
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="input-control" placeholder="John Doe" />
            </div>
            
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" class="input-control" placeholder="john@example.com" />
            </div>
            
            <div class="form-group">
              <label>Message</label>
              <textarea class="input-control" placeholder="How can we help you today?" style="height:120px;resize:vertical;"></textarea>
            </div>
            
            <button class="btn btn-primary">Send Message</button>
          </div>
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
    
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .contact-grid { grid-template-columns: 1fr; }
    }

    .section-title { font-size: 2.5rem; font-family: Fraunces, serif; margin: 0 0 12px; color: var(--ctms-ink); }
    .subtitle { font-size: 1.2rem; color: var(--ctms-ink-soft); margin: 0 0 40px; }

    .info-item { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 30px; }
    .info-item mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--ctms-primary); margin-top: 4px; }
    .info-item strong { font-size: 1.2rem; color: var(--ctms-ink); display: block; margin-bottom: 4px; font-family: Fraunces, serif; }
    .info-item p { margin: 0; color: var(--ctms-ink-soft); font-size: 1.05rem; line-height: 1.5; }
    .info-item .muted { font-size: 0.9rem; margin-top: 4px; }

    .form-card { padding: 40px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
    .form-group { margin-bottom: 24px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 8px; color: var(--ctms-ink); }
    .input-control { width: 100%; padding: 14px; border: 1px solid var(--ctms-border); border-radius: 8px; font-family: inherit; font-size: 1rem; color: var(--ctms-ink); background: var(--ctms-bg); transition: border-color 0.2s; }
    .input-control:focus { outline: none; border-color: var(--ctms-primary); }
    
    .btn { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.1rem; text-decoration: none; border-radius: 8px; transition: all 0.2s; cursor: pointer; padding: 14px 28px; width: 100%; border: none; font-family: inherit; }
    .btn-primary { background: var(--ctms-primary); color: white; }
    .btn-primary:hover { background: color-mix(in srgb, var(--ctms-primary) 80%, black); }
  `]
})
export class ContactComponent {}
