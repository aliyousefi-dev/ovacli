import { IPosition } from './position.interface';
import { ICanvasNodePin } from './canvas-node-pin.interface';

export interface ICanvasNode {
  id: string;
  label: string;
  isSelected: boolean;
  position: IPosition;
  width: number;
  height: number;
  inputPins: ICanvasNodePin[];
  outputPins: ICanvasNodePin[];
  zIndex: number;
}
