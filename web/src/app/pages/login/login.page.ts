import { Component, inject } from '@angular/core';
import { Router } from '@angular/router'; // Import Router for navigation
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../../ova-angular-sdk/rest-api/auth-api.service';
import { ApiErrorResponse } from '../../../ova-angular-sdk/rest-api/api-types/core-response';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrl: 'login.page.css',
})
export class LoginPage {
  private authApiService = inject(AuthApiService);
  private router = inject(Router);

  loading: boolean = false;

  username: string = '';
  password: string = '';
  error: string | null = null;

  onSubmit() {
    this.error = null;
    if (!this.username || !this.password) {
      this.error = 'Both fields are required.';
      return;
    }

    this.loading = true;

    this.authApiService.login(this.username, this.password).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          // Navigate to /home after successful login
          this.router.navigate(['/']);
        } else {
          this.error = res.message || 'Login failed';
        }

        this.loading = false;
      },
      error: (err: ApiErrorResponse) => {
        this.error = err.error.message;
        this.loading = false;
      },
    });
  }
}
