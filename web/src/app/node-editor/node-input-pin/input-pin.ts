import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICanvasNodePin } from '../interfaces/ICanvasNodePin';

@Component({
  selector: 'node-input-pin',
  templateUrl: './input-pin.html',
  styleUrls: ['./input-pin.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class NodeInputPin {
  @Input() pinData!: ICanvasNodePin;
}
