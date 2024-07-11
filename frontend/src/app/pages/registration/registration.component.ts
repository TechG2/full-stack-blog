import { Component } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  error: string | undefined = undefined;

  usernameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);

  authForm = new FormGroup({
    username: this.usernameFormControl,
    email: this.emailFormControl,
    password: this.passwordFormControl,
  });

  constructor(private authService: AuthService, private route: Router) {}

  async authSubmit(): Promise<void> {
    if (
      !this.authForm.value.email ||
      !this.authForm.value.password ||
      !this.authForm.value.username
    )
      return;

    const result = await this.authService.register(
      this.authForm.value.username,
      this.authForm.value.email,
      this.authForm.value.password
    );
    if (!result.ok) {
      this.error = result.errorMsg;
      return;
    }

    this.route.navigate(['/login']);
  }
}
