import { IPosition } from './IPosition';
import { ICanvasNodePin } from './ICanvasNodePin';

export interface ICanvasNode {
  label: string;
  isSelected: boolean;
  position: IPosition;
  inputPins: ICanvasNodePin[];
  outputPins: ICanvasNodePin[];
  zIndex: number;
}
