import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RubricCard {
  id: 'C1' | 'C2' | 'C3';
  title: string;
  description: string;
  link: string;
  maxPoints: number;
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
            class="card-feature animate-fadeInUp hover-lift"
          >
            <div class="card-feature__icon">
              <span class="font-mono text-forest font-semibold">{{ item.id }}</span>
            </div>
            <h3 class="font-display text-lg font-semibold text-forest mt-3">
              {{ item.title }}
            </h3>
            <p class="text-sm text-pine mt-2">{{ item.description }}</p>
            <div class="mt-4">
              <span class="badge badge-info">{{ item.maxPoints }} pts máx</span>
            </div>
          </a>
        }
      </div>
    </section>

    <section class="mt-12">
      <h2 class="font-display text-2xl text-forest font-semibold mb-6">
        Entregables del equipo
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        @for (item of deliverables; track item.label) {
          <div class="card-stat animate-fadeInUp">
            <div class="card-stat__label">{{ item.label }}</div>
            <div class="card-stat__value">{{ item.value }}</div>
            <div class="card-stat__desc">{{ item.desc }}</div>
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
    },
    {
      id: 'C2',
      title: 'Rover · abstracción PDDL',
      description:
        'Transcripción del problema del rover a PDDL + 2 escenarios alternativos del autor + planes ejecutados.',
      link: '/rover',
      maxPoints: 5,
    },
    {
      id: 'C3',
      title: 'Redacción APA',
      description:
        'Documento académico con formato, citación y redacción APA.',
      link: '/reporte',
      maxPoints: 2,
    },
  ];

  protected readonly deliverables: DeliverableCard[] = [
    {
      label: 'Archivos PDDL',
      value: '1 + 3',
      desc: '1 domain.pddl común + 3 problem.pddl',
    },
    {
      label: 'Planes generados',
      value: '4',
      desc: 'snake-problem-1 + rover-problem-{1,2,3}',
    },
    {
      label: 'Reporte',
      value: '≤ 12 págs',
      desc: 'Formato APA · PDF entregable',
    },
  ];
}
