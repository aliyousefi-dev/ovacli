import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  templateUrl: './change-password-modal.html',
  imports: [CommonModule, FormsModule],
})
export class ChangePasswordModal {
  ngOnInit(): void {}

  OpenModal(): void {
    const modal: any = document.getElementById('changePass-modal');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  CloseModal() {
    const modal: any = document.getElementById('changePass-modal');
    if (modal && typeof modal.close === 'function') {
      modal.close();
    }
  }
}
