import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../../services/state.service';

@Component({
  selector: 'app-play-pause-icon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Assuming the template is full-screen-button.component.html or full-screen-button.html
  templateUrl: './play-pause-icon.html',
})
export class PlayPauseIcon implements AfterViewInit, OnInit, OnDestroy {
  playerState = inject(StateService);
  isPlaying: boolean = false;
  playPauseVisible: boolean = true;

  ngOnInit(): void {
    this.playerState.isPlaying$.subscribe((p) => {
      this.isPlaying = p;
    });
  }
  ngAfterViewInit() {}

  ngOnDestroy() {}
}
