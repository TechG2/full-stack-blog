import { Injectable } from '@angular/core';
import { AxiosResponse } from 'axios';
import { User } from '../auth/auth.service';
import { ApiService } from './api.service';

export interface Article {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  description: String;
  author: User;
  authorId: number;
  creationDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  articles: Article[];

  constructor(private apiService: ApiService) {}

  async getArticles(): Promise<Article[]> {
    const articlesRequest: AxiosResponse<Article[]> = await this.apiService.get(
      'articles'
    );
    const articles: Article[] = articlesRequest.data;

    this.articles = articles;
    return articles;
  }
}
