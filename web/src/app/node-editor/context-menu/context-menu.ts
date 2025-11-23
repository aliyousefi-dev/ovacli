import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class ContextMenuComponent {
  @Input() xPos: number = 0;
  @Input() yPos: number = 0;

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
