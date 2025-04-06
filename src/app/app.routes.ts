import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { NotificationComponent } from './components/notification/notification.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SubmitleaveComponent } from './components/submitleave/submitleave.component';
import { LeavedecisionComponent } from './components/leavedecision/leavedecision.component';
import { ListcongesComponent } from './components/listconges/listconges.component';
import { CalendrierComponent } from './components/calendrier/calendrier.component';
import { authGuard } from './guards/auth.guard';

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
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {path:'profile',component:ProfileComponent},
      {path:'demande',component:SubmitleaveComponent},
      {path:'validation',component:LeavedecisionComponent},
      {path:'mesconges',component:ListcongesComponent},
      {path:'calendrier',component:CalendrierComponent},
     
    
  
    
   
   
    
      {
        path: 'pages',
        loadChildren: () => import('./views/pages/routes').then((m) => m.routes)
      }
    ]
  },
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
    path: 'notification',
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
