import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-appearance-tab',
  standalone: true,
  templateUrl: './settings-appearance-tab.html',
  imports: [CommonModule, FormsModule],
})
export class SettingsAppearanceTab {
  // Remove modalRef usage since we're handling visibility via `showModal`
  themes = [
    'light',
    'dark',
    'mytheme',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter',
    'dim',
    'nord',
    'sunset',
  ];

  selectedTheme = 'light';

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.selectedTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  setTheme(theme: string) {
    this.selectedTheme = theme;
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
