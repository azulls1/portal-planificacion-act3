import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface PlanAction {
  readonly index: number;
  readonly verb: string;
  readonly args: readonly string[];
  readonly kind: 'move' | 'eat-spawn' | 'eat-no-spawn';
}

const RAW_PLAN: readonly string[] = [
  '(move-and-eat-spawn pos4-0 pos4-1 pos2-0 pos1-4)',
  '(move-and-eat-spawn pos4-1 pos3-1 pos1-4 pos1-1)',
  '(move pos3-1 pos2-1 pos3-0 pos4-0)',
  '(move-and-eat-spawn pos2-1 pos2-0 pos1-1 pos0-1)',
  '(move pos2-0 pos1-0 pos4-0 pos4-1)',
  '(move-and-eat-spawn pos1-0 pos1-1 pos0-1 pos3-3)',
  '(move-and-eat-spawn pos1-1 pos0-1 pos3-3 pos4-2)',
  '(move pos0-1 pos0-2 pos4-1 pos3-1)',
  '(move pos0-2 pos0-3 pos3-1 pos2-1)',
  '(move-and-eat-spawn pos0-3 pos0-4 pos4-2 pos3-4)',
  '(move-and-eat-spawn pos0-4 pos1-4 pos3-4 pos0-0)',
  '(move-and-eat-spawn pos1-4 pos2-4 pos0-0 pos1-2)',
  '(move-and-eat-spawn pos2-4 pos3-4 pos1-2 pos1-0)',
  '(move pos3-4 pos4-4 pos2-1 pos2-0)',
  '(move pos4-4 pos4-3 pos2-0 pos1-0)',
  '(move-and-eat-spawn pos4-3 pos4-2 pos1-0 dummypoint)',
  '(move pos4-2 pos3-2 pos1-0 pos1-1)',
  '(move-and-eat-no-spawn pos3-2 pos3-3)',
  '(move pos3-3 pos2-3 pos1-1 pos0-1)',
  '(move-and-eat-no-spawn pos2-3 pos1-3)',
  '(move-and-eat-no-spawn pos1-3 pos1-2)',
  '(move pos1-2 pos1-1 pos0-1 pos0-2)',
  '(move-and-eat-no-spawn pos1-1 pos1-0)',
  '(move-and-eat-no-spawn pos1-0 pos0-0)',
];

const PLAN: readonly PlanAction[] = RAW_PLAN.map((line, i) => {
  const tokens = line.replace(/[()]/g, '').trim().split(/\s+/);
  const verb = tokens[0];
  const args = tokens.slice(1);
  const kind: PlanAction['kind'] =
    verb === 'move-and-eat-spawn'
      ? 'eat-spawn'
      : verb === 'move-and-eat-no-spawn'
        ? 'eat-no-spawn'
        : 'move';
  return { index: i + 1, verb, args, kind };
});

const COUNTS = {
  move: PLAN.filter((a) => a.kind === 'move').length,
  eatSpawn: PLAN.filter((a) => a.kind === 'eat-spawn').length,
  eatNoSpawn: PLAN.filter((a) => a.kind === 'eat-no-spawn').length,
};

const KIND_COLOR: Record<PlanAction['kind'], 'blue' | 'green' | 'amber'> = {
  move: 'blue',
  'eat-spawn': 'green',
  'eat-no-spawn': 'amber',
};

const RUN_COMMAND = `mkdir rundir
cp entregables/pddl/snake-ipc2018/domain.pddl rundir/
cp entregables/pddl/snake-ipc2018/p01.pddl rundir/problem.pddl

RUNDIR="$(pwd)/rundir"
DOMAIN="$RUNDIR/domain.pddl"
PROBLEM="$RUNDIR/problem.pddl"
PLANFILE="$RUNDIR/sas_plan"
ulimit -t 1800
ulimit -v 8388608

singularity run -C -H $RUNDIR planner.img $DOMAIN $PROBLEM $PLANFILE`;

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
      .snake-plan__head,
      .snake-plan__row {
        grid-template-columns: 56px 200px 1fr;
      }
      @media (max-width: 600px) {
        .snake-plan__head,
        .snake-plan__row {
          grid-template-columns: 40px 1fr;
        }
        .snake-plan__head .col-args,
        .snake-plan__row .col-args {
          grid-column: 1 / -1;
        }
      }
    `,
  ],
  template: `
    <!-- ────────── HERO ────────── -->
    <header class="page-hero">
      <div>
        <span class="tag mb-3 inline-block">Criterio 1 · 3 pts</span>
        <h1 class="page-hero__title">
          Tarea Snake — IPC2018<br />Classical Track (optimal)
        </h1>
        <p class="page-hero__lead">
          Ejecución del planner ganador del optimal track del IPC2018 sobre el
          problema 1 de la tarea Snake, dentro de un contenedor Singularity.
        </p>
      </div>

      <div class="page-hero__stats">
        <div class="stat-card stat-card--accent">
          <div class="stat-card__label">Planner</div>
          <div class="stat-card__value">Delfi 1</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Track</div>
          <div class="stat-card__value">seq-opt</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Problema</div>
          <div class="stat-card__value">p01.pddl</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Acciones · Costo</div>
          <div class="stat-card__value">24 · 24</div>
        </div>
      </div>
    </header>

    <!-- ────────── STICKY TOC ────────── -->
    <nav class="page-toc">
      <a class="page-toc__link" href="#setup">
        <span class="page-toc__num">01</span> Setup
      </a>
      <a class="page-toc__link" href="#ejecucion">
        <span class="page-toc__num">02</span> Ejecución
      </a>
      <a class="page-toc__link" href="#plan">
        <span class="page-toc__num">03</span> Plan generado
      </a>
    </nav>

    <!-- ────────── 01 SETUP ────────── -->
    <section id="setup" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">01</div>
        <div>
          <h2 class="page-section__title">Setup — Singularity + Delfi 1</h2>
          <p class="page-section__lead">
            Cuatro pasos verificados para tener el planner listo. Se sigue la
            guía oficial Sylabs referenciada por el profesor.
          </p>
        </div>
      </div>

      <div class="step-grid">
        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">1</div>
            <div class="step-card-v2__title">Instalar Singularity 3.5</div>
          </div>
          <div class="step-card-v2__body">
            Seguir la
            <a
              class="text-forest underline"
              href="https://docs.sylabs.io/guides/3.5/admin-guide/installation.html"
              target="_blank" rel="noopener"
            >guía oficial Sylabs 3.5</a>
            (la referenciada por el profesor). En Windows requiere WSL2 o una VM Linux.
          </div>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">2</div>
            <div class="step-card-v2__title">Verificar la instalación</div>
          </div>
          <div class="step-card-v2__body">
            <code>singularity --version</code> debe responder con la versión
            instalada antes de continuar al siguiente paso.
          </div>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">3</div>
            <div class="step-card-v2__title">Construir la imagen de Delfi 1</div>
          </div>
          <div class="step-card-v2__body">
            <code>./pull-planner.sh</code> dentro de
            <code>infra/singularity</code> descarga la receta del repo team23 y
            ejecuta <code>sudo singularity build planner.img Singularity</code>.
          </div>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">4</div>
            <div class="step-card-v2__title">PDDL de Snake disponibles</div>
          </div>
          <div class="step-card-v2__body">
            Ya descargados en <code>entregables/pddl/snake-ipc2018/</code>
            (<code>domain.pddl</code> + <code>p01.pddl</code>), tomados de
            <code>bitbucket.org/ipc2018-classical/domains/opt/snake/</code>.
          </div>
        </article>
      </div>
    </section>

    <!-- ────────── 02 EJECUCIÓN ────────── -->
    <section id="ejecucion" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">02</div>
        <div>
          <h2 class="page-section__title">Ejecución del planner</h2>
          <p class="page-section__lead">
            Script EXACTO del IPC2018 "How can I test my containers?" con los
            límites oficiales (30 min CPU, 8 GB RAM).
          </p>
        </div>
      </div>

      <div class="split-grid">
        <div class="cmd">
          <div class="cmd__bar">
            <span>
              <span class="cmd__dots"><span></span><span></span><span></span></span>
              bash — singularity run
            </span>
            <button
              type="button"
              class="cmd__copy"
              [class.is-copied]="copied()"
              (click)="copyCommand()"
              [attr.aria-label]="copied() ? 'Comando copiado' : 'Copiar comando'"
            >
              {{ copied() ? '✓ Copiado' : '⧉ Copiar' }}
            </button>
          </div>
          <pre><code>{{ command }}</code></pre>
        </div>

        <aside class="flex flex-col gap-3">
          <div class="info-grid">
            <div class="info-cell">
              <div class="info-cell__label">Subcomando</div>
              <div class="info-cell__value">singularity run</div>
            </div>
            <div class="info-cell">
              <div class="info-cell__label">Imagen</div>
              <div class="info-cell__value">planner.img</div>
            </div>
            <div class="info-cell">
              <div class="info-cell__label">Flag -C</div>
              <div class="info-cell__value">contain</div>
            </div>
            <div class="info-cell">
              <div class="info-cell__label">Flag -H</div>
              <div class="info-cell__value">home = rundir</div>
            </div>
            <div class="info-cell">
              <div class="info-cell__label">CPU</div>
              <div class="info-cell__value">1800 s</div>
            </div>
            <div class="info-cell">
              <div class="info-cell__label">RAM</div>
              <div class="info-cell__value">8 GiB</div>
            </div>
          </div>

          <div class="alert alert-warning">
            <div class="alert__content">
              <div class="alert__title">Si cicla por recursos</div>
              Documenta el ciclado con capturas — nivel 3 de la rúbrica = 2 pts
              (aceptable cuando hay restricciones técnicas).
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- ────────── 03 PLAN ────────── -->
    <section id="plan" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">03</div>
        <div>
          <h2 class="page-section__title">Plan generado · 24 acciones</h2>
          <p class="page-section__lead">
            Plan óptimo emitido por Delfi 1 sobre <code>p01.pddl</code>. Cada
            acción se etiqueta según el tipo de movimiento de la serpiente.
          </p>
        </div>
      </div>

      <div class="dist-grid mb-5">
        <div class="dist-card dist-card--blue">
          <div class="dist-card__bar"></div>
          <div class="dist-card__verb">move</div>
          <div class="dist-card__count">{{ counts.move }}</div>
          <div class="dist-card__pct">
            {{ pct(counts.move) }}% · desplazamientos sin comer
          </div>
        </div>
        <div class="dist-card dist-card--green">
          <div class="dist-card__bar"></div>
          <div class="dist-card__verb">move-and-eat-spawn</div>
          <div class="dist-card__count">{{ counts.eatSpawn }}</div>
          <div class="dist-card__pct">
            {{ pct(counts.eatSpawn) }}% · come y aparece nueva manzana
          </div>
        </div>
        <div class="dist-card dist-card--amber">
          <div class="dist-card__bar"></div>
          <div class="dist-card__verb">move-and-eat-no-spawn</div>
          <div class="dist-card__count">{{ counts.eatNoSpawn }}</div>
          <div class="dist-card__pct">
            {{ pct(counts.eatNoSpawn) }}% · come las últimas manzanas
          </div>
        </div>
      </div>

      <div class="data-table">
        <div class="data-table__head snake-plan__head">
          <div>#</div>
          <div>Acción</div>
          <div class="col-args">Argumentos</div>
        </div>
        @for (action of plan; track action.index) {
          <div class="data-table__row snake-plan__row" [class]="'data-table__row snake-plan__row row--' + color(action.kind)">
            <div class="font-mono text-xs text-pine">{{ action.index | number: '2.0' }}</div>
            <div>
              <span class="verb-pill" [class]="'verb-pill verb-pill--' + color(action.kind)">
                {{ action.verb }}
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5 col-args">
              @for (arg of action.args; track $index) {
                <span
                  class="token-pill"
                  [class.token-pill--muted]="arg === 'dummypoint'"
                >{{ arg }}</span>
              }
            </div>
          </div>
        }
        <div class="data-table__foot">
          <span>Total acciones: <strong>{{ plan.length }}</strong></span>
          <span>cost = <strong>24</strong> (unit cost)</span>
        </div>
      </div>

      <p class="text-xs text-pine mt-4">
        Fuente: <code class="font-mono">entregables/planes/snake-problem-1-plan.txt</code>
      </p>
    </section>
  `,
  host: { class: 'block max-w-5xl mx-auto' },
})
export class SnakeComponent {
  protected readonly plan = PLAN;
  protected readonly counts = COUNTS;
  protected readonly command = RUN_COMMAND;
  protected readonly copied = signal(false);

  protected color(kind: PlanAction['kind']): 'blue' | 'green' | 'amber' {
    return KIND_COLOR[kind];
  }

  protected pct(n: number): number {
    return Math.round((n / PLAN.length) * 100);
  }

  protected copyCommand(): void {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    void navigator.clipboard.writeText(this.command).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    });
  }
}
