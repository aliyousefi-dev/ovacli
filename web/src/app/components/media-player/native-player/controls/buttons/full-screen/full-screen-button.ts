// src/app/components/default-video-player/controls/full-screen-button/full-screen-button.component.ts

import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerUIService } from '../../../services/player-ui.service';

@Component({
  selector: 'app-full-screen-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './full-screen-button.html',
})
export class FullScreenButton implements OnInit, OnDestroy {
  private playerUI = inject(PlayerUIService);

  isFullscreen: boolean = false;

  ngOnInit() {
    this.playerUI.fullscreenEnabled$.subscribe((e) => {
      this.isFullscreen = e;
    });
  }

  ngOnDestroy() {}

  toggleFullscreen() {
    this.playerUI.toggleFullscreen();
  }
}
