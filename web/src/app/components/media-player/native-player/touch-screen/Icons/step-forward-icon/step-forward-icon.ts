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

@Component({
  selector: 'app-step-forward-icon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Assuming the template is full-screen-button.component.html or full-screen-button.html
  templateUrl: './step-forward-icon.html',
})
export class StepForwardIcon implements AfterViewInit, OnInit, OnDestroy {
  ngOnInit(): void {}

  ngAfterViewInit() {}

  ngOnDestroy() {}
}
