import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'ctms-public-trials',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatChipsModule],
  template: `
    <div class="page-header fade-in">
      <div class="container">
        <h1>Available Clinical Trials</h1>
        <p>Explore ongoing research studies you can join today.</p>
      </div>
    </div>
    
    <div class="container" style="padding: 60px 24px;">
      <div class="layout-grid slide-up delay-1">
        
        <aside class="filters-panel">
          <div class="card">
            <h3 class="filter-title"><mat-icon>filter_list</mat-icon> Filters</h3>
            
            <div class="filter-group">
              <label>Study Phase</label>
              <mat-chip-listbox multiple>
                <mat-chip-option>Phase I</mat-chip-option>
                <mat-chip-option>Phase II</mat-chip-option>
                <mat-chip-option selected>Phase III</mat-chip-option>
                <mat-chip-option>Phase IV</mat-chip-option>
              </mat-chip-listbox>
            </div>
            
            <div class="filter-group">
              <label>Status</label>
              <mat-chip-listbox multiple>
                <mat-chip-option selected>Recruiting</mat-chip-option>
                <mat-chip-option>Planned</mat-chip-option>
              </mat-chip-listbox>
            </div>
            
            <div class="filter-group">
              <label>Location</label>
              <select class="form-select">
                <option>All Locations</option>
                <option>New York, NY</option>
                <option>Boston, MA</option>
                <option>Chicago, IL</option>
              </select>
            </div>
          </div>
        </aside>

        <div class="trials-list">
          <div class="results-header">
            <p>Showing <strong>{{ mockTrials.length }}</strong> active trials</p>
          </div>
          
          <div class="trials-grid">
            @for (trial of mockTrials; track trial.id) {
              <div class="card trial-card card--hover">
                <div class="trial-card-header">
                  <span class="badge">{{ trial.phase }}</span>
                  <span class="status-badge"><mat-icon>check_circle</mat-icon> Recruiting</span>
                </div>
                <h3>{{ trial.title }}</h3>
                <p class="trial-desc">{{ trial.description }}</p>
                
                <div class="eligibility-summary">
                  <mat-icon>person_search</mat-icon>
                  <span>{{ trial.eligibility }}</span>
                </div>
                
                <div class="trial-card-footer">
                  <div class="location"><mat-icon>location_on</mat-icon> {{ trial.location }}</div>
                  <a routerLink="/register" class="btn btn-outline">Learn More</a>
                </div>
              </div>
            }
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

    .layout-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 40px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .layout-grid { grid-template-columns: 1fr; }
    }

    .filters-panel .card { padding: 24px; }
    .filter-title { display: flex; align-items: center; gap: 8px; margin: 0 0 24px; font-family: Fraunces, serif; font-size: 1.4rem; color: var(--ctms-ink); border-bottom: 1px solid var(--ctms-border); padding-bottom: 16px; }
    .filter-group { margin-bottom: 24px; }
    .filter-group label { display: block; font-weight: 600; margin-bottom: 12px; color: var(--ctms-ink); }
    .form-select { width: 100%; padding: 10px; border: 1px solid var(--ctms-border); border-radius: 8px; font-family: inherit; font-size: 1rem; color: var(--ctms-ink); }

    .results-header { margin-bottom: 24px; color: var(--ctms-ink-soft); }

    .trials-grid { display: grid; gap: 24px; }
    .trial-card { padding: 24px; display: flex; flex-direction: column; }
    .trial-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    
    .badge { background: var(--ctms-primary-bg, #e3f1f8); color: var(--ctms-primary); padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 700; }
    .status-badge { display: flex; align-items: center; gap: 4px; color: var(--ctms-success); font-size: 0.85rem; font-weight: 600; }
    .status-badge mat-icon { font-size: 16px; width: 16px; height: 16px; }
    
    .trial-card h3 { margin: 0 0 12px; color: var(--ctms-ink); font-size: 1.4rem; font-family: Fraunces, serif; }
    .trial-desc { color: var(--ctms-ink-soft); font-size: 1rem; line-height: 1.6; margin: 0 0 20px; flex-grow: 1; }
    
    .eligibility-summary { display: flex; align-items: flex-start; gap: 8px; background: var(--ctms-bg); padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; color: var(--ctms-ink-soft); }
    .eligibility-summary mat-icon { color: var(--ctms-primary); font-size: 20px; width: 20px; height: 20px; }

    .trial-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--ctms-border); padding-top: 20px; margin-top: auto; }
    .location { display: flex; align-items: center; gap: 4px; color: var(--ctms-ink-soft); font-size: 0.9rem; }
    .location mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .btn { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; text-decoration: none; border-radius: 8px; transition: all 0.2s; cursor: pointer; padding: 10px 20px; }
    .btn-outline { border: 1px solid var(--ctms-primary); color: var(--ctms-primary); background: transparent; }
    .btn-outline:hover { background: var(--ctms-primary); color: white; }
  `]
})
export class PublicTrialsComponent {
  mockTrials = [
    { id: 1, title: 'Cardiovascular Risk Reduction Study', phase: 'Phase III', location: 'Multiple Centers', eligibility: 'Adults aged 45-80 with a history of hypertension.', description: 'Testing a new medication to reduce the risk of heart attacks in high-risk patients. Requires monthly in-person clinic visits.' },
    { id: 2, title: 'Type 2 Diabetes Management', phase: 'Phase II', location: 'Boston, MA', eligibility: 'Adults aged 18-65 diagnosed with Type 2 Diabetes within the last 5 years.', description: 'Evaluating a novel oral therapeutic for blood glucose control. Includes free glucose monitoring supplies.' },
    { id: 3, title: 'Seasonal Allergy Relief', phase: 'Phase IV', location: 'Chicago, IL', eligibility: 'Adults and adolescents aged 12+ suffering from severe seasonal allergies.', description: 'Observational study of a newly approved antihistamine for seasonal allergies. Remote participation available.' }
  ];
}
