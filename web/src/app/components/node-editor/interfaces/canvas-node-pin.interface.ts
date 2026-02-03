import { IPosition } from './position.interface';

export interface ICanvasNodePin {
  pinLabel: string;
  position: IPosition;
}

export function createNodePin(pinLabel: string): ICanvasNodePin {
  return {
    pinLabel,
    position: { x: 0, y: 0 },
  };
}
