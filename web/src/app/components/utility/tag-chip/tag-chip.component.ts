import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

@Component({
  selector: 'app-tag-chip',
  templateUrl: './tag-chip.component.html',
  standalone: true,
})
export class TagChipComponent {
  @Input() tag!: string;
  @Input() videoId!: string; // receive videoId as input
  @Output() removed = new EventEmitter<string>(); // emit removed tag string

  removing = false;
  removeError = false;

  private ovaSdk = inject(OVASDK);

  removeTag() {
    if (!this.videoId) return;

    this.removing = true;
    this.removeError = false;

    this.ovaSdk.videos.removeVideoTag(this.videoId, this.tag).subscribe({
      next: (res) => {
        this.removing = false;
        this.removed.emit(this.tag); // notify parent that removal succeeded
      },
      error: () => {
        this.removing = false;
        this.removeError = true;
      },
    });
  }
}
