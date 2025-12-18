// confirm-modal.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marker-creator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marker-creator.html',
})
export class MarkerCreatorComponent implements OnInit {
  message = '';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  ngOnInit() {
    this.open();
  }

  open() {
    const dialog = document.getElementById(
      'markerCreator'
    ) as HTMLDialogElement | null;
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  }

  close() {
    const dialog = document.getElementById(
      'markerCreator'
    ) as HTMLDialogElement | null;
    if (dialog && typeof dialog.close === 'function') {
      dialog.close();
    }
  }

  onConfirm() {
    this.confirmed.emit();
    this.close();
  }

  onCancel() {
    this.cancelled.emit();
    this.close();
  }

  onDialogClick(event: MouseEvent) {
    // close when backdrop (dialog itself) is clicked
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
