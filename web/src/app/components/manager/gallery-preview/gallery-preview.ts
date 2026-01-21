import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GalleryContainer } from '../../../../ova-angular-sdk/core-types/video-gallery';

@Component({
  selector: 'gallery-preview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gallery-preview.html',
})
export class GalleryPreview implements OnInit {
  @Input() container!: GalleryContainer;

  infiniteMode = true;

  ngOnInit(): void {}
}
