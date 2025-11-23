import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICanvasStatus } from '../data-types/canvas-status';

// Define the structure for a menu item
export interface MenuItem {
  label: string;
  type: string;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'context-menu.html',
})
export class ContextMenu {
  @Input() canvasStatus!: ICanvasStatus;

  // 💡 MODIFIED: Menu items are now defined internally
  public menuItems: MenuItem[] = [
    { label: 'Create Query Node', type: 'QUERY_NODE' },
    { label: 'Add Function Block', type: 'FUNCTION_BLOCK' },
    { label: 'Input Data Source', type: 'DATA_SOURCE' },
    { label: 'Result Sink', type: 'RESULT_SINK' },
  ];

  // Emits the 'type' of the node to be created
  @Output() itemSelected = new EventEmitter<MenuItem>();

  onItemClick(item: MenuItem): void {
    this.itemSelected.emit(item);
  }
}
