import { ICanvasNodePin } from './canvas-node-pin.interface';

export interface ICanvasConnection {
  sourcePin: ICanvasNodePin;
  targetPin: ICanvasNodePin;
}
