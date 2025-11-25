import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-output-pin',
  templateUrl: './output-pin.html',
  styleUrls: ['./output-pin.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class OutputPin {
  @Input() pinLabel!: string;
}
