import { Injectable, inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthApiService } from '../rest-api/auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private authapi = inject(AuthApiService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    console.log('AuthGuard Enabled');

    return this.authapi.checkLoginState().pipe(
      map((res) => {
        if (res.status === 'success' && res.data.authenticated) {
          return true;
        } else {
          console.log(
            'AuthGuard: User is not authenticated, redirecting to login.'
          );
          return this.router.createUrlTree(['/login']);
        }
      }),
      catchError((error) => {
        console.error(
          'AuthGuard: Error occurred during login state check:',
          error
        );
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
