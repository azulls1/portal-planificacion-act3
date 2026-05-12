import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RubricCard {
  id: 'C1' | 'C2' | 'C3';
  title: string;
  description: string;
  link: string;
  maxPoints: number;
  iconPath: string;
  accent: string; // tailwind class
}

interface DeliverableCard {
  label: string;
  value: string;
  desc: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card-hero gradient-dark dark-surface animate-fadeIn relative overflow-hidden">
      <!-- Logo iagentek (esquina superior derecha del hero) -->
      <div class="absolute top-6 right-6 flex items-center gap-2 opacity-90">
        <img
          src="/images/logo_ia_withe.webp"
          alt="iagentek"
          class="h-10 w-auto"
        />
        <div class="flex flex-col leading-tight">
          <span class="text-[10px] text-white/70 font-mono uppercase tracking-widest">powered by</span>
          <span class="font-display text-base text-white font-semibold">iagentek</span>
        </div>
      </div>

      <span class="tag--on-dark mb-4 inline-block">
        Razonamiento y planificación automática · Actividad 3
      </span>
      <h1 class="card-hero__title">
        Modelado y ejecución de planificación clásica en PDDL
      </h1>
      <p class="card-hero__desc">
        Entregable digital individual del autor. Reúne la ejecución de la
        tarea Snake del IPC2018 con Delfi 1, el modelado del problema del rover
        y dos escenarios alternativos diseñados por el autor — todo navegable
        desde un solo lugar.
      </p>

      <div class="mt-8 flex flex-wrap gap-3">
        <a routerLink="/rover" class="btn btn-cta">
          Ver el problema del rover
        </a>
        <a routerLink="/reporte" class="btn btn-secondary--on-dark">
          Descargar reporte APA
        </a>
      </div>
    </section>

    <section class="mt-12">
      <h2 class="font-display text-2xl text-forest font-semibold mb-6">
        Cobertura de la rúbrica
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        @for (item of rubric; track item.id) {
          <a
            [routerLink]="item.link"
            class="card-feature animate-fadeInUp hover-lift relative group"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3"
                [class]="item.accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="w-6 h-6"
                  aria-hidden="true"
                >
                  <path [attr.d]="item.iconPath" />
                </svg>
              </div>
              <div class="min-w-0">
                <span class="font-mono text-[10px] text-moss tracking-wider uppercase">
                  Criterio {{ item.id.substring(1) }}
                </span>
                <h3 class="font-display text-lg font-semibold text-forest leading-tight mt-0.5">
                  {{ item.title }}
                </h3>
              </div>
            </div>
            <p class="text-sm text-pine mt-3">{{ item.description }}</p>
            <div class="mt-4 flex items-center justify-between">
              <span class="badge badge-info">{{ item.maxPoints }} pts máx</span>
              <span
                class="text-[10px] font-mono text-moss group-hover:text-forest transition-colors"
              >
                Ver →
              </span>
            </div>
          </a>
        }
      </div>
    </section>

    <!-- Estado real de ejecución -->
    <section class="mt-12 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-stretch">
      <!-- Donut de avance -->
      <div class="card-section text-center flex flex-col items-center justify-center">
        <div class="relative w-44 h-44">
          <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
            <!-- Fondo gris claro -->
            <circle cx="50" cy="50" r="44" fill="none" stroke="#E4E7E2" stroke-width="9" />
            <!-- Arco verde animado (4/4 = 100%) -->
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#52A067"
              stroke-width="9"
              stroke-linecap="round"
              stroke-dasharray="276.46"
              stroke-dashoffset="0"
              class="donut-progress"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-display text-3xl text-forest font-semibold">4 / 4</span>
            <span class="text-xs text-moss font-mono">planes generados</span>
          </div>
        </div>
        <p class="text-xs text-pine mt-3 max-w-[200px]">
          Todos los problemas resueltos por Delfi 1 con planes óptimos.
        </p>
      </div>

      <!-- Métricas concretas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        @for (m of metrics; track m.label) {
          <div class="card-stat animate-fadeInUp">
            <div class="card-stat__label">{{ m.label }}</div>
            <div class="card-stat__value">{{ m.value }}</div>
            <div class="card-stat__desc">{{ m.desc }}</div>
          </div>
        }
      </div>
    </section>

    <section class="mt-12 card-section">
      <h2 class="font-display text-xl text-forest font-semibold mb-3">
        Cómo navegar este portal
      </h2>
      <ol class="list-decimal list-inside text-sm text-evergreen space-y-2">
        <li>
          <a routerLink="/snake" class="text-forest underline hover:no-underline"
            >Sección Snake</a
          >
          — evidencia de la ejecución del planner del IPC2018 sobre la tarea Snake
          (criterio 1).
        </li>
        <li>
          <a routerLink="/rover" class="text-forest underline hover:no-underline"
            >Sección Rover</a
          >
          + dos
          <a
            routerLink="/escenarios"
            class="text-forest underline hover:no-underline"
            >Escenarios alternativos</a
          >
          — modelado del problema base y dos variantes del autor (criterio 2,
          abstracción PDDL).
        </li>
        <li>
          <a routerLink="/reporte" class="text-forest underline hover:no-underline"
            >Reporte</a
          >
          — documento APA descargable (criterio 3).
        </li>
        <li>
          <a routerLink="/entregables" class="text-forest underline hover:no-underline"
            >Entregables</a
          >
          — catálogo de todos los archivos físicos del entregable + ZIP descargable.
        </li>
        <li>
          <a routerLink="/como-funciona" class="text-forest underline hover:no-underline"
            >Cómo funciona</a
          >
          — pipeline de 5 etapas, arquitectura del sistema y guía de reproducción.
        </li>
      </ol>
    </section>
  `,
})
export class HomeComponent {
  protected readonly rubric: RubricCard[] = [
    {
      id: 'C1',
      title: 'Snake · IPC2018',
      description:
        'Ejecución del planner ganador del optimal track sobre la tarea Snake problema 1.',
      link: '/snake',
      maxPoints: 3,
      // Snake con tablero y manzana
      iconPath: 'M3 6h6a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3h6 M17 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM3 18h6a3 3 0 0 0 3-3v0a3 3 0 0 1 3-3h6',
      accent: 'bg-fern/15 text-fern',
    },
    {
      id: 'C2',
      title: 'Rover · abstracción PDDL',
      description:
        'Transcripción del problema del rover a PDDL + 2 escenarios alternativos del autor + planes ejecutados.',
      link: '/rover',
      maxPoints: 5,
      // Conexiones tipo grafo
      iconPath: 'M6 6a2 2 0 1 0 0-0.01M18 6a2 2 0 1 0 0-0.01M12 12a2 2 0 1 0 0-0.01M6 18a2 2 0 1 0 0-0.01M18 18a2 2 0 1 0 0-0.01 M7.5 6.5L10.5 11.5 M16.5 6.5L13.5 11.5 M10.5 12.5L7.5 17.5 M13.5 12.5L16.5 17.5',
      accent: 'bg-pine/15 text-pine',
    },
    {
      id: 'C3',
      title: 'Redacción APA',
      description:
        'Documento académico con formato, citación y redacción APA en 11 secciones.',
      link: '/reporte',
      maxPoints: 2,
      // Documento con líneas
      iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h4',
      accent: 'bg-moss/15 text-moss',
    },
  ];

  protected readonly metrics: DeliverableCard[] = [
    { label: 'Acciones totales', value: '77', desc: '14 + 19 + 20 + 24 entre los 4 planes' },
    { label: 'Snake p01', value: '24', desc: 'Delfi 1 · 393 s · plan óptimo' },
    { label: 'Rover óptimos', value: '14·19·20', desc: 'problem 1 · 2 · 3 · todos verificados' },
    { label: 'Planner', value: 'Delfi 1', desc: 'Ganador optimal IPC2018 · 584 MB' },
  ];
}
