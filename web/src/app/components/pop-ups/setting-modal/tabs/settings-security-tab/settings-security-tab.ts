import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangePasswordModal } from '../../../change-password-modal/change-password-modal';

@Component({
  selector: 'app-settings-security-tab',
  standalone: true,
  templateUrl: './settings-security-tab.html',
  imports: [CommonModule, FormsModule, ChangePasswordModal],
})
export class SettingsSecurityTab {
  @ViewChild(ChangePasswordModal) changepassmodal!: ChangePasswordModal;
}
