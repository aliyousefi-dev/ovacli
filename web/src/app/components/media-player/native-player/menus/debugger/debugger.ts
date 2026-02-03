import {
  Component,
  AfterViewInit,
  OnInit,
  OnDestroy,
  inject,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { VideoData } from '../../../../../../ova-angular-sdk/core-types/video-data';
import { TimeTagService } from '../../services/time-tag.service';

@Component({
  selector: 'app-debugger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Assuming the template is full-screen-button.component.html or full-screen-button.html
  templateUrl: './debugger.html',
})
export class ScreenDebugger implements AfterViewInit, OnInit, OnDestroy {
  @Input() videoData!: VideoData;

  enableDebugger: boolean = false;
  timeTagsCount: number = 0;

  playerState = inject(StateService);
  timeTagService = inject(TimeTagService);

  ngOnInit(): void {
    this.timeTagService.timeTags$.subscribe((data) => {
      this.timeTagsCount = data.length;
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {}
}
