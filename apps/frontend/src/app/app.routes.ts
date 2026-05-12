import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Portal Actividad 3 — Inicio',
  },
  {
    path: 'snake',
    loadComponent: () =>
      import('./features/snake/snake.component').then((m) => m.SnakeComponent),
    title: 'Tarea Snake — IPC2018',
  },
  {
    path: 'rover',
    loadComponent: () =>
      import('./features/rover/rover.component').then((m) => m.RoverComponent),
    title: 'Problema del rover',
  },
  {
    path: 'escenarios',
    loadComponent: () =>
      import('./features/scenarios/scenarios-list.component').then(
        (m) => m.ScenariosListComponent,
      ),
    title: 'Escenarios alternativos',
  },
  {
    path: 'escenarios/:slug',
    loadComponent: () =>
      import('./features/scenarios/scenario-detail.component').then(
        (m) => m.ScenarioDetailComponent,
      ),
    title: 'Escenario',
  },
  {
    path: 'reporte',
    loadComponent: () =>
      import('./features/report/report.component').then((m) => m.ReportComponent),
    title: 'Reporte APA',
  },
  {
    path: 'entregables',
    loadComponent: () =>
      import('./features/entregables/entregables.component').then(
        (m) => m.EntregablesComponent,
      ),
    title: 'Entregables',
  },
  {
    path: 'como-funciona',
    loadComponent: () =>
      import('./features/how-it-works/how-it-works.component').then(
        (m) => m.HowItWorksComponent,
      ),
    title: 'Cómo funciona',
  },
  {
    path: 'autor',
    loadComponent: () =>
      import('./features/team/team.component').then((m) => m.TeamComponent),
    title: 'Autor',
  },
  // Backward-compat redirect del path anterior
  { path: 'equipo', redirectTo: 'autor' },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'No encontrado',
  },
];
