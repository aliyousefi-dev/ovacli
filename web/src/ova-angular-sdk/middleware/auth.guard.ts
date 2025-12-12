import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthApiService } from '../rest-api/auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authapi: AuthApiService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    console.log('AuthGuard: Checking login state...');

    return this.authapi.checkLoginState().pipe(
      map((res) => {
        console.log('AuthGuard: Response from checkLoginState:', res);

        if (res.status === 'success' && res.data.authenticated) {
          console.log('AuthGuard: User is authenticated, allowing access.');
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
