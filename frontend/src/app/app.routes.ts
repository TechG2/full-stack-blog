import { Routes } from '@angular/router';
import { authenticatedGuard } from './auth/guards/authenticated.guard';
import { notAuthenticatedGuard } from './auth/guards/not-authenticated.guard';
import { ArticlePageComponent } from './pages/article-page/article-page.component';
import { ArticlesPageComponent } from './pages/articles-page/articles-page.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { ProfileComponent } from './pages/settings/profile/profile.component';
import { SecurityComponent } from './pages/settings/security/security.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home',
  },
  {
    path: 'home',
    component: HomepageComponent,
  },
  {
    path: 'articles',
    component: ArticlesPageComponent,
  },
  {
    path: 'articles/:userId',
    component: ArticlesPageComponent,
  },
  {
    path: 'article/:id',
    component: ArticlePageComponent,
  },
  {
    path: 'create',
    component: CreatePageComponent,
    canActivate: [authenticatedGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authenticatedGuard],
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'security',
        component: SecurityComponent,
      },
    ],
  },
  {
    path: 'login',
    canActivate: [notAuthenticatedGuard],
    component: LoginComponent,
  },
  {
    path: 'register',
    canActivate: [notAuthenticatedGuard],
    component: RegistrationComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
