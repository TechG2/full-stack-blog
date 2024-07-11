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
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons';
import { Buffer } from 'buffer';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../../auth/auth.service';
import { Note, NoteComponent } from '../../../components/note/note.component';
import { ApiService } from '../../../services/api.service';
import { NoteService } from '../../../services/note.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatButtonModule,
    RouterModule,
    FontAwesomeModule,
    NoteComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  @ViewChild('profilePic') profilePic: ElementRef<HTMLImageElement>;

  user: User | undefined = undefined;
  faArrowCircleUp = faArrowCircleUp;

  formGroup = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    imageUrl: new FormControl({}),
  });

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private noteService: NoteService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getMe();
    if (typeof user !== 'boolean') this.user = user;
  }

  async readUrl(input: HTMLInputElement): Promise<void> {
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const reader = new FileReader();
      const profilePic = this.profilePic.nativeElement;

      reader.onload = () => {
        profilePic.setAttribute('src', reader.result as string);
        const matchResult = reader
          .result!.toString()
          .match(/(^data:image\/\w+;base64,)(.*)/);

        this.formGroup.patchValue({
          imageUrl: {
            type: matchResult![1],
            image: Buffer.from(matchResult![2], 'base64'),
          },
        });
      };

      reader.readAsDataURL(file);
    }
  }
  async handleSave(): Promise<void> {
    const token = localStorage.getItem('token');
    const data = {
      username: this.formGroup.value.username,
      email: this.formGroup.value.email,
      imageUrl: this.formGroup.value.imageUrl as {
        type: string;
        image: Buffer;
      },
    };

    const result = (
      await this.apiService.patch(
        'settings',
        { userData: data, type: 'UPDATE_USER_PROFILE' },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
    ).data as { ok: boolean; errorMsg?: string; user?: User };
    if (!result.ok) return this.activeNote(result.errorMsg!, !result.ok);

    this.authService.setUser({
      ...this.authService.user!,
      imageUrl: `${data.imageUrl.type}${data.imageUrl.image.toString(
        'base64'
      )}`,
    });
    this.activeNote('Settings saved with success.', !result.ok);
  }

  activeNote(msg: string, isError: boolean): void {
    this.noteService.activeNote({ noteId: Date.now(), msg, isError });
  }
}
