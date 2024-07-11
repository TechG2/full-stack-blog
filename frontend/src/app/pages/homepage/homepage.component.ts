import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArticlesPageComponent } from '../articles-page/articles-page.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [RouterModule, ArticlesPageComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent {
  constructor() {}
}
