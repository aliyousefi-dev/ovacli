import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OvaVersionComponent } from '../../components/utility/ova-version/ova-version.component';

@Component({
  selector: 'doc-web-components-nav',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OvaVersionComponent],
  templateUrl: './web-components-nav.page.html',
})
export class WebComponentNavDocComponent {}
