import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { NotificationComponent } from './components/notification/notification.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SubmitleaveComponent } from './components/submitleave/submitleave.component';
import { LeavedecisionComponent } from './components/leavedecision/leavedecision.component';
import { ListcongesComponent } from './components/listconges/listconges.component';
import { CalendrierComponent } from './components/calendrier/calendrier.component';
import { MessagerieComponent } from './components/messagerie/messagerie.component';
import { authGuard } from './guards/auth.guard';
import { AbsencesComponent } from './components/absences/absences.component';
import { EmployeAbsenceComponent } from './components/absences/employe-absence/employe-absence.component';

import { ListeUserComponent } from './components/liste-user/liste-user.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ListeAllcongeComponent } from './components/liste-allconge/liste-allconge.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    canActivate:[authGuard],
    component: DefaultLayoutComponent,
  
    children: [
      {
        path: 'dashboard', component:DashboardComponent
       , canActivate: [authGuard]
        
      },
      
      {path:'profile',component:ProfileComponent,canActivate: [authGuard]},
      {path:'messagerie', component: MessagerieComponent ,canActivate: [authGuard]},
      {path:'demande',component:SubmitleaveComponent,canActivate: [authGuard]},
      {path:'validation',component:LeavedecisionComponent,canActivate: [authGuard]},
      {path:'mesconges',component:ListcongesComponent,canActivate: [authGuard]},
      {path:'calendrier',component:CalendrierComponent,canActivate: [authGuard]},
      {path:'absences',component:AbsencesComponent,canActivate: [authGuard]},
      {path:'mesabsences',component:EmployeAbsenceComponent,canActivate: [authGuard]},
      {path:'users',component:ListeUserComponent,canActivate: [authGuard]},
      {path:'all-conges',component:ListeAllcongeComponent,canActivate: [authGuard]},
      {path:'Notification',component:NotificationComponent,canActivate: [authGuard]},
   
     
    
  
    
   
   
    
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      }
    ]
  },
  {path:'forgotpass',component:ForgotPasswordComponent,canActivate: [authGuard]},
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
 
  {
    path: 'register',
    loadComponent: () => import('./views/pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'notification',canActivate: [authGuard],
    loadComponent: () => import('./components/notification/notification.component').then(m => m.NotificationComponent),
    data: {
      title: 'notification Page'
    }},
   
    {
      path: 'profile',
      loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
      data: {
        title: 'profile Page'
      }},
    
  { path: '**', redirectTo: 'dashboard' },
  
 
];