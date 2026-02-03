import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-alert',
  standalone: true,
  templateUrl: './delete-alert.html',
  imports: [CommonModule, FormsModule],
})
export class DeleteAlert implements OnInit {
  ngOnInit(): void {}

  OpenModal(): void {
    const modal: any = document.getElementById('delete-alert');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  CloseModal() {
    const modal: any = document.getElementById('delete-alert');
    if (modal && typeof modal.close === 'function') {
      modal.close();
    }
  }
}
