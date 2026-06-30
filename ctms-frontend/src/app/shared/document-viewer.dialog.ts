import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface DocumentViewerData {
  title: string;
  documentUrl: string;
  token: string;
}

@Component({
  selector: 'ctms-document-viewer-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="pdf-viewer-container">
      <div class="pdf-toolbar">
        <div class="pdf-toolbar-left">
          <mat-icon class="pdf-icon">{{ isImage ? 'image' : 'picture_as_pdf' }}</mat-icon>
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
        @if (isImage) {
          <div class="image-container">
            <img [src]="safeDocumentUrl" [alt]="data.title" class="doc-image" />
          </div>
        } @else {
          <iframe [src]="safeDocumentUrl" class="pdf-iframe" title="Document Viewer"></iframe>
        }
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
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .image-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #2a2c2e;
      overflow: auto;
    }

    .doc-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  `],
})
export class DocumentViewerDialogComponent {
  readonly data = inject<DocumentViewerData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<DocumentViewerDialogComponent>);
  private readonly sanitizer = inject(DomSanitizer);

  readonly safeDocumentUrl: SafeResourceUrl;
  readonly isImage: boolean;

  constructor() {
    const lowerTitle = (this.data.title || '').toLowerCase();
    this.isImage = lowerTitle.endsWith('.jpg') || lowerTitle.endsWith('.jpeg') || lowerTitle.endsWith('.png');
    
    // Build the URL with token as a query param
    const separator = this.data.documentUrl.includes('?') ? '&' : '?';
    const urlWithToken = `${this.data.documentUrl}${separator}token=${this.data.token}`;
    this.safeDocumentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithToken);
  }

  download(): void {
    const separator = this.data.documentUrl.includes('?') ? '&' : '?';
    const url = `${this.data.documentUrl}${separator}token=${this.data.token}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = this.data.title || 'document';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  print(): void {
    if (this.isImage) {
      const imgUrl = `${this.data.documentUrl}${this.data.documentUrl.includes('?') ? '&' : '?'}token=${this.data.token}`;
      const printWin = window.open('');
      if (printWin) {
        printWin.document.write(`<html><body><img src="${imgUrl}" style="max-width:100%;"></body></html>`);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          printWin.print();
          printWin.close();
        }, 500);
      }
    } else {
      const iframe = document.querySelector('.pdf-iframe') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.print();
      }
    }
  }

  close(): void {
    this.ref.close();
  }
}
