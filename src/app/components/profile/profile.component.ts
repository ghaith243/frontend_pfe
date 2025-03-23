import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'app/services/profile.service';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from "../notification/notification.component";
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [FormsModule, NotificationComponent]
})
export class ProfileComponent implements OnInit {
  userId: number = Number(localStorage.getItem('userId'));
  profilePictureUrl: string = '';
  user = {
    email:'',
    nom: '',
    enfantcount: '',
   
  };

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfilePicture();
  }

  loadProfilePicture(): void {
    this.profileService.getProfilePicture(this.userId).subscribe((blob) => {
      this.createImageFromBlob(blob);
    });
  }

  createImageFromBlob(image: Blob): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.profilePictureUrl = reader.result as string;
      this.profileService.setProfilePictureUrl(this.profilePictureUrl); // Mettre à jour l'URL dans le service
    });
    if (image) {
      reader.readAsDataURL(image);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.profileService.uploadProfilePicture(this.userId, file).subscribe(() => {
        this.loadProfilePicture(); // Rafraîchir l'image après upload
      });
    }
  }
  updateEmployee(updatedUser: any): void {
    this.profileService.updateEmployee(this.userId, updatedUser).subscribe(
      (response) => {
        console.log('Profil mis à jour avec succès', response);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du profil', error);
      }
    );
  }

}