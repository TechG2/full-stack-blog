import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Article } from '../services/articles.service';

export interface User {
  id: number;
  username: string;
  imageUrl: string;
  email: string;
  password: string;
  TwoFA: boolean;
  creationDate: Date;
  articles: Article[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated: boolean = false;
  user: User | undefined = undefined;

  userChanged: EventEmitter<User> = new EventEmitter<User>();
  authenticatedChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private apiService: ApiService, private router: Router) {}

  async login(
    email: string,
    password: string
  ): Promise<
    { ok: boolean; user?: User; errorMsg?: string; token?: string } | any
  > {
    const request = await this.apiService.post(
      'login',
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data: {
      ok: boolean;
      user?: User;
      errorMsg?: string;
      token?: string;
    } = request.data;

    if (data.user) this.setUser(data.user);
    if (data.token) localStorage.setItem('token', data.token);
    if (data.ok) this.setAuthenticated(true);

    return data;
  }
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ ok: boolean; user?: User; errorMsg?: string }> {
    const request = await this.apiService.post(
      'register',
      { email, password, username },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const data: { ok: boolean; user?: User; errorMsg?: string } = request.data;

    return data;
  }
  async logOut(): Promise<{ ok: boolean; errorMsg?: string }> {
    const token = localStorage.getItem('token');
    if (!token) return { ok: false, errorMsg: '' };

    const request = await this.apiService.delete('logout', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data: { ok: boolean; errorMsg?: string } = request.data;

    if (data.ok) {
      localStorage.removeItem('token');
      this.setAuthenticated(false);
      this.setUser(undefined);
      this.router.navigate(['/login']);
    }

    return data;
  }

  async getMe(): Promise<User | boolean> {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const request = await this.apiService.get('@me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data: { ok: boolean; user: User } = request.data;
    if (!data.ok) return false;

    this.setAuthenticated(true);
    return data.user;
  }

  setAuthenticated(authenticated: boolean): void {
    this.isAuthenticated = authenticated;
    this.authenticatedChanged.emit(authenticated);
  }
  setUser(user: User | undefined): void {
    this.user = user;
    this.userChanged.emit(user);
  }
}
