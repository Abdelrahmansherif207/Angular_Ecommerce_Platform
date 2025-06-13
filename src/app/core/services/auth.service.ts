import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, map, switchMap } from 'rxjs';
import { User } from '../../shared/models/user.model';

interface AuthResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private userKey = 'currentUser';
  private tokenKey = 'accessToken';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem(this.userKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/signin`, { email, password })
      .pipe(
        tap((response) => {
          // Store the JWT token
          localStorage.setItem(this.tokenKey, response.accessToken);
        }),
        // Fetch user data from backend using email
        map((response) => response.accessToken),
        // Switch to HTTP call to get user by email
        // Use switchMap to chain the observable
        switchMap((accessToken) => {
          const decoded: any = this.decodeToken(accessToken);
          const email = decoded.email;
          return this.http.get<User>(`${this.apiUrl}/users?email=${email}`);
        }),
        tap((userArray) => {
          // If the backend returns an array, use the first user object
          const user = Array.isArray(userArray) ? userArray[0] : userArray;
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decoding token', e);
      return {};
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserById(userId: string | number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }
  updateProfile(
    userId: string | number,
    userData: Partial<User>
  ): Observable<User> {
    return this.http
      .patch<User>(`${this.apiUrl}/users/${userId}`, userData)
      .pipe(
        tap((updatedUser) => {
          if (this.currentUserSubject.value?.id === userId) {
            const currentUser = {
              ...this.currentUserSubject.value,
              ...updatedUser,
            };
            localStorage.setItem(this.userKey, JSON.stringify(currentUser));
            this.currentUserSubject.next(currentUser);
          }
        })
      );
  }

  updateCurrentUser(userData: Partial<User>): Observable<User> {
    const currentUser = this.currentUserValue;
    if (!currentUser?.id) {
      throw new Error('No current user found');
    }

    return this.updateProfile(currentUser.id, userData);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}

// Uncomment the following lines to set a default admin user in localStorage
/*
const adminUser = {
  email: "admin1@gmail.com",
  password: "$2a$10$4Gh4nFXPaz3dbA0LA5WXWOXdjAszFWKtInw2Ar5fFPha1hiu1rhfW",
  firstName: "admin",
  lastName: "jhon",
  phone: "5551234567",
  address: "Cairo/Egypt",
  role: "admin",
  id: 5
};
localStorage.setItem('currentUser', JSON.stringify(adminUser));
*/
