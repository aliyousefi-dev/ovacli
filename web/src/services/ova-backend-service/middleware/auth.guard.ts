import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthApiService } from '../auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authapi: AuthApiService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authapi.checkLoginState().pipe(
      map((res) => {
        if (res.status === 'success' && res.data.authenticated) {
          return true;
        } else {
          return this.router.createUrlTree(['/login']);
        }
      }),
      catchError(() => {
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
