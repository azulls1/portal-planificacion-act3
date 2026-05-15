import { SlicePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ApiService } from '../../core/api.service';
import { PlanRunnerComponent } from '../../shared/plan-runner.component';
import { RoverGraphComponent } from './rover-graph.component';

interface PlanStep {
  readonly step: number;
  readonly name: string;
  readonly args: readonly string[];
}

const PLAN: readonly PlanStep[] = [
  { step: 1, name: 'move', args: ['R1', 'L4', 'L3'] },
  { step: 2, name: 'move', args: ['R1', 'L3', 'L1'] },
  { step: 3, name: 'pickup', args: ['R1', 'M1', 'L1'] },
  { step: 4, name: 'move', args: ['R1', 'L1', 'L3'] },
  { step: 5, name: 'move', args: ['R1', 'L3', 'L4'] },
  { step: 6, name: 'move', args: ['R1', 'L4', 'L5'] },
  { step: 7, name: 'deliver', args: ['R1', 'M1', 'L5'] },
  { step: 8, name: 'move', args: ['R1', 'L5', 'L4'] },
  { step: 9, name: 'move', args: ['R1', 'L4', 'L3'] },
  { step: 10, name: 'move', args: ['R1', 'L3', 'L2'] },
  { step: 11, name: 'pickup', args: ['R1', 'M2', 'L2'] },
  { step: 12, name: 'move', args: ['R1', 'L2', 'L4'] },
  { step: 13, name: 'move', args: ['R1', 'L4', 'L5'] },
  { step: 14, name: 'deliver', args: ['R1', 'M2', 'L5'] },
];

const COUNTS = {
  move: PLAN.filter((p) => p.name === 'move').length,
  pickup: PLAN.filter((p) => p.name === 'pickup').length,
  deliver: PLAN.filter((p) => p.name === 'deliver').length,
};

const VERB_COLOR: Record<string, 'blue' | 'green' | 'amber'> = {
  move: 'blue',
  pickup: 'amber',
  deliver: 'green',
};

@Component({
  selector: 'app-rover',
  standalone: true,
  imports: [RoverGraphComponent, PlanRunnerComponent, SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
      .pddl-pre {
        margin: 0;
        padding: 18px 20px;
        max-height: 540px;
        overflow: auto;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 12px;
        line-height: 1.6;
        color: #D9E6E1;
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
      .pddl-shell__sha {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        color: rgba(255, 255, 255, 0.55);
      }
      .topo-list li {
        padding: 8px 12px;
        border-radius: 8px;
        background: var(--color-bg-surface, #F7F8F7);
        border: 1px solid var(--color-border);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 12px;
      }
      .topo-list li + li {
        margin-top: 6px;
      }
    `,
  ],
  template: `
    <!-- ────────── HERO ────────── -->
    <header class="page-hero">
      <div>
        <span class="tag mb-3 inline-block">Criterio 2 · 5 pts</span>
        <h1 class="page-hero__title">Problema del rover</h1>
        <p class="page-hero__lead">
          Modelado clásico: un rover transporta minerales desde sus localidades de
          origen hasta un laboratorio, respetando aristas dirigidas y capacidad de
          carga = 1.
        </p>
      </div>

      <div class="page-hero__stats">
        <div class="stat-card stat-card--accent">
          <div class="stat-card__label">Plan óptimo</div>
          <div class="stat-card__value">14 acciones</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Capacidad</div>
          <div class="stat-card__value">1 mineral</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Localidades</div>
          <div class="stat-card__value">5 nodos</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Costo · Tiempo</div>
          <div class="stat-card__value">14 · 11 s</div>
        </div>
      </div>
    </header>

    <!-- ────────── STICKY TOC ────────── -->
    <nav class="page-toc">
      <a class="page-toc__link" href="#enunciado">
        <span class="page-toc__num">01</span> Enunciado
      </a>
      <a class="page-toc__link" href="#topologia">
        <span class="page-toc__num">02</span> Topología
      </a>
      <a class="page-toc__link" href="#domain">
        <span class="page-toc__num">03</span> domain.pddl
      </a>
      <a class="page-toc__link" href="#problem">
        <span class="page-toc__num">04</span> problem-1.pddl
      </a>
      <a class="page-toc__link" href="#plan">
        <span class="page-toc__num">05</span> Plan
      </a>
    </nav>

    <!-- ────────── 01 ENUNCIADO ────────── -->
    <section id="enunciado" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">01</div>
        <div>
          <h2 class="page-section__title">Enunciado original</h2>
          <p class="page-section__lead">
            Caso de estudio del profesor. Define los minerales, el laboratorio y
            las aristas (algunas unidireccionales).
          </p>
        </div>
      </div>

      <div class="split-grid">
        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">📜</div>
            <div class="step-card-v2__title">Descripción</div>
          </div>
          <div class="step-card-v2__body">
            Un robot tipo rover excavó dos rocas (minerales <strong>M1</strong> y
            <strong>M2</strong>) en las localidades <strong>L1</strong> y
            <strong>L2</strong> respectivamente. Debido al mal tiempo no fue
            posible trasladarlos en su momento. Se solicita generar el plan que
            debe seguir el rover para llevar ambos minerales al laboratorio
            ubicado en <strong>L5</strong>.
          </div>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">🔗</div>
            <div class="step-card-v2__title">Aristas del grafo</div>
          </div>
          <ul class="topo-list mt-1">
            <li>L1 ↔ L3 <span class="text-pine">· bidireccional</span></li>
            <li>L3 → L2 <span class="text-pine">· unidireccional</span></li>
            <li>L2 → L4 <span class="text-pine">· unidireccional</span></li>
            <li>L3 ↔ L4 <span class="text-pine">· bidireccional</span></li>
            <li>L4 ↔ L5 <span class="text-pine">· bidireccional</span></li>
          </ul>
        </article>
      </div>
    </section>

    <!-- ────────── 02 TOPOLOGÍA ────────── -->
    <section id="topologia" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">02</div>
        <div>
          <h2 class="page-section__title">Topología</h2>
          <p class="page-section__lead">
            Visualización del grafo de localidades. Los nodos representan
            posiciones; las aristas, conexiones (con dirección cuando aplica).
          </p>
        </div>
      </div>

      <div class="card-section">
        <app-rover-graph />
      </div>
    </section>

    <!-- ────────── 03 domain.pddl ────────── -->
    <section id="domain" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">03</div>
        <div>
          <h2 class="page-section__title">domain.pddl</h2>
          <p class="page-section__lead">
            Tipos, predicados, acciones (move, pickup, deliver) y precondiciones.
          </p>
        </div>
      </div>

      <div class="pddl-shell">
        <div class="pddl-shell__bar">
          <span>
            <span class="cmd__dots"><span></span><span></span><span></span></span>
            domain.pddl
          </span>
          @if (domainSha()) {
            <span class="pddl-shell__sha">sha256: {{ domainSha() | slice: 0 : 12 }}…</span>
          }
        </div>
        <pre class="pddl-pre"><code>{{ domainText() }}</code></pre>
      </div>
    </section>

    <!-- ────────── 04 problem-1.pddl ────────── -->
    <section id="problem" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">04</div>
        <div>
          <h2 class="page-section__title">problem-1.pddl</h2>
          <p class="page-section__lead">
            Instancia base: rover en L4, M1 en L1, M2 en L2, meta entregar ambos en L5.
          </p>
        </div>
      </div>

      <div class="pddl-shell">
        <div class="pddl-shell__bar">
          <span>
            <span class="cmd__dots"><span></span><span></span><span></span></span>
            problem-1.pddl
          </span>
          @if (problemSha()) {
            <span class="pddl-shell__sha">sha256: {{ problemSha() | slice: 0 : 12 }}…</span>
          }
        </div>
        <pre class="pddl-pre"><code>{{ problemText() }}</code></pre>
      </div>
    </section>

    <!-- ────────── 05 PLAN ────────── -->
    <section id="plan" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">05</div>
        <div>
          <h2 class="page-section__title">Plan óptimo · 14 acciones</h2>
          <p class="page-section__lead">
            Plan generado por Delfi 1 (11 s, coste 14). Usa los controles para
            reproducir la trayectoria sobre el grafo.
          </p>
        </div>
      </div>

      <!-- distribución por tipo de acción -->
      <div class="dist-grid mb-5">
        <div class="dist-card dist-card--blue">
          <div class="dist-card__bar"></div>
          <div class="dist-card__verb">move</div>
          <div class="dist-card__count">{{ counts.move }}</div>
          <div class="dist-card__pct">desplazamientos por el grafo</div>
        </div>
        <div class="dist-card dist-card--amber">
          <div class="dist-card__bar"></div>
          <div class="dist-card__verb">pickup</div>
          <div class="dist-card__count">{{ counts.pickup }}</div>
          <div class="dist-card__pct">recogidas (1 por mineral)</div>
        </div>
        <div class="dist-card dist-card--green">
          <div class="dist-card__bar"></div>
          <div class="dist-card__verb">deliver</div>
          <div class="dist-card__count">{{ counts.deliver }}</div>
          <div class="dist-card__pct">entregas en L5</div>
        </div>
      </div>

      <!-- grafo + lista de acciones -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <app-rover-graph [step]="step()" [plan]="planRaw" />

          <!-- Controles -->
          <div class="mt-4 flex flex-wrap items-center gap-2 justify-center">
            <button type="button" class="btn btn-secondary text-sm"
                    (click)="reset()" [disabled]="step() === 0 && !playing()">
              ⏮ Reset
            </button>
            <button type="button" class="btn btn-secondary text-sm"
                    (click)="stepBack()" [disabled]="step() === 0">
              ◀ Atrás
            </button>
            <button type="button" class="btn btn-cta text-sm min-w-[110px]"
                    (click)="togglePlay()">
              @if (playing()) { ⏸ Pausa }
              @else if (step() === plan.length) { ↻ Repetir }
              @else { ▶ Play }
            </button>
            <button type="button" class="btn btn-secondary text-sm"
                    (click)="stepForward()" [disabled]="step() === plan.length">
              Sig. ▶
            </button>
            <button type="button" class="btn btn-secondary text-sm"
                    (click)="jumpEnd()" [disabled]="step() === plan.length">
              ⏭ Fin
            </button>
          </div>

          <!-- Progreso -->
          <div class="mt-3">
            <div class="flex justify-between text-[10px] font-mono text-moss mb-1">
              <span>paso {{ step() }} / {{ plan.length }}</span>
              <span>coste acumulado: {{ step() }}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-fog overflow-hidden">
              <div class="h-full bg-fern transition-all duration-500"
                   [style.width.%]="progressPercent()"></div>
            </div>
          </div>
        </div>

        <!-- Lista de acciones scrollable -->
        <ol class="space-y-1.5 max-h-[600px] overflow-y-auto pr-2"
            aria-label="Acciones del plan">
          @for (action of plan; track action.step; let i = $index) {
            <li [class]="rowClass(i)" (click)="jumpTo(i + 1)">
              <span [class]="badgeClass(i)">{{ action.step }}</span>
              <span class="verb-pill" [class]="'verb-pill verb-pill--' + verbColor(action.name)">
                {{ action.name }}
              </span>
              <span class="font-mono text-xs">
                {{ action.args.join(' ') }}
              </span>
            </li>
          }
        </ol>
      </div>

      <div class="alert alert-success mt-6">
        <div class="alert__content">
          <div class="alert__title">Delfi 1 · 14 acciones · coste 14 · 11 s</div>
          Plan óptimo obtenido. Bajo capacidad = 1, el rover hace dos viajes al
          laboratorio (uno por mineral) y explota las dos aristas unidireccionales
          como atajos de retorno.
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-dashed border-fog">
        <h3 class="font-display text-base text-forest mb-3">
          Re-ejecutar / Simular
        </h3>
        <app-plan-runner domainSlug="domain" problemSlug="problem-1" />
      </div>
    </section>
  `,
  host: { class: 'block max-w-5xl mx-auto' },
})
export class RoverComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);

  protected readonly plan = PLAN;
  protected readonly counts = COUNTS;
  protected readonly planRaw: string[] = PLAN.map(
    (a) => `(${a.name} ${a.args.join(' ')})`,
  );

  protected readonly domainText = signal<string>('Cargando domain.pddl...');
  protected readonly problemText = signal<string>('Cargando problem-1.pddl...');
  protected readonly domainSha = signal<string | null>(null);
  protected readonly problemSha = signal<string | null>(null);

  protected readonly step = signal(0);
  protected readonly playing = signal(false);
  private playTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly progressPercent = computed(() =>
    Math.round((this.step() / this.plan.length) * 100),
  );

  protected verbColor(name: string): 'blue' | 'green' | 'amber' {
    return VERB_COLOR[name] ?? 'blue';
  }

  protected rowClass(i: number): string {
    const base =
      'rounded-lg px-3 py-2 flex items-center gap-3 transition-all cursor-pointer border';
    if (i < this.step()) {
      return `${base} bg-fern text-white border-transparent`;
    }
    if (i === this.step()) {
      return `${base} bg-emerald-50 border-fern scale-[1.02] shadow-sm`;
    }
    return `${base} border-transparent text-evergreen hover:bg-fog`;
  }

  protected badgeClass(i: number): string {
    const base =
      'font-mono text-[10px] w-6 h-6 rounded-full flex items-center justify-center shrink-0';
    if (i < this.step()) return `${base} bg-white/20 text-white`;
    if (i === this.step()) return `${base} bg-fern text-white`;
    return `${base} bg-fog text-moss`;
  }

  protected reset(): void {
    this.stopTimer();
    this.step.set(0);
  }
  protected stepForward(): void {
    if (this.step() < this.plan.length) {
      this.step.update((v) => v + 1);
    }
  }
  protected stepBack(): void {
    if (this.step() > 0) {
      this.step.update((v) => v - 1);
    }
  }
  protected jumpEnd(): void {
    this.stopTimer();
    this.step.set(this.plan.length);
  }
  protected jumpTo(s: number): void {
    this.stopTimer();
    this.step.set(Math.max(0, Math.min(s, this.plan.length)));
  }
  protected togglePlay(): void {
    if (this.playing()) {
      this.stopTimer();
      return;
    }
    if (this.step() === this.plan.length) {
      this.step.set(0);
    }
    this.playing.set(true);
    this.playTimer = setInterval(() => {
      if (this.step() >= this.plan.length) {
        this.stopTimer();
        return;
      }
      this.step.update((v) => v + 1);
    }, 900);
  }
  private stopTimer(): void {
    if (this.playTimer !== null) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
    this.playing.set(false);
  }

  ngOnInit(): void {
    this.api.getPddlFile('domain').subscribe({
      next: (text) => this.domainText.set(text),
      error: () => this.domainText.set('(no se pudo cargar; arranca el backend)'),
    });
    this.api.getPddlFile('problem-1').subscribe({
      next: (text) => this.problemText.set(text),
      error: () => this.problemText.set('(no se pudo cargar; arranca el backend)'),
    });
    this.api.listPddlFiles().subscribe({
      next: (files) => {
        const d = files.find((f) => f.slug === 'domain');
        const p = files.find((f) => f.slug === 'problem-1');
        if (d) this.domainSha.set(d.sha256);
        if (p) this.problemSha.set(p.sha256);
      },
      error: () => {},
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
