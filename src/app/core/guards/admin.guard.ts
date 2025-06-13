import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    console.log('AdminGuard: Checking admin access');
    console.log('Current User:', this.authService.currentUserValue);
    console.log('Is Admin?:', this.authService.isAdmin());

    if (this.authService.isAdmin()) {
      console.log('AdminGuard: Access granted');
      return true;
    }

    console.log('AdminGuard: Access denied, redirecting to home');
    this.router.navigate(['/']);
    return false;
  }
}
