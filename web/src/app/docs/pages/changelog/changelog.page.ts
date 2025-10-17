import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodePreviewComponent } from '../../code-preview/code-preview';

@Component({
  selector: 'doc-changelog',
  standalone: true,
  imports: [CommonModule, FormsModule, CodePreviewComponent],
  templateUrl: './changelog.page.html',
})
export class DocChangelogPage {
  Version01 = `- Initial release of the application.
- Added changelog page.
- Improved performance of video loading.
- Fixed bug with video playback controls.
- Added support for new video formats.`;

  Version02 = `
  - Initial release of the application.
  - Added changelog page.
  - Improved performance of video loading.
  - Fixed bug with video playback controls.
  - Added support for new video formats.
  `;
}
