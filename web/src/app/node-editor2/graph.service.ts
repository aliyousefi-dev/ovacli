import { Injectable } from '@angular/core';
import { ICanvasNode } from './data-types/canvas-node';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  private nodesSubject = new BehaviorSubject<ICanvasNode[]>([]);
  private selectedNodesSubject = new BehaviorSubject<ICanvasNode[]>([]);

  // Observable for nodes
  get nodes$() {
    return this.nodesSubject.asObservable();
  }

  // Observable for selected nodes
  get selectedNodes$() {
    return this.selectedNodesSubject.asObservable();
  }

  addNode(node: ICanvasNode) {
    const nodes = [...this.nodesSubject.getValue(), node];
    this.nodesSubject.next(nodes); // Emit the updated list of nodes
  }

  selectNode(node: ICanvasNode) {
    node.isSelected = !node.isSelected;
    this.selectedNodesSubject.next(
      this.nodesSubject.getValue().filter((n) => n.isSelected)
    ); // Update selected nodes
  }

  zoomToNode(node: ICanvasNode) {
    // Implement the logic to zoom into the node
    console.log('Zooming to node:', node);
  }

  groupNodes() {
    // Logic to group nodes together
    console.log('Grouping selected nodes');
  }

  boxSelect(x1: number, y1: number, x2: number, y2: number) {
    return this.nodesSubject
      .getValue()
      .filter(
        (node) =>
          node.position.x >= x1 &&
          node.position.x <= x2 &&
          node.position.y >= y1 &&
          node.position.y <= y2
      );
  }
}
