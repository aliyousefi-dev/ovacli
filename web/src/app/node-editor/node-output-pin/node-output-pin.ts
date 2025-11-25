import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICanvasNodePin } from '../interfaces/ICanvasNodePin';

@Component({
  selector: 'node-output-pin',
  templateUrl: './node-output-pin.html',
  styleUrls: ['./node-output-pin.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class NodeOutputPin {
  @Input() pinData!: ICanvasNodePin;
}
