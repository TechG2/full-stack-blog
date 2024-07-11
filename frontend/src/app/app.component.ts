import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService, User } from './auth/auth.service';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { Note, NoteComponent } from './components/note/note.component';
import { ArticlesService } from './services/articles.service';
import { HeaderService } from './services/header.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    MatFormFieldModule,
    MatButtonModule,
    NoteComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    private headerService: HeaderService,
    private router: Router,
    private authService: AuthService,
    private articlesService: ArticlesService
  ) {}

  updateUrl(e: any): void {
    this.headerService.setUrl(e.target.value);
  }
  async ngOnInit(): Promise<void> {
    this.articlesService.getArticles();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((e: any) => {
        const event: NavigationEnd = e;
        this.headerService.setUrl(event.url);
      });

    const user: User | boolean = await this.authService.getMe();
    if (user && typeof user !== 'boolean') {
      this.authService.setAuthenticated(true);
      this.authService.setUser(user);
    } else if (!user) localStorage.removeItem('token');
  }
}
