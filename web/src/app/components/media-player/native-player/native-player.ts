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
import { PlaylistButton } from './controls/buttons/playlist-button/playlist-button';
import { formatTime } from './utils/formatTime';
import { PlaylistMenu } from './menus/playlist-menu/playlist-menu';
import { NextVideoButton } from './controls/buttons/next-video-button/next-video-button';

import { OVASDK } from '../../../../ova-angular-sdk/ova-sdk';

import { PlayerInputHostDirective } from './input-directive';
import { LocalStorageService } from './services/local-stroage.service';

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
    NextVideoButton,
    ScreenDebugger,
    MarkerDisplay,
    SettingsButton,
    TimeTagButton,
    PlaylistButton,
    TouchScreen,
    PlaylistMenu,
    DisplayNearTimeTag,
  ],
  providers: [
    FullScreenService,
    InteractionService,
    LocalStorageService,
    MenuService,
    ScrubService,
    StateService,
    TimeTagService,
  ],
})
export class NativePlayer implements AfterViewInit, OnInit, OnDestroy {
  @Input() videoData!: VideoData;
  @Input() playlistVideos: VideoData[] = [];

  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerWrap') playerWrap!: ElementRef<HTMLDivElement>;
  @ViewChild('mainTimelineRef') mainTimelineRef!: MainTimeline;

  formatTime = formatTime;

  videoReady = false;
  controlsVisible = false;
  overlayVisible = false;
  isPaused = true;
  uiVisible = true;

  private hideControlsTimeout: any;
  private overlayTimeout: any;
  private tapTimeout: any;

  private playerState = inject(StateService);
  private timeTagService = inject(TimeTagService);
  private scrubTimeline = inject(ScrubService);
  playerUi = inject(MenuService);
  fullscreenService = inject(FullScreenService);
  interactionService = inject(InteractionService);
  localstorage = inject(LocalStorageService);
  private ovaSdk = inject(OVASDK);

  horizontalFlipped: boolean = false;

  ngOnInit(): void {
    this.interactionService.uiControlsVisibility$.subscribe((visible) => {
      this.controlsVisible = visible;
    });

    this.interactionService.uiVisibility$.subscribe((visible) => {
      this.uiVisible = visible;
    });

    this.localstorage.settings$.subscribe((s) => {
      this.horizontalFlipped = s.horizontalFlip;
    });
  }

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;

    this.playerState.init(this.videoRef);
    this.playerState.setSource(this.videoData);
    this.playerState.setPlaylistTracks(this.playlistVideos);
    this.playerUi.init();
    this.interactionService.init();
    this.fullscreenService.init(this.playerWrap);
    this.timeTagService.init();
    this.scrubTimeline.init();

    console.log('natvie view init');
    if (video.readyState >= 1) {
      this.initVideoState();
    } else {
      video.addEventListener('loadedmetadata', () => this.initVideoState());
    }
  }

  private initVideoState() {
    this.videoReady = true;
  }

  getThumbnailUrl(videoId: string) {
    return this.ovaSdk.assets.thumbnail(videoId);
  }

  ngOnDestroy() {
    clearTimeout(this.hideControlsTimeout);
    clearTimeout(this.overlayTimeout);
    clearTimeout(this.tapTimeout);
  }
}
