import { ICanvasConnection } from '../interfaces/connection.interface';
import { ICanvasNodePin } from '../interfaces/canvas-node-pin.interface';

export function createCanvasConnection(
  startPin: ICanvasNodePin,
  endPin: ICanvasNodePin
): ICanvasConnection {
  return {
    sourcePin: startPin,
    targetPin: endPin,
  };
}
