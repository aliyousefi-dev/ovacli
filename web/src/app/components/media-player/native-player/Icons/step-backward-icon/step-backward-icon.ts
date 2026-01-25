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
  selector: 'app-step-backward-icon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // Assuming the template is full-screen-button.component.html or full-screen-button.html
  templateUrl: './step-backward-icon.html',
})
export class ScreenDebugger implements AfterViewInit, OnInit, OnDestroy {
  ngOnInit(): void {}

  rewindVisible: boolean = true;

  ngAfterViewInit() {
    console.log('debugger view init');
  }

  ngOnDestroy() {}
}
