import { v4 as uuidv4 } from 'uuid';
import { ICanvasNode } from '../interfaces/canvas-node.interface';
import { ICanvasStatus } from '../interfaces/canvas-status.interface';
import { ICanvasNodePin } from '../interfaces/canvas-node-pin.interface';

export function createCanvasNode(
  canvasCtx: ICanvasStatus,
  xPos: number,
  yPos: number,
  label: string,
  inputPins: ICanvasNodePin[],
  outputPins: ICanvasNodePin[]
): ICanvasNode {
  const node: ICanvasNode = {
    id: uuidv4(), // Generate a unique id
    width: 100,
    height: 100,
    position: { x: xPos, y: yPos },
    label,
    inputPins: inputPins,
    outputPins: outputPins,
    zIndex: 0,
    isSelected: false,
  };

  canvasCtx.allNodes.push(node);

  return node;
}
