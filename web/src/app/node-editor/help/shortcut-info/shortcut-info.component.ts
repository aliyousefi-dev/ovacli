import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shortcut-info',
  // Note: The positioning classes (absolute top-5 left-5) are included
  // in the host element here to keep the component self-contained and easy to place.

  standalone: true,
  imports: [CommonModule],
  templateUrl: './shortcut-info.component.html',
})
export class ShortcutInfo {}
