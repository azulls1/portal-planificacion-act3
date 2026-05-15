import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Stage {
  num: number;
  title: string;
  desc: string;
  inputs: string[];
  outputs: string[];
  files: string[];
  iconPath: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
      .timeline {
        position: relative;
        padding-left: 48px;
      }
      .timeline::before {
        content: '';
        position: absolute;
        left: 19px;
        top: 12px;
        bottom: 12px;
        width: 2px;
        background: linear-gradient(180deg, rgba(82, 160, 103, 0.35), rgba(82, 160, 103, 0.12));
      }
      .timeline__node {
        position: absolute;
        left: -48px;
        top: 4px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--color-forest, #2E5A3C);
        display: grid;
        place-items: center;
        box-shadow: 0 0 0 4px #F7F8F7;
      }
      .timeline__stage {
        position: relative;
        margin-bottom: 24px;
      }
      .stage-card {
        position: relative;
        padding: 20px 22px;
        border-radius: 14px;
        background: #FFFFFF;
        border: 1px solid var(--color-border);
        transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
      }
      .stage-card:hover {
        border-color: var(--color-forest, #2E5A3C);
        box-shadow: 0 8px 22px rgba(4, 32, 44, 0.06);
        transform: translateY(-2px);
      }
      .stage-card__tag {
        position: absolute;
        top: -10px;
        right: 16px;
        padding: 3px 10px;
        border-radius: 9999px;
        background: var(--color-forest, #2E5A3C);
        color: #FFFFFF;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        box-shadow: 0 2px 6px rgba(4, 32, 44, 0.12);
      }
      .io-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px dashed var(--color-border);
      }
      .io-grid__label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-secondary, #4A5C50);
        margin-bottom: 6px;
      }
      .io-grid__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .io-grid__list li {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11.5px;
        color: var(--color-text-primary);
        padding: 2px 0;
      }
      .arch-pre {
        background: linear-gradient(180deg, #04202C 0%, #062834 100%);
        color: #D9E6E1;
        padding: 18px 20px;
        border-radius: 14px;
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11px;
        line-height: 1.5;
        overflow-x: auto;
        border: 1px solid #0A3A4A;
      }
      @media (max-width: 720px) {
        .io-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  template: `
    <!-- ────────── HERO ────────── -->
    <header class="page-hero">
      <div>
        <span class="tag mb-3 inline-block">Documentación técnica</span>
        <h1 class="page-hero__title">Cómo funciona todo</h1>
        <p class="page-hero__lead">
          El portal es la pieza visible, pero detrás hay un pipeline de 5 etapas
          que transforma el enunciado del profesor en archivos PDDL válidos,
          planes verificados y un reporte académico reproducible.
        </p>
      </div>

      <div class="page-hero__stats">
        <div class="stat-card stat-card--accent">
          <div class="stat-card__label">Etapas</div>
          <div class="stat-card__value">5</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Planes</div>
          <div class="stat-card__value">4 / 4</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Tests</div>
          <div class="stat-card__value">55 ✓</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Build</div>
          <div class="stat-card__value">~16 min</div>
        </div>
      </div>
    </header>

    <!-- ────────── STICKY TOC ────────── -->
    <nav class="page-toc">
      <a class="page-toc__link" href="#arquitectura">
        <span class="page-toc__num">01</span> Arquitectura
      </a>
      <a class="page-toc__link" href="#pipeline">
        <span class="page-toc__num">02</span> Pipeline 5 etapas
      </a>
      <a class="page-toc__link" href="#reproducir">
        <span class="page-toc__num">03</span> Reproducir
      </a>
      <a class="page-toc__link" href="#stack">
        <span class="page-toc__num">04</span> Stack
      </a>
    </nav>

    <!-- ────────── 01 ARQUITECTURA ────────── -->
    <section id="arquitectura" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">01</div>
        <div>
          <h2 class="page-section__title">Arquitectura del sistema</h2>
          <p class="page-section__lead">
            Capas, puertos y servicios. Toda la cadena corre en Docker excepto
            Apptainer (en WSL2) y el frontend en dev (npm start).
          </p>
        </div>
      </div>

      <pre class="arch-pre">
┌──────────────────────────────────────────────────────────────────────┐
│  FRONTEND   Angular 19 · Tailwind v4 · Forest DS  (puerto 4201)      │
│             /snake /rover /escenarios /reporte /entregables …        │
└──────────────────────────────────────────────────────────────────────┘
                            │  HTTP /api/*
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│  BACKEND    FastAPI + uvicorn  (puerto 8001, Docker)                 │
│             5 routers: pddl-files · plans · scenarios · plan-runs    │
│             plan_simulator.py valida planes contra el dominio        │
└──────────────────────────────────────────────────────────────────────┘
                  │                    │
                  ▼                    ▼
┌────────────────────────┐  ┌──────────────────────────────────────────┐
│  REDIS  cola Celery    │  │  ENTREGABLES  /entregables/...           │
│  (Docker, interno)     │  │   pddl · planes · capturas · reporte     │
└────────────────────────┘  └──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CELERY WORKER  ejecuta tareas asíncronas (Docker)                   │
│  └─ run_planner.py → singularity_runner.py                           │
└──────────────────────────────────────────────────────────────────────┘
                  │  exec
                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│  APPTAINER 1.5.0 (en WSL2 Ubuntu 22.04)                              │
│  └─ planner.img (584 MB) ── Delfi 1 ── Fast Downward + heurísticas   │
└──────────────────────────────────────────────────────────────────────┘
      </pre>
    </section>

    <!-- ────────── 02 PIPELINE ────────── -->
    <section id="pipeline" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">02</div>
        <div>
          <h2 class="page-section__title">Las 5 etapas del pipeline</h2>
          <p class="page-section__lead">
            Cada etapa recibe artefactos de la anterior y produce los que la
            siguiente necesita. Permite trazabilidad de extremo a extremo.
          </p>
        </div>
      </div>

      <ol class="timeline">
        @for (s of stages; track s.num) {
          <li class="timeline__stage">
            <div class="timeline__node">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="white" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round"
                   class="w-5 h-5" aria-hidden="true">
                <path [attr.d]="s.iconPath" />
              </svg>
            </div>
            <article class="stage-card">
              <span class="stage-card__tag">ETAPA {{ s.num }}</span>
              <h3 class="font-display text-lg text-forest font-semibold">
                {{ s.title }}
              </h3>
              <p class="text-sm text-pine mt-2">{{ s.desc }}</p>

              <div class="io-grid">
                <div>
                  <div class="io-grid__label">
                    <span class="io-grid__dot" style="background: #04202C"></span>
                    Entrada
                  </div>
                  <ul class="io-grid__list">
                    @for (i of s.inputs; track i) {
                      <li>{{ i }}</li>
                    }
                  </ul>
                </div>
                <div>
                  <div class="io-grid__label">
                    <span class="io-grid__dot" style="background: #10B981"></span>
                    Salida
                  </div>
                  <ul class="io-grid__list">
                    @for (o of s.outputs; track o) {
                      <li>{{ o }}</li>
                    }
                  </ul>
                </div>
                <div>
                  <div class="io-grid__label">
                    <span class="io-grid__dot" style="background: #4A5C50"></span>
                    Archivos
                  </div>
                  <ul class="io-grid__list">
                    @for (f of s.files; track f) {
                      <li>{{ f }}</li>
                    }
                  </ul>
                </div>
              </div>
            </article>
          </li>
        }
      </ol>
    </section>

    <!-- ────────── 03 REPRODUCIR ────────── -->
    <section id="reproducir" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">03</div>
        <div>
          <h2 class="page-section__title">Reproducir desde cero</h2>
          <p class="page-section__lead">
            Cinco pasos para tener todo corriendo: clone, planner, ejecución y portal.
          </p>
        </div>
      </div>

      <div class="step-grid">
        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">1</div>
            <div class="step-card-v2__title">Clonar repo</div>
          </div>
          <div class="step-card-v2__body">
            <code>git clone https://github.com/azulls1/portal-planificacion-act3</code>
          </div>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">2</div>
            <div class="step-card-v2__title">Instalar Apptainer (WSL2)</div>
          </div>
          <div class="step-card-v2__body">
            <code>sudo add-apt-repository -y ppa:apptainer/ppa</code> y luego
            <code>sudo apt-get install -y apptainer</code>.
          </div>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">3</div>
            <div class="step-card-v2__title">Construir planner.img</div>
          </div>
          <div class="step-card-v2__body">
            <code>bash infra/singularity/_build-from-wsl.sh</code> · ≈ 16 min ·
            584 MB · Fast Downward + heurísticas + Symba.
          </div>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">4</div>
            <div class="step-card-v2__title">Ejecutar los 4 problemas</div>
          </div>
          <div class="step-card-v2__body">
            <code>bash tools/run_all_planners.sh</code> resuelve Snake p01 y
            los 3 problemas del rover con Delfi 1.
          </div>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">5</div>
            <div class="step-card-v2__title">Arrancar el portal</div>
          </div>
          <div class="step-card-v2__body">
            <code>docker compose up -d</code> + <code>npm start</code> en
            <code>apps/frontend</code>. Portal en
            <code>http://localhost:4201</code>.
          </div>
        </article>
      </div>
    </section>

    <!-- ────────── 04 STACK ────────── -->
    <section id="stack" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">04</div>
        <div>
          <h2 class="page-section__title">Stack tecnológico</h2>
          <p class="page-section__lead">
            Tres bloques: frontend, backend y planificación. Cada uno con
            responsabilidades aisladas.
          </p>
        </div>
      </div>

      <div class="step-grid--3 step-grid">
        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">🎨</div>
            <div class="step-card-v2__title">Frontend</div>
          </div>
          <ul class="step-card-v2__body list-disc list-inside space-y-1">
            <li>Angular 19 standalone components</li>
            <li>Tailwind CSS v4</li>
            <li>Forest Design System (vendoreado)</li>
            <li>Hash routing · lazy chunks por feature</li>
          </ul>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">⚙️</div>
            <div class="step-card-v2__title">Backend</div>
          </div>
          <ul class="step-card-v2__body list-disc list-inside space-y-1">
            <li>Python 3.11 · FastAPI · uvicorn</li>
            <li>Celery worker para ejecuciones largas</li>
            <li>Redis como broker</li>
            <li>55 tests pytest verdes · ruff limpio</li>
          </ul>
        </article>

        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">🧠</div>
            <div class="step-card-v2__title">Planificación</div>
          </div>
          <ul class="step-card-v2__body list-disc list-inside space-y-1">
            <li>Apptainer 1.5.0 (Singularity-compatible)</li>
            <li>Delfi 1 (ganador optimal track IPC2018)</li>
            <li>Fast Downward + heurísticas + Symba</li>
            <li>Validación local por <code>plan_simulator.py</code></li>
          </ul>
        </article>
      </div>
    </section>
  `,
  host: { class: 'block max-w-5xl mx-auto' },
})
export class HowItWorksComponent {
  protected readonly stages: Stage[] = [
    {
      num: 1,
      title: 'Modelado PDDL del rover',
      desc: 'Se transcribe el enunciado del profesor a un dominio rover-mineral-transport con 3 tipos, 6 predicados y 3 acciones (move, pickup, deliver). Se documentan 6 decisiones de diseño como ADRs.',
      inputs: ['Enunciado .docx', 'Figura 1 del enunciado'],
      outputs: ['domain.pddl', 'problem-1.pddl', 'problem-2.pddl', 'problem-3.pddl'],
      files: ['entregables/pddl/', 'docs/01-pddl-modeling-decisions.md'],
      iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18l-1.5-2.5L8 15l2-1.5L9.5 11 12 12l2.5-1L14 13.5 16 15l-2.5.5z',
    },
    {
      num: 2,
      title: 'Build del planner ganador IPC2018',
      desc: 'Se descarga la receta Singularity del repositorio team23 del IPC2018 (Delfi 1) y se construye con Apptainer. El proceso compila Fast Downward, sus heurísticas y Symba desde fuente.',
      inputs: ['receta Singularity de team23', 'apptainer 1.5.0'],
      outputs: ['planner.img (584 MB)', '~16 min de compilación'],
      files: ['infra/singularity/_build-from-wsl.sh', 'infra/singularity/pull-planner.sh'],
      iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
    },
    {
      num: 3,
      title: 'Ejecución sobre los 4 problemas',
      desc: 'El script run_all_planners.sh invoca Delfi 1 sobre Snake p01 + los 3 problemas del rover usando el script oficial DETAILS ON SINGULARITY del IPC2018 (ulimit -t 1800 -v 8388608).',
      inputs: ['planner.img', 'los 4 problem.pddl', 'domain.pddl'],
      outputs: ['snake-problem-1-plan.txt (24)', 'rover-{1,2,3}-plan.txt (14/19/20)'],
      files: ['tools/run_all_planners.sh'],
      iconPath: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M10 8l6 4-6 4V8z',
    },
    {
      num: 4,
      title: 'Validación y hashes SHA-256',
      desc: 'Cada plan se valida localmente con plan_simulator.py (verificación paso a paso del estado) y se le calcula SHA-256 para garantizar autenticidad. Los hashes se publican en el reporte.',
      inputs: ['planes generados', 'domain.pddl'],
      outputs: ['confirmación de goal', '4 hashes SHA-256'],
      files: ['apps/backend/src/portal_act3/domain/plan_simulator.py'],
      iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
    },
    {
      num: 5,
      title: 'Figuras, capturas y reporte APA',
      desc: 'Se generan 8 figuras (3 SVG topológicos + 5 PNG estilo terminal con planes y comando), 7 capturas para el anexo, y el reporte de 12 páginas en formato APA con 11 referencias bibliográficas.',
      inputs: ['planes verificados', 'stdout.log de Delfi'],
      outputs: ['8 figuras', '7 capturas', 'reporte.md', 'references.bib'],
      files: ['entregables/reporte/', 'tools/render_terminal_png.py'],
      iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h4',
    },
  ];
}
