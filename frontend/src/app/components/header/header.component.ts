import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Observable, Subscription, map, startWith } from 'rxjs';
import { AuthService, User } from '../../auth/auth.service';
import Page from '../../interfaces/iPage';
import { Article, ArticlesService } from '../../services/articles.service';
import { HeaderService } from '../../services/header.service';
import { MobileMenuComponent } from './mobile-menu/mobile-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    FontAwesomeModule,
    MobileMenuComponent,
    NgClass,
    AsyncPipe,
    MatDividerModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    FontAwesomeModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy, Page {
  @ViewChild('hamInput') hamInput: ElementRef<HTMLInputElement>;
  @ViewChild('hamLine1') hamLine1: ElementRef<HTMLSpanElement>;
  @ViewChild('hamLine2') hamLine2: ElementRef<HTMLSpanElement>;
  @ViewChild('hamLine3') hamLine3: ElementRef<HTMLSpanElement>;
  @ViewChild('searchMenu') searchMenu: ElementRef<HTMLDivElement>;
  @ViewChild('searchMenuInput') searchMenuInput: ElementRef<HTMLDivElement>;

  menuItems: { name: string; url: string }[] = [
    {
      name: 'Home',
      url: '/',
    },
    {
      name: 'Articles',
      url: '/articles',
    },
    {
      name: 'Credits',
      url: '/credits',
    },
  ];

  articles: Article[] = this.articlesService.articles;
  searchControl = new FormControl<string | Article>('', Validators.required);
  filteredOptions: Observable<Article[]>;
  searchFormGroup = new FormGroup({
    query: this.searchControl,
  });
  faMagnifyingGlass = faMagnifyingGlass;
  faXmark = faXmark;

  user: User | undefined;
  isAuthenticated: boolean = false;
  currentUrl: string = this.router.url;
  isMobile: boolean = false;
  private mobileSubscription: Subscription = new Subscription();
  private authenticatedSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private headerService: HeaderService,
    private authService: AuthService,
    private articlesService: ArticlesService
  ) {}

  _filter(title: string): Article[] {
    const filterValue = title.toLowerCase();

    return this.articles.filter((option) =>
      option.title.toLowerCase().includes(filterValue)
    );
  }
  displayFn(article: Article): string {
    return article && article.title ? article.title : '';
  }

  async ngOnInit(): Promise<void> {
    this.articles = await this.articlesService.getArticles();
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const title = typeof value === 'string' ? value : value?.title;
        return title ? this._filter(title as string) : this.articles.slice();
      })
    );
    this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => value)
    );

    this.userSubscription = this.authService.userChanged.subscribe(
      (user: User) => {
        this.user = user;
      }
    );

    this.authenticatedSubscription =
      this.authService.authenticatedChanged.subscribe(
        (authenticated: boolean) => (this.isAuthenticated = authenticated)
      );

    this.headerService.urlChanged.subscribe((newUrl: string): void => {
      this.currentUrl = newUrl;
    });

    this.mobileSubscription = this.headerService.mobileChanged.subscribe(
      (): void => {
        this.hamInput.nativeElement.checked =
          !this.hamInput.nativeElement.checked;
        this.isMobile = !this.isMobile;

        if (this.hamInput.nativeElement.checked) {
          this.hamLine1.nativeElement.classList.add('rotate-45');
          this.hamLine2.nativeElement.classList.add('scale-0');
          this.hamLine3.nativeElement.classList.add('-rotate-45');
        } else {
          this.hamLine1.nativeElement.classList.remove('rotate-45');
          this.hamLine2.nativeElement.classList.remove('scale-0');
          this.hamLine3.nativeElement.classList.remove('-rotate-45');
        }
      }
    );

    this.setUser();
  }
  ngOnDestroy(): void {
    this.mobileSubscription.unsubscribe();
    this.authenticatedSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  async setUser(): Promise<void> {
    const user: User | boolean = await this.authService.getMe();
    if (!user || typeof user === 'boolean') return undefined;

    this.user = user;
    this.authService.setAuthenticated(true);
  }

  handleLogOut(): void {
    this.authService.logOut();
  }
  handleHamClick(checkbox: HTMLInputElement): void {
    this.headerService.setMobile(!checkbox.checked);
  }

  searchSubmit(): void {
    if (typeof this.searchFormGroup.value.query !== 'string') {
      this.router.navigate([
        `/article/${this.searchFormGroup.value.query!.id}`,
      ]);

      this.handleSearch();
      this.searchControl.setValue('');
      this.filteredOptions = this.searchControl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          const title = typeof value === 'string' ? value : value?.title;
          return title ? this._filter(title as string) : this.articles.slice();
        })
      );
    }
  }
  handleSearch(): void {
    this.searchMenu.nativeElement.classList.toggle('opacity-0');
    this.searchMenu.nativeElement.classList.toggle('invisible');
    this.searchMenuInput.nativeElement.classList.toggle('opacity-0');
    this.searchMenuInput.nativeElement.classList.toggle('invisible');
  }
}
