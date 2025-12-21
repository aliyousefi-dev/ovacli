import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-security-tab',
  standalone: true,
  templateUrl: './settings-security-tab.html',
  imports: [CommonModule, FormsModule],
})
export class SettingsSecurityTab {}
