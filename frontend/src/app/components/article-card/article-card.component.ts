import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { Article } from '../../services/articles.service';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RouterModule, MatDividerModule, MatButtonModule],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.css',
})
export class ArticleCardComponent {
  @Input() article: Article;
}
