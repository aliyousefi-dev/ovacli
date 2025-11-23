import { v4 as uuidv4 } from 'uuid'; // Import uuidv4 for generating unique IDs

export interface ICanvasNode {
  id: string; // UUID is typically a string
  label: string;
  xPos: number; // World X position
  yPos: number; // World Y position
  width: number;
  height: number;
  isSelected: boolean; // Flag to track selection state
}

// Create a function to instantiate a new canvas node with default or custom width, height, and selection state
export function createCanvasNode(
  xPos: number,
  yPos: number,
  label: string
): ICanvasNode {
  return {
    id: uuidv4(), // Generate a unique id
    xPos,
    yPos,
    label,
    width: 100,
    height: 100,
    isSelected: false,
  };
}
