import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'app-doc-checksum-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './cooking.page.html',
})
export class DocCookingPage {
  Process = `- Generate playback storyboard`;
}
