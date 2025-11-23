import { Injectable } from '@angular/core';
import { GraphNodeData } from './data-types/node.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GraphService {
  private nodesSubject = new BehaviorSubject<GraphNodeData[]>([]);
  private selectedNodesSubject = new BehaviorSubject<GraphNodeData[]>([]);

  // Observable for nodes
  get nodes$() {
    return this.nodesSubject.asObservable();
  }

  // Observable for selected nodes
  get selectedNodes$() {
    return this.selectedNodesSubject.asObservable();
  }

  addNode(node: GraphNodeData) {
    const nodes = [...this.nodesSubject.getValue(), node];
    this.nodesSubject.next(nodes); // Emit the updated list of nodes
  }

  selectNode(node: GraphNodeData) {
    node.selected = !node.selected;
    this.selectedNodesSubject.next(
      this.nodesSubject.getValue().filter((n) => n.selected)
    ); // Update selected nodes
  }

  zoomToNode(node: GraphNodeData) {
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
          node.xPos >= x1 &&
          node.xPos <= x2 &&
          node.yPos >= y1 &&
          node.yPos <= y2
      );
  }
}
