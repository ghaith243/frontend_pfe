// _nav.ts

export interface NavItem {
  name: string;
  url: string;
  icon: string;
}

export const navItems: Record<string, NavItem[]> = {
  EMPLOYEE: [
    { name: 'Accueil', url: '/dashboard', icon: 'home' },
    { name: 'Mes congés', url: '/mesconges', icon: 'calendar' },
    {name:"demander un conge",url:'/demande',icon:'demande'},
    {name:"repartition de mes conges",url:'/calendrier',icon:'calendrier'},
    {name:'absences',url:'/mesabsences',icon:''}
  ],
  CHEF: [
    { name: 'Accueil', url: '/dashboard', icon: 'home' },
    { name: 'Validation des congés', url: '/validation', icon: 'check' },
    {name:'absences',url:'/absences',icon:'list'}
  ],
  ADMIN: [
    { name: 'Accueil', url: '/dashboard', icon: 'home' },
    { name: 'Gestion des utilisateurs', url: '/users', icon: 'user' },
    { name: 'Toutes les demandes', url: '/all-conges', icon: 'list' },
    {name:'absences',url:'/absences',icon:'list'}
  ],
};
