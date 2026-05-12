import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Scenario } from '../../core/api.service';

@Component({
  selector: 'app-scenarios-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <span class="tag mb-2 inline-block">Criterio 3 · 2 pts</span>
      <h1 class="font-display text-3xl text-forest font-semibold">
        Escenarios alternativos del autor
      </h1>
      <p class="text-sm text-pine mt-2 max-w-3xl">
        Dos escenarios diseñados como variaciones del problema base del rover,
        cada uno orientado a evaluar una capacidad distinta del planner óptimo.
        Ambos reutilizan el mismo
        <code class="font-mono">domain.pddl</code> sin modificación.
      </p>
    </header>

    @if (loading()) {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (i of [1, 2]; track i) {
          <div class="skeleton" style="height: 220px;"></div>
        }
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        @for (s of scenarios(); track s.problem_slug) {
          <a
            [routerLink]="['/escenarios', s.problem_slug]"
            class="card-feature animate-fadeInUp hover-lift block"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="font-mono text-xs text-moss">{{ s.problem_slug }}.pddl</span>
              <span class="badge badge-active">Diseñado</span>
            </div>
            <h3 class="font-display text-lg text-forest font-semibold leading-tight">
              {{ s.title }}
            </h3>

            <p class="text-sm text-evergreen mt-3 leading-relaxed">{{ s.description }}</p>

            <div class="mt-4 flex flex-wrap gap-1">
              @for (diff of s.differs_from_base; track diff) {
                <span class="tag text-xs">{{ diff }}</span>
              }
            </div>
          </a>
        }
      </div>
    }
  `,
})
export class ScenariosListComponent implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly loading = signal(true);
  protected readonly scenarios = signal<Scenario[]>([]);

  ngOnInit(): void {
    this.api.listScenarios().subscribe({
      next: (s) => this.scenarios.set(s),
      error: () => this.scenarios.set([]),
      complete: () => this.loading.set(false),
    });
  }
}
