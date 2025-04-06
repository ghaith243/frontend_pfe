import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/services/authservice.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard vérification...');

  if (authService.getToken()) {
    console.log('✅ Utilisateur authentifié');
    return true;
  } else {
    console.log('❌ Utilisateur non authentifié, redirection vers /login');
    router.navigate(['/login']); 
    return false;
  }
};
