import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-tag-link',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tag-link.component.html',
})
export class TagLinkComponent {
  @Input() tag!: string;

  private router = inject(Router);

  onClick() {
    this.router.navigate(['/search'], { queryParams: { tags: this.tag } });
  }
}
