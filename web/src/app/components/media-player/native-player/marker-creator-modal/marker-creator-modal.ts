// confirm-modal.component.ts
import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-marker-creator-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marker-creator-modal.html',
})
export class MarkerCreatorModal implements OnInit {
  // bound inputs
  title = '';
  description = '';
  @ViewChild('labelInput') labelInput?: ElementRef<HTMLInputElement>;

  // emit the entered marker data on confirm
  @Output() confirmed = new EventEmitter<{
    label: string;
    description: string;
  }>();
  @Output() cancelled = new EventEmitter<void>();

  ngOnInit() {}

  open() {
    const dialog = document.getElementById(
      'markerCreator'
    ) as HTMLDialogElement | null;
    if (dialog && typeof dialog.showModal === 'function') {
      // reset fields when opening
      this.title = '';
      this.description = '';
      dialog.showModal();
      // focus the label input after the dialog opens
      setTimeout(() => this.labelInput?.nativeElement.focus(), 0);
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
    this.confirmed.emit({
      label: this.title ? this.title.trim() : '',
      description: this.description ? this.description.trim() : '',
    });
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
