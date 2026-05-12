import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Stage {
  num: number;
  title: string;
  desc: string;
  inputs: string[];
  outputs: string[];
  files: string[];
  iconPath: string;
  accent: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <h1 class="font-display text-3xl text-forest font-semibold">
        Cómo funciona todo
      </h1>
      <p class="text-sm text-pine mt-2 max-w-3xl">
        El portal es la pieza visible, pero detrás hay un pipeline de 5 etapas
        que transforma el enunciado del profesor en archivos PDDL válidos,
        planes verificados y un reporte académico reproducible. Esta página
        documenta esa cadena.
      </p>
    </header>

    <!-- Arquitectura -->
    <section class="card-section mb-8">
      <h2 class="font-display text-xl text-forest mb-4">Arquitectura del sistema</h2>
      <pre class="text-[12px] leading-snug font-mono text-evergreen overflow-x-auto bg-fog/30 p-4 rounded">
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

    <!-- 5 etapas como timeline visual con línea conectora -->
    <h2 class="font-display text-xl text-forest mb-6">Las 5 etapas del pipeline</h2>
    <ol class="relative pl-12 stagger-children">
      <!-- Línea vertical conectora -->
      <div class="absolute left-[19px] top-2 bottom-2 w-0.5 bg-fern/30"></div>

      @for (s of stages; track s.num; let last = $last) {
        <li class="relative animate-fadeInUp mb-6">
          <!-- Marcador en la línea: círculo con icono + número -->
          <div
            class="absolute -left-12 top-1 w-10 h-10 rounded-full bg-fern flex items-center justify-center shadow-md ring-4 ring-gray-50 timeline-pulse"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-5 h-5"
              aria-hidden="true"
            >
              <path [attr.d]="s.iconPath" />
            </svg>
          </div>

          <article class="card-section ml-2 hover-lift relative">
            <span class="absolute -top-3 right-4 bg-fern text-white text-[10px] font-mono px-2 py-0.5 rounded-full shadow-sm">
              ETAPA {{ s.num }}
            </span>
            <h3 class="font-display text-lg text-forest font-semibold">
              {{ s.title }}
            </h3>
            <p class="text-sm text-pine mt-2">{{ s.desc }}</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-fog">
              <div>
                <div class="text-[10px] font-mono text-moss uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-pine"></span>
                  Entrada
                </div>
                <ul class="text-xs text-evergreen space-y-1">
                  @for (i of s.inputs; track i) {
                    <li class="font-mono">{{ i }}</li>
                  }
                </ul>
              </div>
              <div>
                <div class="text-[10px] font-mono text-moss uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-fern"></span>
                  Salida
                </div>
                <ul class="text-xs text-evergreen space-y-1">
                  @for (o of s.outputs; track o) {
                    <li class="font-mono">{{ o }}</li>
                  }
                </ul>
              </div>
              <div>
                <div class="text-[10px] font-mono text-moss uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-moss"></span>
                  Archivos clave
                </div>
                <ul class="text-xs text-evergreen space-y-1">
                  @for (f of s.files; track f) {
                    <li class="font-mono">{{ f }}</li>
                  }
                </ul>
              </div>
            </div>
          </article>
        </li>
      }
    </ol>

    <!-- Cómo reproducirlo -->
    <section class="card-section mt-8">
      <h2 class="font-display text-xl text-forest mb-3">Cómo reproducirlo desde cero</h2>
      <ol class="text-sm text-evergreen list-decimal list-inside space-y-2">
        <li>
          <span class="font-mono text-forest">git clone https://github.com/azulls1/portal-planificacion-act3</span>
        </li>
        <li>
          Instalar Apptainer en Linux/WSL2:
          <code class="font-mono text-pine">sudo add-apt-repository -y ppa:apptainer/ppa && sudo apt-get install -y apptainer</code>
        </li>
        <li>
          Construir <code class="font-mono">planner.img</code>:
          <code class="font-mono text-pine">bash infra/singularity/_build-from-wsl.sh</code>
          (≈ 16 min, 584 MB)
        </li>
        <li>
          Ejecutar los 4 problemas:
          <code class="font-mono text-pine">bash tools/run_all_planners.sh</code>
        </li>
        <li>
          Arrancar el portal:
          <code class="font-mono text-pine">docker compose up -d</code>
          y <code class="font-mono text-pine">npm start</code> en
          <code class="font-mono text-pine">apps/frontend</code>
        </li>
      </ol>
    </section>

    <!-- Tecnologías -->
    <section class="card-section mt-8">
      <h2 class="font-display text-xl text-forest mb-3">Stack tecnológico</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h3 class="font-display text-base text-forest mb-2">Frontend</h3>
          <ul class="text-evergreen space-y-1 list-disc list-inside">
            <li>Angular 19 standalone components</li>
            <li>Tailwind CSS v4</li>
            <li>Forest Design System (vendoreado)</li>
            <li>Hash routing · lazy chunks por feature</li>
          </ul>
        </div>
        <div>
          <h3 class="font-display text-base text-forest mb-2">Backend</h3>
          <ul class="text-evergreen space-y-1 list-disc list-inside">
            <li>Python 3.11 · FastAPI · uvicorn</li>
            <li>Celery worker para ejecuciones largas</li>
            <li>Redis como broker</li>
            <li>55 tests pytest verdes · ruff limpio</li>
          </ul>
        </div>
        <div>
          <h3 class="font-display text-base text-forest mb-2">Planificación</h3>
          <ul class="text-evergreen space-y-1 list-disc list-inside">
            <li>Apptainer 1.5.0 (Singularity-compatible)</li>
            <li>Delfi 1 (ganador optimal track IPC2018)</li>
            <li>Fast Downward + heurísticas + Symba</li>
            <li>Validación local por <code class="font-mono">plan_simulator.py</code></li>
          </ul>
        </div>
      </div>
    </section>
  `,
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
      // Documento con engranaje (modelado)
      iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18l-1.5-2.5L8 15l2-1.5L9.5 11 12 12l2.5-1L14 13.5 16 15l-2.5.5z',
      accent: 'bg-pine/15 text-pine',
    },
    {
      num: 2,
      title: 'Build del planner ganador IPC2018',
      desc: 'Se descarga la receta Singularity del repositorio team23 del IPC2018 (Delfi 1) y se construye con Apptainer. El proceso compila Fast Downward, sus heurísticas y Symba desde fuente.',
      inputs: ['receta Singularity de team23', 'apptainer 1.5.0'],
      outputs: ['planner.img (584 MB)', '~16 min de compilación'],
      files: ['infra/singularity/_build-from-wsl.sh', 'infra/singularity/pull-planner.sh'],
      // Caja (contenedor)
      iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
      accent: 'bg-evergreen/15 text-evergreen',
    },
    {
      num: 3,
      title: 'Ejecución sobre los 4 problemas',
      desc: 'El script run_all_planners.sh invoca Delfi 1 sobre Snake p01 + los 3 problemas del rover usando el script oficial DETAILS ON SINGULARITY del IPC2018 (ulimit -t 1800 -v 8388608).',
      inputs: ['planner.img', 'los 4 problem.pddl', 'domain.pddl'],
      outputs: ['snake-problem-1-plan.txt (24)', 'rover-{1,2,3}-plan.txt (14/19/20)'],
      files: ['tools/run_all_planners.sh'],
      // Play circle
      iconPath: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M10 8l6 4-6 4V8z',
      accent: 'bg-fern/15 text-fern',
    },
    {
      num: 4,
      title: 'Validación y hashes SHA-256',
      desc: 'Cada plan se valida localmente con plan_simulator.py (verificación paso a paso del estado) y se le calcula SHA-256 para garantizar autenticidad. Los hashes se publican en el reporte.',
      inputs: ['planes generados', 'domain.pddl'],
      outputs: ['confirmación de goal', '4 hashes SHA-256'],
      files: ['apps/backend/src/portal_act3/domain/plan_simulator.py'],
      // Shield check
      iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
      accent: 'bg-pine/15 text-pine',
    },
    {
      num: 5,
      title: 'Figuras, capturas y reporte APA',
      desc: 'Se generan 8 figuras (3 SVG topológicos + 5 PNG estilo terminal con planes y comando), 7 capturas para el anexo, y el reporte de 12 páginas en formato APA con 11 referencias bibliográficas.',
      inputs: ['planes verificados', 'stdout.log de Delfi'],
      outputs: ['8 figuras', '7 capturas', 'reporte.md', 'references.bib'],
      files: ['entregables/reporte/', 'tools/render_terminal_png.py'],
      // Doc con líneas
      iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h4',
      accent: 'bg-moss/15 text-moss',
    },
  ];
}
