import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalVideosComponent } from './panels/global-videos/global-videos.component';
import { GlobalSpacesComponent } from './panels/global-spaces/global-spaces.component';
import { GlobalFilters } from '../../components/blocks/global-filters/global-filters';

@Component({
  selector: 'app-global-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlobalVideosComponent,
    GlobalFilters,
    GlobalSpacesComponent,
  ],
  templateUrl: './global.page.html',
})
export class GlobalPage {}
