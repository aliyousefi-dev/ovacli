import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-database',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './datasets.page.html',
})
export class DocDatasetsPage {
  SessionType = `- accounts.db #table that contain all user data
- sessions.db #table that contain all session data
- videos.db #table that contain all video data
- spaces.db #table that contain all space data`;
}
