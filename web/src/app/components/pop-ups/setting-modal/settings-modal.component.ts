import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsAppearanceTab } from './tabs/settings-appearance-tab/settings-appearance-tab';
import { SettingsGeneralTab } from './tabs/settings-general-tab/settings-general-tab';
import { SettingsSecurityTab } from './tabs/settings-security-tab/settings-security-tab';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  templateUrl: './settings-modal.component.html',
  imports: [
    CommonModule,
    FormsModule,
    SettingsAppearanceTab,
    SettingsGeneralTab,
    SettingsSecurityTab,
  ], // Imports for Angular modules
  styles: [
    `
      .success-message {
        color: green;
        font-weight: bold;
        margin-top: 10px;
      }
    `,
  ],
})
export class SettingsModalComponent implements OnChanges {
  @Input() showModal = false;
  @Output() close = new EventEmitter<void>();

  activeTab: 'general' | 'theme' | 'proxy' = 'general'; // Default tab is 'general'

  // Proxy Config properties
  proxyAddress = localStorage.getItem('proxyAddress') || '';
  proxyPort = localStorage.getItem('proxyPort')
    ? parseInt(localStorage.getItem('proxyPort')!, 10)
    : null;
  proxyUser = localStorage.getItem('proxyUser') || '';
  proxyPassword = localStorage.getItem('proxyPassword') || '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal']) {
      if (this.showModal) {
        // Open the modal if showModal is true
        this.showModal = true;
      } else {
        // Close the modal if showModal is false
        this.showModal = false;
      }
    }
  }

  setActiveTab(tab: 'general' | 'theme' | 'proxy') {
    this.activeTab = tab;
  }

  saveProxySettings() {
    localStorage.setItem('proxyAddress', this.proxyAddress);
    localStorage.setItem(
      'proxyPort',
      this.proxyPort ? this.proxyPort.toString() : ''
    );
    localStorage.setItem('proxyUser', this.proxyUser);
    localStorage.setItem('proxyPassword', this.proxyPassword);
    console.log('Proxy settings saved:', {
      address: this.proxyAddress,
      port: this.proxyPort,
      user: this.proxyUser,
      password: this.proxyPassword ? '********' : '',
    });
  }

  closeModal(event?: Event) {
    event?.stopPropagation(); // Prevent the event from propagating
    this.showModal = false; // Close the modal
    this.close.emit(); // Emit close event to parent component
  }
}
