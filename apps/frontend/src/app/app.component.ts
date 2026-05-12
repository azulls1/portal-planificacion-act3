import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  route: string;
  label: string;
  criterio?: 'C1' | 'C2' | 'C3' | 'C4';
  /**
   * SVG path data for a simple 24x24 icon (stroke style).
   * No external icon library — solo SVG inline, como exige el Forest DS.
   */
  iconPath: string;
  exact?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar flex flex-col">
      <!-- Brand -->
      <a
        routerLink="/"
        class="flex items-center gap-3 px-4 py-5 border-b border-fog/60 hover-scale"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-7 h-7 text-forest shrink-0"
          aria-hidden="true"
        >
          <path d="M12 2l3 6 6 .9-4.5 4.4 1 6.2L12 16.8 6.5 19.5l1-6.2L3 8.9 9 8z" />
        </svg>
        <div class="flex flex-col leading-tight">
          <span class="font-display text-sm font-semibold text-forest">
            Portal Actividad 3
          </span>
          <span class="text-[10px] text-moss font-mono">PDDL · IPC2018</span>
        </div>
      </a>

      <!-- Nav links -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            routerLinkActive="active"
            class="sidebar-link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="sidebar-link__icon shrink-0"
              aria-hidden="true"
            >
              <path [attr.d]="item.iconPath" />
            </svg>
            <span class="flex-1">{{ item.label }}</span>
            @if (item.criterio) {
              <span class="text-[10px] font-mono text-moss">{{ item.criterio }}</span>
            }
          </a>
        }
      </nav>

      <!-- Footer del sidebar -->
      <div class="px-4 py-3 border-t border-fog/60 text-[10px] text-moss font-mono">
        <div>v0.1.0</div>
        <div class="mt-1">Maestría · 2026</div>
      </div>
    </aside>

    <!-- Main content: shifted 240px (ancho del sidebar) -->
    <div class="ml-60 min-h-screen flex flex-col">
      <main class="flex-1 max-w-7xl w-full mx-auto px-8 py-10">
        <router-outlet />
      </main>

      <footer class="border-t border-fog/60 py-6 px-8 mt-12">
        <div class="max-w-7xl mx-auto text-xs text-moss flex flex-wrap items-center justify-between gap-2">
          <span>
            Razonamiento y planificación automática — Maestría, Primer Semestre · 2026
          </span>
          <span class="font-mono">portal-planificacion-act3</span>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent {
  protected readonly navItems: NavItem[] = [
    {
      route: '/',
      label: 'Inicio',
      iconPath: 'M3 11l9-8 9 8M5 10v10h14V10',
      exact: true,
    },
    {
      route: '/snake',
      label: 'Tarea Snake',
      criterio: 'C1',
      iconPath: 'M4 17l4-4 3 3 7-8',
    },
    {
      route: '/rover',
      label: 'Problema Rover',
      criterio: 'C2',
      iconPath: 'M3 11h14l3 3v3a1 1 0 0 1-1 1h-2M3 11V8a1 1 0 0 1 1-1h11l2 4M3 11v7h1m13 0H8M6 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
    },
    {
      route: '/escenarios',
      label: 'Escenarios',
      criterio: 'C3',
      iconPath: 'M9 3v18m0-18l-6 4m6-4l6 4M15 7v14m0-14l6-4m-6 18l-6-4',
    },
    {
      route: '/reporte',
      label: 'Reporte APA',
      criterio: 'C4',
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2zM14 3v5h5',
    },
    {
      route: '/entregables',
      label: 'Entregables',
      iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
    },
    {
      route: '/como-funciona',
      label: 'Cómo funciona',
      iconPath: 'M12 8v4l3 3 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    },
    {
      route: '/autor',
      label: 'Autor',
      iconPath: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
  ];
}
