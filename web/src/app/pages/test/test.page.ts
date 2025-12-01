import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-page',
  standalone: true,
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.css'],
  imports: [CommonModule],
})
export class TestPage {}
