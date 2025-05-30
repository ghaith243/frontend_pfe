import { AuthService } from 'app/services/authservice.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardBodyComponent, CardComponent, CardGroupComponent, ColComponent, ContainerComponent, FormModule, RowComponent } from '@coreui/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule,FormsModule,FormModule,CardBodyComponent,ContainerComponent,RowComponent,CardComponent,ColComponent,CardGroupComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  email = ""
  code = ""
  newPassword = ""
  confirmPassword = ""
  codeSent = false

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.sendResetCode(this.email).subscribe(
      () => {
        this.codeSent = true
        alert("Un code a été envoyé à votre adresse email.")
      },
      (error) => {
        console.error("Erreur réelle ou fausse alerte :", error)

        // 👉 Corrige ici en acceptant status 200 même si ok est false
        if (error.status === 200) {
          this.codeSent = true
          alert("Un code a été envoyé à votre adresse email.")
        } else {
          const errorMessage = error.error?.message || "Email non trouvé."
          alert("Erreur : " + errorMessage)
        }
      },
    )
  }

onReset() {
  if (this.newPassword !== this.confirmPassword) {
    alert("Les mots de passe ne correspondent pas");
    return;
  }

  this.authService.resetPassword(this.email, this.code, this.newPassword).subscribe({
    next: (response: any) => {
      const message = typeof response === 'string' ? response : response?.message;
      alert(message || "Mot de passe réinitialisé avec succès");
      
      // Reset du formulaire
      this.resetform();
      
      // Redirection vers login
      this.router.navigate(['/login']);
    },
    error: (error) => {
      console.error("Erreur:", error);
      const errorMessage = error.error?.message || 
      error.message || "Échec de la réinitialisation";
      alert("Erreur: " + errorMessage);
    }
  });
}

resetform(){
   this.email = ""
  this.code = ""
  this.newPassword = ""
  this.confirmPassword = ""
  this.codeSent = false
}
  resendCode() {
    this.authService.sendResetCode(this.email).subscribe(
      () => {
        alert("Un nouveau code a été envoyé à votre adresse email.")
      },
      (error) => {
        console.error("Erreur lors du renvoi du code :", error)

        // Handle the same way as in onSubmit
        if (error.status === 200) {
          alert("Un nouveau code a été envoyé à votre adresse email.")
        } else {
          const errorMessage = error.error?.message || "Erreur lors de l'envoi du code."
          alert("Erreur : " + errorMessage)
        }
      },
    )
  }
}

