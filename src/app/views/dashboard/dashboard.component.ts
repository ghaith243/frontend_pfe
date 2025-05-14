import { Component, OnInit } from '@angular/core';
import { ChartService } from 'app/services/chart.service';
import { AuthService } from 'app/services/authservice.service';
import { Chart, ChartType, ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, NgChartsModule],
})
export class DashboardComponent implements OnInit {
  charts: {
    type: ChartType;
    title: string;
    data: ChartConfiguration['data'];
    options?: ChartConfiguration['options'];
  }[] = [];
  
  // Statistiques pour l'employé
  employeeStats = {
    totalConges: 0,
    approuves: 0,
    rejetes: 0,
    enAttente: 0
  };

  // Statistiques pour le chef
  chefStats = {
    totalCongesService: 0,
    approuvesService: 0,
    rejetesService: 0,
    enAttenteService: 0,
    demandesCeMois: 0
  };
  
  currentRole: string = '';
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Couleurs du logo Arabsoft
  arabsoftColors = {
    blue: '#0052B4',      // Bleu du logo
    orange: '#F39C12',    // Orange/doré du logo
    gray: '#6C757D',      // Gris du logo
    lightBlue: '#3498DB', // Version plus claire du bleu
    lightOrange: '#FFB74D' // Version plus claire de l'orange
  };

  // Palette de couleurs basée sur le logo
  chartColors = [
    this.arabsoftColors.blue,
    this.arabsoftColors.orange,
    this.arabsoftColors.gray,
    this.arabsoftColors.lightBlue,
    this.arabsoftColors.lightOrange
  ];

  constructor(
    private statsService: ChartService,
    private authService: AuthService
  ) {
    // Configuration globale de Chart.js
    Chart.defaults.font.family = "'Segoe UI', Tahoma, sans-serif";
    Chart.defaults.color = '#333';
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.currentRole = this.authService.getUserRole();

    if (this.currentRole === 'ADMIN') {
      this.loadAdminStats();
    } else if (this.currentRole === 'CHEF') {
      this.loadChefStats();
    } else if (this.currentRole === 'EMPLOYE') {
      this.loadEmployeeStats();
    }
  }

  // Fonction pour charger les statistiques de l'admin
  private loadAdminStats(): void {
    this.statsService.getAdminStats().subscribe(
      (data) => {
        if (data) {
          this.charts = [
            {
              type: 'pie',
              title: 'Répartition des types de congé',
              data: {
                labels: data.typesConge.map((item: { type: string }) => item.type),
                datasets: [
                  {
                    data: data.typesConge.map((item: { count: number }) => item.count),
                    backgroundColor: this.chartColors,
                    borderWidth: 0,
                  },
                ],
              },
              options: this.getChartOptions(),
            },
            {
              type: 'bar',
              title: 'Taux d\'occupation par service',
              data: {
                labels: data.occupationParService.map((item: { service: string }) => item.service),
                datasets: [
                  {
                    data: data.occupationParService.map((item: { total: number }) => item.total),
                    backgroundColor: this.arabsoftColors.blue,
                  },
                ],
              },
              options: this.getChartOptions(),
            },
          ];
        }
        this.isLoading = false;
      },
      (error) => {
        this.handleError('Erreur lors du chargement des données Admin');
      }
    );
  }

  // Fonction pour charger les statistiques du chef
  private loadChefStats(): void {
    this.statsService.getChefStats().subscribe(
      (data) => {
        this.isLoading = false;
        
        if (!data) {
          this.handleError('Aucune donnée reçue');
          return;
        }
  
        try {
          // Initialisation des valeurs par défaut pour éviter les erreurs
          const safeData = {
            typesCongeService: data.typesCongeService || [],
            demandesMensuelles: data.demandesMensuelles || [],
            congesStats: data.congesStats || { Approuvés: 0, Rejetés: 0, 'En attente': 0 }
          };
  
          // Calcul des totaux pour les cartes
          this.chefStats.totalCongesService = safeData.typesCongeService.reduce((acc: number, item: any) => acc + (item.count || 0), 0);
          this.chefStats.approuvesService = safeData.congesStats.Approuvés || 0;
          this.chefStats.rejetesService = safeData.congesStats.Rejetés || 0;
          this.chefStats.enAttenteService = safeData.congesStats['En attente'] || 0;
          
          const currentMonth = new Date().getMonth() + 1;
          this.chefStats.demandesCeMois = safeData.demandesMensuelles
            .find((item: any) => item.mois === currentMonth)?.count || 0;
  
          // Création des graphiques seulement si les données nécessaires existent
          this.charts = [];
          
          if (safeData.typesCongeService.length > 0) {
            this.charts.push({
              type: 'pie',
              title: 'Répartition des types de congé (Service)',
              data: {
                labels: safeData.typesCongeService.map((item: any) => item.type || 'Inconnu'),
                datasets: [{
                  data: safeData.typesCongeService.map((item: any) => item.count || 0),
                  backgroundColor: this.chartColors,
                  borderWidth: 0,
                }],
              },
              options: this.getChartOptions(),
            });
          }
  
          if (safeData.demandesMensuelles.length > 0) {
            this.charts.push({
              type: 'line',
              title: 'Demandes mensuelles (Service)',
              data: {
                labels: safeData.demandesMensuelles.map((item: any) => `Mois ${item.mois}`),
                datasets: [{
                  data: safeData.demandesMensuelles.map((item: any) => item.count || 0),
                  backgroundColor: this.arabsoftColors.blue,
                  borderColor: this.arabsoftColors.blue,
                  fill: false,
                }],
              },
              options: this.getChartOptions(),
            });
          }
  
          if (this.charts.length === 0) {
            this.handleError('Aucune donnée valide pour créer les graphiques');
          }
        } catch (error) {
          console.error('Erreur de traitement des données:', error);
          this.handleError('Erreur de format des données');
        }
      },
      (error) => {
        this.isLoading = false;
        this.handleError('Erreur lors du chargement des données Chef');
      }
    );
  }

  // Fonction pour charger les statistiques de l'employé
private loadEmployeeStats(): void {
    const userId = this.authService.getUserId();
    this.statsService.getEmployeStats(userId).subscribe(
        (data) => {
            if (data) {
                // Calcul des totaux pour les cartes
                this.employeeStats.totalConges = data.congesStats.Approuvés + data.congesStats.Rejetés + data.congesStats['En attente'] || 0;
                this.employeeStats.approuves = data.congesStats.Approuvés || 0;
                this.employeeStats.rejetes = data.congesStats.Rejetés || 0;
                this.employeeStats.enAttente = data.congesStats['En attente'] || 0;

                // Debug: Afficher les données reçues
                console.log('Données soldeConge:', data.soldeConge);

                const conges = { 
                    paid: 0,    // Pour "Congés payés"
                    annuelle: 0,  // Pour "Annuelle"
                    rtt: 0, 
                    maladie: 0, 
                    sansSolde: 0, 
                    maternite: 0 
                };

                data.soldeConge.forEach((item: { type: string, jours: number }) => {
                    console.log('Traitement du type:', item.type, 'jours:', item.jours);

                    switch (item.type) {
                        case 'Congés payés':
                            conges.paid += item.jours;
                            break;
                      
                      
                        case 'Maladie':
                            conges.maladie = item.jours;
                            break;
                        case 'Sans Solde':
                            conges.sansSolde = item.jours;
                            break;
                        case 'Maternité':
                            conges.maternite = item.jours;
                            break;
                        default:
                            console.warn('Type de congé non géré:', item.type);
                            break;
                    }
                });

                // Debug: Afficher les totaux calculés
                console.log('Totaux calculés:', conges);

                this.charts = [
                    {
                        type: 'pie',
                        title: 'Vos congés utilisés',
                        data: {
                            labels: ['Congés payés', 'Maladie', 'Sans solde', 'Maternité'],
                            datasets: [
                                {
                                    data: [
                                        conges.paid,
                                       
                                          conges.maladie,
                                        conges.sansSolde,
                                        conges.maternite
                                    ],
                                    backgroundColor: this.chartColors,
                                    borderWidth: 0,
                                },
                            ],
                        },
                        options: this.getChartOptions(),
                    },
                    {
                        type: 'pie',
                        title: 'Statut des congés',
                        data: {
                            labels: ['Approuvés', 'Rejetés', 'En attente'],
                            datasets: [
                                {
                                    data: [
                                        data.congesStats.Approuvés,
                                        data.congesStats.Rejetés,
                                        data.congesStats['En attente'],
                                    ],
                                    backgroundColor: [
                                        this.arabsoftColors.blue,
                                        this.arabsoftColors.orange,
                                        this.arabsoftColors.gray
                                    ],
                                    borderWidth: 0,
                                },
                            ],
                        },
                        options: this.getChartOptions(),
                    },
                ];
            }
            this.isLoading = false;
        },
        (error) => {
            this.handleError('Erreur lors du chargement des données Employé');
        }
    );
}
  
  // Fonction pour obtenir les options du graphique
  private getChartOptions(): ChartConfiguration['options'] {
    const isChef = this.currentRole === 'CHEF';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 14,
              weight: 'bold' as const
            },
            padding: 20,
            usePointStyle: true,
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = Number(context.parsed) || 0;
              const dataset = context.dataset.data;
              const total = (dataset as number[]).reduce((a, b) => a + Number(b), 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} jours (${percentage}%)`;
            }
          },
          bodyFont: {
            size: 14,
            weight: 'bold' as const
          },
          padding: 12
        }
      },
      elements: {
        arc: {
          borderWidth: 0,
          ...(isChef && { cutout: '70%' }) // Uniquement pour les doughnuts
        }
      }
    };
  }

  // Fonction pour gérer les erreurs
  private handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }
  
  refreshData(): void {
    this.loadDashboardData();
  }
}