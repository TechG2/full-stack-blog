import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Article, ArticlesService } from '../../services/articles.service';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [MatDividerModule, DatePipe],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.css',
})
export class ArticlePageComponent implements OnInit, OnDestroy {
  id: string = this.route.snapshot.paramMap.get('id')!;
  article: Article;

  private routeSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private articlesService: ArticlesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkArticle();
  }
  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  async checkArticle(): Promise<void> {
    this.routeSubscription = this.route.paramMap.subscribe(async (params) => {
      const id: string = params.get('id')!;

      const article = (await this.articlesService.getArticles()).find(
        (article) => article.id === parseInt(id)
      );
      if (!article || !/^-?\d+$/.test(id)) {
        this.router.navigate(['/404']);
        return;
      }
      this.article = article;
    });

    const article = (await this.articlesService.getArticles()).find(
      (article) => article.id === parseInt(this.id)
    );
    if (!article || !/^-?\d+$/.test(this.id)) {
      this.router.navigate(['/404']);
      return;
    }
    this.article = article;
  }
}
