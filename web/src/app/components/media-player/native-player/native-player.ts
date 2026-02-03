import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData } from '../../../../ova-angular-sdk/core-types/video-data';
import { PlayPauseButton } from './controls/buttons/play-pause-button/play-pause-button';
import { VolumeButton } from './controls/volume-button/volume-button';
import { DisplayCurrentTime } from './controls/display-current-time/display-current-time';
import { DisplayTotalTime } from './controls/display-total-time/display-total-time';
import { MainTimeline } from './controls/timeline/main-timeline';
import { MarkerDisplay } from './menus/marker-display/marker-display';
import { FullScreenButton } from './controls/buttons/full-screen/full-screen-button';
import { SettingsButton } from './controls/buttons/settings-button/settings-button';
import { ScreenDebugger } from './menus/debugger/debugger';
import { TimeTagButton } from './controls/buttons/time-tag-button/time-tag-button';
import { StateService } from './services/state.service';
import { MenuService } from './services/menu.service';
import { TimeTagService } from './services/time-tag.service';
import { ScrubService } from './services/scrub.service';
import { TouchScreen } from './touch-screen/touch-screen';
import { DisplayNearTimeTag } from './controls/display-near-time-tag/display-near-time-tag';
import { FullScreenService } from './services/fullscreen.service';
import { InteractionService } from './services/interaction.service';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

import { PlayerInputHostDirective } from './input-directive';

@Component({
  selector: 'app-native-player',
  standalone: true,
  templateUrl: './native-player.html',
  imports: [
    CommonModule,
    PlayPauseButton,
    VolumeButton,
    DisplayCurrentTime,
    DisplayTotalTime,
    MainTimeline,
    PlayerInputHostDirective,
    FullScreenButton,
    ScreenDebugger,
    MarkerDisplay,
    SettingsButton,
    TimeTagButton,
    TouchScreen,
    DisplayNearTimeTag,
  ],
})
export class NativePlayer implements AfterViewInit, OnInit, OnDestroy {
  @Input() videoData!: VideoData;

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerWrap') playerWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('mainTimelineRef') mainTimelineRef!: MainTimeline;

  videoReady = false;
  controlsVisible = false;
  overlayVisible = false;
  isPaused = true;

  private hideControlsTimeout: any;
  private overlayTimeout: any;
  private tapTimeout: any;

  private playerState = inject(StateService);
  private timeTagService = inject(TimeTagService);
  private scrubTimeline = inject(ScrubService);
  playerUi = inject(MenuService);
  fullscreenService = inject(FullScreenService);
  interactionService = inject(InteractionService);
  private ovaSdk = inject(OVASDK);

  ngOnInit(): void {
    this.interactionService.uiControlsVisibility$.subscribe((visible) => {
      this.controlsVisible = visible;
    });
  }

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;

    this.playerState.init(this.videoRef);
    this.playerUi.init();
    this.interactionService.init();
    this.fullscreenService.init(this.playerWrap);
    this.timeTagService.init(this.videoData.videoId);
    this.scrubTimeline.init(this.videoData.videoId);

    console.log('natvie view init');
    // Handle metadata loading for markers/timeline
    if (video.readyState >= 1) {
      this.initVideoState();
    } else {
      video.addEventListener('loadedmetadata', () => this.initVideoState());
    }
  }

  private initVideoState() {
    this.videoReady = true;
  }

  get videoUrl() {
    return this.ovaSdk.assets.stream(this.videoData.videoId);
  }
  get thumbnailUrl() {
    return this.ovaSdk.assets.thumbnail(this.videoData.videoId);
  }

  ngOnDestroy() {
    clearTimeout(this.hideControlsTimeout);
    clearTimeout(this.overlayTimeout);
    clearTimeout(this.tapTimeout);
  }
}
