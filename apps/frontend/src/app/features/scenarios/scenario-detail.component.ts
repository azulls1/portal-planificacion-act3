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
  styles: [
    `
      :host {
        display: block;
      }
      .pddl-shell {
        border-radius: 14px;
        background: linear-gradient(180deg, #04202C 0%, #062834 100%);
        border: 1px solid #0A3A4A;
        overflow: hidden;
      }
      .pddl-shell__bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.04);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.7);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11px;
      }
      .pddl-shell pre {
        margin: 0;
        padding: 18px 20px;
        max-height: 500px;
        overflow: auto;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 12px;
        line-height: 1.6;
        color: #D9E6E1;
      }
    `,
  ],
  template: `
    <nav class="breadcrumb mb-4 text-xs">
      <a routerLink="/escenarios" class="text-pine hover:text-forest">Escenarios</a>
      <span class="mx-2 text-moss">/</span>
      <span class="breadcrumb__current">{{ slug() }}</span>
    </nav>

    @let s = scenario();

    @if (loading()) {
      <div class="skeleton" style="height: 200px; border-radius: 24px;"></div>
    } @else if (s) {
      <!-- ────────── HERO ────────── -->
      <header class="page-hero">
        <div>
          <span class="tag mb-3 inline-block">Escenario · {{ s.problem_slug }}.pddl</span>
          <h1 class="page-hero__title">{{ s.title }}</h1>
          <p class="page-hero__lead">{{ s.description }}</p>
        </div>

        <div class="page-hero__stats">
          <div class="stat-card stat-card--accent">
            <div class="stat-card__label">Autor</div>
            <div class="stat-card__value">{{ s.member_name }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__label">Archivo</div>
            <div class="stat-card__value">{{ s.problem_slug }}.pddl</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__label">Diferencias</div>
            <div class="stat-card__value">{{ s.differs_from_base.length }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__label">Dominio</div>
            <div class="stat-card__value">compartido</div>
          </div>
        </div>
      </header>

      <!-- ────────── STICKY TOC ────────── -->
      <nav class="page-toc">
        <a class="page-toc__link" href="#diferencias">
          <span class="page-toc__num">01</span> Diferencias
        </a>
        <a class="page-toc__link" href="#diff">
          <span class="page-toc__num">02</span> Diff PDDL
        </a>
        <a class="page-toc__link" href="#pddl">
          <span class="page-toc__num">03</span> Archivo .pddl
        </a>
        <a class="page-toc__link" href="#ejecucion">
          <span class="page-toc__num">04</span> Ejecución
        </a>
      </nav>

      <!-- ────────── 01 DIFERENCIAS ────────── -->
      <section id="diferencias" class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">01</div>
          <div>
            <h2 class="page-section__title">Diferencias vs. problema base</h2>
            <p class="page-section__lead">
              Cambios introducidos en este escenario respecto a <code>problem-1.pddl</code>.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          @for (diff of s.differs_from_base; track diff) {
            <span class="token-pill">{{ diff }}</span>
          }
        </div>
      </section>

      <!-- ────────── 02 DIFF ────────── -->
      <section id="diff" class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">02</div>
          <div>
            <h2 class="page-section__title">Diff PDDL</h2>
            <p class="page-section__lead">
              Comparación línea-a-línea contra el problema base.
            </p>
          </div>
        </div>

        <app-pddl-diff
          baseSlug="problem-1"
          [targetSlug]="s.problem_slug"
        />
      </section>

      <!-- ────────── 03 PDDL ────────── -->
      <section id="pddl" class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">03</div>
          <div>
            <h2 class="page-section__title">{{ s.problem_slug }}.pddl</h2>
            <p class="page-section__lead">
              Archivo completo del escenario.
            </p>
          </div>
        </div>

        @if (pddlText()) {
          <div class="pddl-shell">
            <div class="pddl-shell__bar">
              <span>
                <span class="cmd__dots"><span></span><span></span><span></span></span>
                {{ s.problem_slug }}.pddl
              </span>
            </div>
            <pre><code>{{ pddlText() }}</code></pre>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-state__icon">📄</div>
            <div class="empty-state__title">PDDL no disponible</div>
            <div class="empty-state__desc">Verifica que arrancó el backend.</div>
          </div>
        }
      </section>

      <!-- ────────── 04 EJECUCIÓN ────────── -->
      <section id="ejecucion" class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">04</div>
          <div>
            <h2 class="page-section__title">Ejecución y simulación</h2>
            <p class="page-section__lead">
              Re-ejecuta el planner sobre este escenario y/o simula el plan paso a paso.
            </p>
          </div>
        </div>

        <app-plan-runner
          domainSlug="domain"
          [problemSlug]="s.problem_slug"
        />
      </section>

      <div class="mt-8 flex gap-3">
        <a [routerLink]="['/escenarios']" class="btn btn-secondary">← Volver al listado</a>
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
  host: { class: 'block max-w-5xl mx-auto' },
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
