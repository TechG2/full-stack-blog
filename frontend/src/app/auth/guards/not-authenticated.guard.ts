import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const notAuthenticatedGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService: AuthService = inject(AuthService);

  const user = await authService.getMe();
  if (user) router.navigate(['/']);

  return true;
};
