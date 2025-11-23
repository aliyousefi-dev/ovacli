export interface CanvasStatusData {
  // Mouse position relative to the graph container (Screen coordinates)
  mouseX: number;
  mouseY: number;

  // Current zoom level
  scale: number;

  // Translation/pan offset for the SVG transform (World offset in screen space)
  translateX: number;
  translateY: number;

  // Dimensions of the parent container element
  containerWidth: number;
  containerHeight: number;
}
