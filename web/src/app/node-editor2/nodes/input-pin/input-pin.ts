import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-pin',
  templateUrl: './input-pin.html',
  styleUrls: ['./input-pin.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class InputPin {
  @Input() pinLabel!: string;
}
