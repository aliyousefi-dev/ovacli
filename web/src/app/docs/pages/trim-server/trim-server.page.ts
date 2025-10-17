import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-trim-server',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './trim-server.page.html',
})
export class DocTrimServerPage {
  trimserver = `ovacli trimserver --ip <TRIM_SERVER_IP>`;
}
