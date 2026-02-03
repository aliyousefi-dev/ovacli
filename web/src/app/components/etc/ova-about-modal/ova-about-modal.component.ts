import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- add this
import { OvaLogoComponent } from '../ova-logo/ova-logo.component';

@Component({
  selector: 'app-ova-about-modal',
  imports: [CommonModule, OvaLogoComponent],
  templateUrl: './ova-about-modal.component.html',
})
export class OvaAboutModalComponent {
  visible = false;

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }
}
