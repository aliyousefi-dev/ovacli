import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewChild } from '@angular/core';
import { ConfirmModalComponent } from '../../../../components/pop-ups/confirm-modal/confirm-modal.component';
import { WatchedApiService } from '../../../../../services/ova-backend-service/recent-api.service';
import { AuthApiService } from '../../../../../services/ova-backend-service/auth-api.service';
import { UserProfile } from '../../../../../services/ova-backend-service/api-types/user-profile';
import { ProfileApiService } from '../../../../../services/ova-backend-service/profile-api.service';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmModalComponent],
  templateUrl: './general-settings.component.html',
})
export class GeneralSettingsComponent {
  @ViewChild('confirmClearHistoryModal')
  confirmClearHistoryModal!: ConfirmModalComponent;

  constructor(
    private watchedApi: WatchedApiService,
    private authApi: AuthApiService,
    private profileApi: ProfileApiService
  ) {}

  username = '';

  ngOnInit(): void {
    this.profileApi.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.username = profile.username;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
      },
    });
  }

  openClearWatchHistoryConfirm(): void {
    if (!this.username) return;

    this.confirmClearHistoryModal.open(
      'Are you sure you want to clear your entire watch history? This action cannot be undone.'
    );
  }

  clearWatchHistory(): void {
    if (!this.username) return;

    this.watchedApi.clearUserWatched(this.username).subscribe({
      next: (response) => {
        console.log('Watch history cleared:', response.message);
        alert('Watch history cleared successfully!');
      },
      error: (err) => {
        console.error('Failed to clear watch history:', err);
        alert('Failed to clear watch history. Please try again.');
      },
    });
  }
}
