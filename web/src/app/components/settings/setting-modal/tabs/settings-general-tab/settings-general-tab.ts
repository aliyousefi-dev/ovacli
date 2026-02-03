import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-general-tab',
  standalone: true,
  templateUrl: './settings-general-tab.html',
  imports: [CommonModule, FormsModule],
})
export class SettingsGeneralTab {}
