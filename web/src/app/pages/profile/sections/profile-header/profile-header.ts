import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileApiService } from '../../../../services/ova-backend-service/profile-api.service';
import { UserProfile } from '../../../../services/ova-backend-service/api-types/user-profile';

@Component({
  selector: 'app-space-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.html',
})
export class ProfileHeaderSection implements OnInit {
  @Input() copied!: boolean;
  @Input() copyButtonLabel!: string;
  @Input() copySpaceId!: () => void;
  private profileApiService = inject(ProfileApiService);
  profile!: UserProfile;

  ngOnInit() {
    this.profileApiService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: (error) => {
        // Handle error
      },
    });
  }
}
