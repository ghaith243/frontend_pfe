import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { AuthService } from 'app/services/authservice.service';


import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, FormsModule,CommonModule]
})
export class LoginComponent {
  credentials = {
    email: '',
    motDePasse: '',
  };
  
  

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.login(this.credentials).subscribe(
      (response: any) => {
        localStorage.setItem('token', response.token);// Stocker le token JWT
        localStorage.setItem('role', response.role);
        localStorage.setItem('userEmail', response.email);
        this.router.navigateByUrl('/dashboard');// Rediriger vers le profil
      },
      (error) => {
        console.error('Erreur de connexion', error);
        alert('Email ou mot de passe incorrect');
      }
    );
  }

}
 