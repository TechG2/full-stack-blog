import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../auth/auth.service';
import { ApiService } from '../../services/api.service';
import { Article } from '../../services/articles.service';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-create-page',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  templateUrl: './create-page.component.html',
  styleUrl: './create-page.component.css',
})
export class CreatePageComponent implements OnInit, OnDestroy {
  user: User | undefined = undefined;
  articleForm = new FormGroup({
    imageUrl: new FormControl('', [Validators.required]),
    title: new FormControl('', [Validators.required]),
    subtitle: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  private userSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private noteService: NoteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.userChanged.subscribe((user) => {
      this.user = user;
    });

    this.setUser();
  }
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  async setUser(): Promise<void> {
    const user: User | boolean = await this.authService.getMe();
    if (!user || typeof user === 'boolean') return undefined;

    this.user = user;
    this.authService.setAuthenticated(true);
  }
  async handleCreate(): Promise<void> {
    console.log(this.user);

    const article: any = {
      ...this.articleForm.value,
      authorId: this.user!.id,
      creationDate: new Date(),
    };

    const token = localStorage.getItem('token');
    const response = await this.apiService.post('create', article, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data: { ok: boolean; errorMsg?: string; article?: Article } =
      response.data;
    if (!data.ok)
      return this.noteService.activeNote({
        noteId: Date.now(),
        msg: data.errorMsg!,
        isError: true,
      });

    this.noteService.activeNote({
      noteId: Date.now(),
      msg: 'Articolo creato con successo',
      isError: false,
    });
    this.router.navigate([`/article/${data.article!.id}`]);
  }
}
