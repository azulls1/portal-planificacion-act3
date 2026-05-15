import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, Scenario } from '../../core/api.service';

@Component({
  selector: 'app-scenarios-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-hero">
      <div>
        <span class="tag mb-3 inline-block">Criterio 2 · abstracción PDDL</span>
        <h1 class="page-hero__title">Escenarios alternativos</h1>
        <p class="page-hero__lead">
          Dos escenarios diseñados como variaciones del problema base del rover,
          cada uno orientado a evaluar una capacidad distinta del planner óptimo.
          Ambos reutilizan el mismo <code>domain.pddl</code> sin modificación.
        </p>
      </div>

      <div class="page-hero__stats">
        <div class="stat-card stat-card--accent">
          <div class="stat-card__label">Escenarios</div>
          <div class="stat-card__value">2</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Dominio</div>
          <div class="stat-card__value">compartido</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Planes</div>
          <div class="stat-card__value">19 + 20</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Verificados</div>
          <div class="stat-card__value">✓ ambos</div>
        </div>
      </div>
    </header>

    <section class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">↗</div>
        <div>
          <h2 class="page-section__title">Cuadro comparativo</h2>
          <p class="page-section__lead">
            Selecciona un escenario para ver el PDDL, el plan generado y el
            diff contra <code>problem-1</code>.
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="feature-grid">
          @for (i of [1, 2]; track i) {
            <div class="skeleton" style="height: 240px; border-radius: 14px;"></div>
          }
        </div>
      } @else {
        <div class="feature-grid stagger-children">
          @for (s of scenarios(); track s.problem_slug) {
            <a
              [routerLink]="['/escenarios', s.problem_slug]"
              class="feature-card-v2 animate-fadeInUp"
            >
              <div class="flex items-center justify-between">
                <div class="feature-card-v2__icon">🧪</div>
                <span class="badge badge-active">Diseñado</span>
              </div>

              <div>
                <div class="text-[11px] font-mono text-moss mb-1">{{ s.problem_slug }}.pddl</div>
                <h3 class="feature-card-v2__title">{{ s.title }}</h3>
              </div>

              <p class="feature-card-v2__desc">{{ s.description }}</p>

              <div class="flex flex-wrap gap-1.5">
                @for (diff of s.differs_from_base; track diff) {
                  <span class="token-pill">{{ diff }}</span>
                }
              </div>

              <div class="feature-card-v2__meta">
                <span>Ver detalle</span>
                <span>→</span>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `,
  host: { class: 'block max-w-5xl mx-auto' },
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
