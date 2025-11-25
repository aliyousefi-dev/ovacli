export interface ICanvasEdge {
  id: string; // Unique ID for the edge
  sourceNodeId: string;
  sourcePinIndex: number; // For a node with multiple outputs
  targetNodeId: string;
  targetPinIndex: number; // For a node with multiple inputs
}
