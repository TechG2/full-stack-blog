import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService, User } from '../../../auth/auth.service';
import { ApiService } from '../../../services/api.service';
import { NoteService } from '../../../services/note.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [
    MatDividerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './security.component.html',
  styleUrl: './security.component.css',
})
export class SecurityComponent implements OnInit {
  user: User | undefined = undefined;
  hide1 = true;
  hide2 = true;
  hide3 = true;

  passwordGroup = new FormGroup({
    currentPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });
  twoFAGroup = new FormGroup({
    twoFA: new FormControl(this.user?.TwoFA),
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

  async handleTwoFA(): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await this.apiService.post('2fa', this.twoFAGroup.value, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data: { ok: boolean; errorMsg?: string } = response.data;

    // manage errors
    if (!data.ok)
      return this.noteService.activeNote({
        msg: data.errorMsg!,
        isError: true,
        noteId: Date.now(),
      });

    // finish
    this.noteService.activeNote({
      msg: 'Settings saved with success.',
      isError: false,
      noteId: Date.now(),
    });
  }

  async handleSave(): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await this.apiService.post(
      'password',
      this.passwordGroup.value,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data: { ok: boolean; errorMsg?: string } = response.data;

    // manage errors
    if (!data.ok)
      return this.noteService.activeNote({
        msg: data.errorMsg!,
        isError: true,
        noteId: Date.now(),
      });

    // finish
    this.noteService.activeNote({
      msg: 'Settings saved with success.',
      isError: false,
      noteId: Date.now(),
    });
  }
}
