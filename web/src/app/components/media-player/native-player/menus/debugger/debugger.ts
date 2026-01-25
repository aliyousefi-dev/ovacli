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
import { PlayerUIService } from '../../services/player-ui.service';
import { PlayerStateService } from '../../services/player-state.service';

@Component({
  selector: 'app-debugger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Assuming the template is full-screen-button.component.html or full-screen-button.html
  templateUrl: './debugger.html',
})
export class ScreenDebugger implements AfterViewInit, OnInit, OnDestroy {
  enableDebugger: boolean = false;

  currentTime: number = 0;
  volume: number = 0;
  isMuted: boolean = false;
  speed: number = 1;
  duration: number = 0;
  isPlaying: boolean = false;
  resolution: string = '';
  buffered: number = 0;

  private playerUi = inject(PlayerUIService);
  playerState = inject(PlayerStateService);

  ngOnInit(): void {
    this.playerUi.debuggerMenuVisible$.subscribe((visible) => {
      this.enableDebugger = visible;
    });
  }

  ngAfterViewInit() {
    console.log('debugger view init');
  }

  ngOnDestroy() {}
}
