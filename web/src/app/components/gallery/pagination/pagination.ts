import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-pagination',
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  @Input() current: number = 1;
  @Input() total: number = 12;

  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Output() goTo = new EventEmitter<number>(); // New Output

  formatNum(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  goToPage(event: any) {
    const target = event.target as HTMLInputElement; // Get the input element
    const val = parseInt(target.value, 10);

    if (!isNaN(val) && val >= 1 && val <= this.total) {
      this.goTo.emit(val);
    } else {
      target.value = this.current.toString(); // Reset to current if invalid
    }

    target.blur();
  }
}
