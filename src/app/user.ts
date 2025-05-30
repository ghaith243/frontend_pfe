export interface User {
    id: number
    nom: string
    email: string
    role: Role; 
    service: Department;
    enfantCount:number;
  }
  
  export interface Department {
    id: number
    nom: string
  }
  
  export interface Role {
    id: number
    name: string
  }
  
  export interface AuthRequest {
    nom: string;
    email: string;
    motDePasse: string;
    role: string;
    serviceId: number;
    enfantCount?: number; // Optionnel ou requis selon votre backend
  }
  