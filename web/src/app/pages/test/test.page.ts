import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-page',
  standalone: true,
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.css'],
  imports: [CommonModule],
})
export class TestPage implements AfterViewInit {
  constructor() {}

  @ViewChild('someElement') someElement!: ElementRef;

  ngAfterViewInit(): void {
    setTimeout(() => {
      console.log(
        'Delayed check:',
        this.someElement.nativeElement.getBoundingClientRect()
      );
    }, 1000);
  }
}
