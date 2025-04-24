import { AuthService } from 'app/services/authservice.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardBodyComponent, CardComponent, CardGroupComponent, ColComponent, ContainerComponent, FormModule, RowComponent } from '@coreui/angular';

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

  constructor(private authService: AuthService) {}

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
    this.authService.resetPassword(this.email, this.code, this.newPassword).subscribe(
      (response) => {
        // Assurer que la réponse contient le message attendu
        if (response && response.message === "Mot de passe réinitialisé avec succès") {
          alert("Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.")
          
          this.codeSent = false
          this.email = ""
          this.code = ""
          this.newPassword = ""
          this.confirmPassword = ""
        } else {
          alert("Erreur : " + (response.message || "Échec de la réinitialisation."))
        }
      },
      (error) => {
        // Afficher l'erreur exacte en console pour déboguer
        console.log("Erreur de réinitialisation:", error)
        const errorMessage = error.error?.message || "Échec de la réinitialisation."
        alert("Erreur : " + errorMessage)
      },
    )
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

