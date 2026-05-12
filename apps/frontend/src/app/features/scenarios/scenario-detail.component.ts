import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, Scenario } from '../../core/api.service';
import { PddlDiffComponent } from '../../shared/pddl-diff.component';
import { PlanRunnerComponent } from '../../shared/plan-runner.component';

@Component({
  selector: 'app-scenario-detail',
  standalone: true,
  imports: [RouterLink, PlanRunnerComponent, PddlDiffComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="breadcrumb mb-4 text-xs">
      <a routerLink="/escenarios" class="text-pine hover:text-forest">Escenarios</a>
      <span class="mx-2 text-moss">/</span>
      <span class="breadcrumb__current">{{ slug() }}</span>
    </nav>

    @let s = scenario();

    @if (loading()) {
      <div class="skeleton" style="height: 64px; width: 60%;"></div>
    } @else if (s) {
      <header class="mb-8">
        <h1 class="font-display text-3xl text-forest font-semibold">{{ s.title }}</h1>
        <p class="text-sm text-pine mt-2">
          Propuesto por <strong>{{ s.member_name }}</strong> · archivo:
          <code class="font-mono">{{ s.problem_slug }}.pddl</code>
        </p>
      </header>

      <section class="card-section mb-6">
        <h2 class="font-display text-lg text-forest mb-2">Descripción</h2>
        <p class="text-sm text-evergreen leading-relaxed">{{ s.description }}</p>
      </section>

      <section class="card-section mb-6">
        <h2 class="font-display text-lg text-forest mb-3">Diferencias vs. problema base</h2>
        <div class="flex flex-wrap gap-2">
          @for (diff of s.differs_from_base; track diff) {
            <span class="tag">{{ diff }}</span>
          }
        </div>
      </section>

      <app-pddl-diff
        class="block mb-6"
        baseSlug="problem-1"
        [targetSlug]="s.problem_slug"
      />

      <section class="card-section mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-display text-lg text-forest">{{ s.problem_slug }}.pddl</h2>
        </div>
        @if (pddlText()) {
          <pre class="dark-surface font-mono p-4 rounded-xl text-xs overflow-x-auto max-h-[500px]"><code>{{ pddlText() }}</code></pre>
        } @else {
          <div class="empty-state">
            <div class="empty-state__icon">📄</div>
            <div class="empty-state__title">PDDL no disponible</div>
            <div class="empty-state__desc">Verifica que arrancó el backend.</div>
          </div>
        }
      </section>

      <section class="card-section mb-6">
        <h2 class="font-display text-lg text-forest mb-4">Ejecución y simulación</h2>
        <app-plan-runner
          domainSlug="domain"
          [problemSlug]="s.problem_slug"
        />
      </section>

      <div class="flex gap-3">
        <a [routerLink]="['/escenarios']" class="btn btn-secondary">Volver</a>
      </div>
    } @else {
      <div class="empty-state">
        <div class="empty-state__icon">🌱</div>
        <div class="empty-state__title">Escenario pendiente</div>
        <div class="empty-state__desc">
          El integrante <strong>{{ slug() }}</strong> aún no ha cargado su
          escenario alternativo. Esta sección se llenará automáticamente cuando
          suba su <code class="font-mono">problem-N.pddl</code>.
        </div>
      </div>
    }
  `,
})
export class ScenarioDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  protected readonly slug = signal<string>('');
  protected readonly loading = signal(true);
  protected readonly scenario = signal<Scenario | null>(null);
  protected readonly pddlText = signal<string>('');

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.slug.set(slug);

    this.api.getScenarioByMember(slug).subscribe({
      next: (s) => {
        this.scenario.set(s);
        if (s) {
          this.api.getPddlFile(s.problem_slug).subscribe({
            next: (text) => this.pddlText.set(text),
            error: () => this.pddlText.set(''),
          });
        }
      },
      error: () => this.scenario.set(null),
      complete: () => this.loading.set(false),
    });
  }
}
