import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';
import { TagChipComponent } from '../../../components/etc/tag-chip/tag-chip.component';

@Component({
  selector: 'app-tag-management-panel', // Changed selector
  standalone: true,
  imports: [CommonModule, FormsModule, TagChipComponent],
  templateUrl: './tag-management-panel.component.html',
  styles: [],
})
export class TagManagementPanelComponent {
  // Changed class name
  @Input() videoId!: string;
  @Input() currentTags: string[] = [];
  @Output() tagsUpdated = new EventEmitter<string[]>();

  newTag: string = '';
  updatingTags = false;
  tagUpdateError = false;

  private ovaSdk = inject(OVASDK);

  addTag() {
    const tag = this.newTag.trim();
    if (!tag || !this.videoId) return;

    if (this.currentTags.includes(tag)) {
      this.newTag = '';
      return;
    }

    this.updatingTags = true;
    this.tagUpdateError = false;

    this.ovaSdk.videos.addVideoTag(this.videoId, tag).subscribe({
      next: (res) => {
        this.tagsUpdated.emit(res.data.tags);
        this.newTag = '';
        this.updatingTags = false;
      },
      error: () => {
        this.updatingTags = false;
        this.tagUpdateError = true;
      },
    });
  }

  onTagRemoved(removedTag: string) {
    if (!this.videoId) return;

    this.updatingTags = true;
    this.tagUpdateError = false;

    this.ovaSdk.videos.removeVideoTag(this.videoId, removedTag).subscribe({
      next: (res) => {
        this.tagsUpdated.emit(res.data.tags);
        this.updatingTags = false;
      },
      error: () => {
        this.updatingTags = false;
        this.tagUpdateError = true;
      },
    });
  }
}
