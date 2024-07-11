import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../auth/auth.service';
import { ArticleCardComponent } from '../../components/article-card/article-card.component';
import Page from '../../interfaces/iPage';
import { Article, ArticlesService } from '../../services/articles.service';

@Component({
  selector: 'app-articles-page',
  standalone: true,
  imports: [
    MatDividerModule,
    MatButtonModule,
    RouterModule,
    ArticleCardComponent,
  ],
  templateUrl: './articles-page.component.html',
  styleUrl: './articles-page.component.css',
})
export class ArticlesPageComponent implements OnInit, OnDestroy, Page {
  articles: Article[];
  user: User | undefined;
  isAuthenticated: boolean;
  private userSubscription: Subscription = new Subscription();
  private authenticatedSubscription: Subscription = new Subscription();

  constructor(
    private articlesService: ArticlesService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async setUser(): Promise<void> {
    const user: User | boolean = await this.authService.getMe();
    if (!user || typeof user === 'boolean') return undefined;

    this.user = user;
    this.authService.setAuthenticated(true);
  }

  async ngOnInit(): Promise<void> {
    this.articles = await this.articlesService.getArticles();

    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId)
      this.articles = this.articles.filter(
        (article) => article.authorId === +userId
      );

    this.authService.authenticatedChanged.subscribe(
      (authenticated: boolean) => (this.isAuthenticated = authenticated)
    );
    this.userSubscription = this.authService.userChanged.subscribe(
      (user: User) => {
        this.user = user;
      }
    );

    this.setUser();
  }
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.authenticatedSubscription.unsubscribe();
  }
}
