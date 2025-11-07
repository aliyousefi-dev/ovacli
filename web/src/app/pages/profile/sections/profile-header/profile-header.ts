import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ProfileApiService } from '../../../../../services/ova-backend-service/profile-api.service';
import { UserProfile } from '../../../../../services/ova-backend-service/api-types/user-profile';

@Component({
  selector: 'app-space-header',
  standalone: true,
  imports: [CommonModule, ClipboardModule],
  templateUrl: './profile-header.html',
})
export class ProfileHeaderSection implements OnInit {
  private profileApiService = inject(ProfileApiService);
  profile!: UserProfile;
  copied = false; // 🔹 Track copy status

  OpenSettingsModal(): void {
    const modal: any = document.getElementById('settings_modal');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  onCopy(): void {
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000); // 🔹 Reset after 2s
  }

  ngOnInit() {
    this.profileApiService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
