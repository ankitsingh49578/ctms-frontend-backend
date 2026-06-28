import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface PdfViewerData {
  title: string;
  pdfUrl: string;
  token: string;
}

@Component({
  selector: 'ctms-pdf-viewer-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pdf-viewer-container">
      <div class="pdf-toolbar">
        <div class="pdf-toolbar-left">
          <mat-icon class="pdf-icon">picture_as_pdf</mat-icon>
          <span class="pdf-title">{{ data.title }}</span>
        </div>
        <div class="pdf-toolbar-right">
          <button mat-icon-button (click)="download()" matTooltip="Download">
            <mat-icon>download</mat-icon>
          </button>
          <button mat-icon-button (click)="print()" matTooltip="Print">
            <mat-icon>print</mat-icon>
          </button>
          <button mat-icon-button (click)="close()" matTooltip="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      <div class="pdf-content">
        <iframe [src]="safePdfUrl" class="pdf-iframe" title="Consent Document"></iframe>
      </div>
    </div>
  `,
  styles: [`
    .pdf-viewer-container {
      display: flex;
      flex-direction: column;
      height: 85vh;
      width: 100%;
    }

    .pdf-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: linear-gradient(135deg, #005a80, #00364d);
      color: white;
      border-radius: 8px 8px 0 0;
      min-height: 48px;
    }

    .pdf-toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow: hidden;
    }

    .pdf-icon {
      color: #ff6b6b;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .pdf-title {
      font-weight: 600;
      font-size: 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pdf-toolbar-right {
      display: flex;
      gap: 4px;
    }

    .pdf-toolbar-right button {
      color: rgba(255,255,255,0.9);
    }
    .pdf-toolbar-right button:hover {
      color: white;
      background: rgba(255,255,255,0.15);
    }

    .pdf-content {
      flex: 1;
      background: #525659;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
    }

    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `],
})
export class PdfViewerDialogComponent {
  readonly data = inject<PdfViewerData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<PdfViewerDialogComponent>);
  private readonly sanitizer = inject(DomSanitizer);

  readonly safePdfUrl: SafeResourceUrl;

  constructor() {
    // Build the URL with token as a query param for the iframe
    const separator = this.data.pdfUrl.includes('?') ? '&' : '?';
    const urlWithToken = `${this.data.pdfUrl}${separator}token=${this.data.token}`;
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithToken);
  }

  download(): void {
    const separator = this.data.pdfUrl.includes('?') ? '&' : '?';
    const url = `${this.data.pdfUrl}${separator}token=${this.data.token}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = this.data.title || 'consent-document.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  print(): void {
    const iframe = document.querySelector('.pdf-iframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  }

  close(): void {
    this.ref.close();
  }
}
