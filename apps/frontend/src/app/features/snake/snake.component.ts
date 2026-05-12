import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

type Tab = 'instalacion' | 'ejecucion' | 'plan';

@Component({
  selector: 'app-snake',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <span class="tag mb-2 inline-block">Criterio 1 · 3 pts</span>
      <h1 class="font-display text-3xl text-forest font-semibold">
        Tarea Snake — IPC2018 Classical Track (optimal)
      </h1>
      <p class="text-sm text-pine mt-2 max-w-3xl">
        Ejecución del planner ganador del optimal track del IPC2018 sobre el
        problema 1 de la tarea Snake, dentro de un contenedor Singularity.
      </p>
    </header>

    <div class="tabs">
      <button
        class="tab"
        [class.active]="tab() === 'instalacion'"
        (click)="tab.set('instalacion')"
      >
        Instalación
      </button>
      <button
        class="tab"
        [class.active]="tab() === 'ejecucion'"
        (click)="tab.set('ejecucion')"
      >
        Ejecución
      </button>
      <button
        class="tab"
        [class.active]="tab() === 'plan'"
        (click)="tab.set('plan')"
      >
        Plan generado
      </button>
    </div>

    @switch (tab()) {
      @case ('instalacion') {
        <section class="tab-panel animate-fadeInUp">
          <div class="alert alert-info mb-6">
            <div class="alert__content">
              <div class="alert__title">Planner ganador del IPC2018 optimal track</div>
              <strong class="font-mono">Delfi 1</strong> · Katz, Sohrabi, Samulowitz & Sievers (2018)
              ·
              <a
                class="text-pine underline"
                href="https://bitbucket.org/ipc2018-classical/team23/src/ipc-2018-seq-opt/"
                target="_blank" rel="noopener"
              >repo team23</a>
            </div>
          </div>

          <h2 class="font-display text-xl text-forest mb-3">Pasos verificados</h2>
          <ol class="list-decimal list-inside text-sm text-evergreen space-y-2">
            <li>
              Instalar Singularity siguiendo la
              <a
                class="text-forest underline"
                href="https://docs.sylabs.io/guides/3.5/admin-guide/installation.html"
                target="_blank" rel="noopener"
              >guía oficial Sylabs 3.5</a>
              (la referenciada por el profesor).
            </li>
            <li>
              Verificar:
              <code class="font-mono bg-fog/40 px-2 py-0.5 rounded">singularity --version</code>
            </li>
            <li>
              Construir la imagen de Delfi 1:
              <code class="font-mono bg-fog/40 px-2 py-0.5 rounded">cd infra/singularity && ./pull-planner.sh</code>
              (descarga la receta del repo team23 y ejecuta
              <code class="font-mono">sudo singularity build planner.img Singularity</code>).
            </li>
            <li>
              Los archivos PDDL de Snake ya están descargados en
              <code class="font-mono">entregables/pddl/snake-ipc2018/</code>
              (domain.pddl + p01.pddl), bajados de
              <code class="font-mono">bitbucket.org/ipc2018-classical/domains/opt/snake/</code>.
            </li>
          </ol>

          <div class="empty-state mt-8">
            <div class="empty-state__icon">📸</div>
            <div class="empty-state__title">Captura pendiente</div>
            <div class="empty-state__desc">
              Subir a <code class="font-mono">entregables/capturas/c1-singularity-install.png</code>
              y a <code class="font-mono">apps/frontend/public/images/screenshots/</code>
            </div>
          </div>
        </section>
      }
      @case ('ejecucion') {
        <section class="tab-panel animate-fadeInUp">
          <h2 class="font-display text-xl text-forest mb-3">
            Script EXACTO del IPC2018 "How can I test my containers?"
          </h2>
          <pre class="dark-surface font-mono p-4 rounded-xl text-xs overflow-x-auto"><code>mkdir rundir
cp entregables/pddl/snake-ipc2018/domain.pddl rundir/
cp entregables/pddl/snake-ipc2018/p01.pddl rundir/problem.pddl

RUNDIR="$(pwd)/rundir"
DOMAIN="$RUNDIR/domain.pddl"
PROBLEM="$RUNDIR/problem.pddl"
PLANFILE="$RUNDIR/sas_plan"
ulimit -t 1800
ulimit -v 8388608

singularity run -C -H $RUNDIR planner.img $DOMAIN $PROBLEM $PLANFILE</code></pre>

          <div class="alert alert-info mt-6">
            <div class="alert__content">
              <div class="alert__title">Detalles del comando</div>
              <code class="font-mono">singularity run</code> (no <em>exec</em>) ·
              <code class="font-mono">-C</code> contain ·
              <code class="font-mono">-H</code> home = rundir ·
              imagen <code class="font-mono">.img</code> (no <em>.sif</em>) ·
              límites del IPC oficial: 30 min CPU, 8 GB RAM.
            </div>
          </div>

          <div class="alert alert-warning mt-4">
            <div class="alert__content">
              <div class="alert__title">Si cicla por recursos (laptop)</div>
              Documenta el ciclado con capturas — nivel 3 de la rúbrica = 2 pts
              (aceptable cuando hay restricciones técnicas).
            </div>
          </div>

          <div class="empty-state mt-8">
            <div class="empty-state__icon">📸</div>
            <div class="empty-state__title">Captura pendiente</div>
            <div class="empty-state__desc">
              <code class="font-mono">c1-snake-execution-terminal.png</code>
            </div>
          </div>
        </section>
      }
      @case ('plan') {
        <section class="tab-panel animate-fadeInUp">
          <h2 class="font-display text-xl text-forest mb-3">Plan generado</h2>
          <p class="text-sm text-pine mb-4">
            Una vez ejecutado el planner, el archivo del plan se almacena en
            <code class="font-mono bg-fog/40 px-2 py-0.5 rounded">entregables/planes/snake-problem-1-plan.txt</code>
            y se muestra aquí.
          </p>
          <div class="empty-state">
            <div class="empty-state__icon">📋</div>
            <div class="empty-state__title">Plan pendiente</div>
            <div class="empty-state__desc">
              Generar y cargar el plan para activar esta sección.
            </div>
          </div>
        </section>
      }
    }
  `,
})
export class SnakeComponent {
  protected readonly tab = signal<Tab>('instalacion');
}
