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

type Tab = 'enunciado' | 'topologia' | 'domain' | 'problem' | 'plan';

@Component({
  selector: 'app-rover',
  standalone: true,
  imports: [RoverGraphComponent, PlanRunnerComponent, SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <span class="tag mb-2 inline-block">Criterio 2 · 5 pts</span>
      <h1 class="font-display text-3xl text-forest font-semibold">
        Problema del rover — transcripción a PDDL
      </h1>
      <p class="text-sm text-pine mt-2 max-w-3xl">
        Modelado clásico: un rover transporta minerales desde sus localidades de
        origen hasta un laboratorio, respetando aristas dirigidas y capacidad de
        carga = 1.
      </p>
    </header>

    <div class="tabs">
      <button class="tab" [class.active]="tab() === 'enunciado'" (click)="tab.set('enunciado')">
        Enunciado
      </button>
      <button class="tab" [class.active]="tab() === 'topologia'" (click)="tab.set('topologia')">
        Topología
      </button>
      <button class="tab" [class.active]="tab() === 'domain'" (click)="tab.set('domain')">
        domain.pddl
      </button>
      <button class="tab" [class.active]="tab() === 'problem'" (click)="tab.set('problem')">
        problem-1.pddl
      </button>
      <button class="tab" [class.active]="tab() === 'plan'" (click)="tab.set('plan')">
        Plan paso a paso
      </button>
    </div>

    @switch (tab()) {
      @case ('enunciado') {
        <section class="tab-panel animate-fadeInUp">
          <article class="card-section">
            <p class="text-sm text-evergreen leading-relaxed">
              Un robot tipo rover excavó dos rocas (minerales M1 y M2) en las
              localidades L1 y L2 respectivamente. Debido al mal tiempo no fue
              posible trasladarlos en su momento. Se solicita generar el plan que
              debe seguir el rover para llevar ambos minerales al laboratorio
              ubicado en L5.
            </p>
            <p class="text-sm text-evergreen leading-relaxed mt-3">
              <strong>Restricciones de trayectoria:</strong>
            </p>
            <ul class="list-disc list-inside text-sm text-evergreen mt-2 space-y-1">
              <li>L1 ↔ L3: bidireccional</li>
              <li>L3 → L2: <em>unidireccional</em></li>
              <li>L2 → L4: <em>unidireccional</em></li>
              <li>L3 ↔ L4: bidireccional</li>
              <li>L4 ↔ L5: bidireccional</li>
            </ul>
          </article>
        </section>
      }
      @case ('topologia') {
        <section class="tab-panel animate-fadeInUp">
          <div class="card-section">
            <h2 class="font-display text-lg text-forest mb-4">
              Grafo de localidades
            </h2>
            <app-rover-graph />
          </div>
        </section>
      }
      @case ('domain') {
        <section class="tab-panel animate-fadeInUp">
          <div class="card-section">
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-display text-lg text-forest">domain.pddl</h2>
              @if (domainSha()) {
                <span class="tag">sha256: {{ domainSha() | slice: 0 : 12 }}…</span>
              }
            </div>
            <pre class="dark-surface font-mono p-4 rounded-xl text-xs overflow-x-auto max-h-[600px]"><code>{{ domainText() }}</code></pre>
          </div>
        </section>
      }
      @case ('problem') {
        <section class="tab-panel animate-fadeInUp">
          <div class="card-section">
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-display text-lg text-forest">problem-1.pddl</h2>
              @if (problemSha()) {
                <span class="tag">sha256: {{ problemSha() | slice: 0 : 12 }}…</span>
              }
            </div>
            <pre class="dark-surface font-mono p-4 rounded-xl text-xs overflow-x-auto max-h-[600px]"><code>{{ problemText() }}</code></pre>
          </div>
        </section>
      }
      @case ('plan') {
        <section class="tab-panel animate-fadeInUp">
          <div class="card-section">
            <h2 class="font-display text-lg text-forest mb-2">
              Plan óptimo de Delfi 1 paso a paso
            </h2>
            <p class="text-sm text-pine mb-6">
              14 acciones · coste 14 · usa el panel de controles para reproducir
              la trayectoria sobre el grafo a la izquierda.
            </p>

            <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
              <!-- Grafo animado a la izquierda -->
              <div>
                <app-rover-graph [step]="step()" [plan]="planRaw" />

                <!-- Controles de reproducción -->
                <div class="mt-4 flex flex-wrap items-center gap-2 justify-center">
                  <button
                    type="button"
                    class="btn btn-secondary text-sm"
                    (click)="reset()"
                    [disabled]="step() === 0 && !playing()"
                    aria-label="Reset"
                  >
                    ⏮ Reset
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary text-sm"
                    (click)="stepBack()"
                    [disabled]="step() === 0"
                    aria-label="Atrás"
                  >
                    ◀ Atrás
                  </button>
                  <button
                    type="button"
                    class="btn btn-cta text-sm min-w-[110px]"
                    (click)="togglePlay()"
                  >
                    @if (playing()) {
                      ⏸ Pausa
                    } @else if (step() === expectedPlan.length) {
                      ↻ Repetir
                    } @else {
                      ▶ Play
                    }
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary text-sm"
                    (click)="stepForward()"
                    [disabled]="step() === expectedPlan.length"
                    aria-label="Siguiente"
                  >
                    Sig. ▶
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary text-sm"
                    (click)="jumpEnd()"
                    [disabled]="step() === expectedPlan.length"
                    aria-label="Fin"
                  >
                    ⏭ Fin
                  </button>
                </div>

                <!-- Progreso -->
                <div class="mt-3">
                  <div class="flex justify-between text-[10px] font-mono text-moss mb-1">
                    <span>paso {{ step() }} / {{ expectedPlan.length }}</span>
                    <span>coste acumulado: {{ step() }}</span>
                  </div>
                  <div class="w-full h-1.5 rounded-full bg-fog overflow-hidden">
                    <div
                      class="h-full bg-fern transition-all duration-500"
                      [style.width.%]="progressPercent()"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Lista de acciones (scrollable, item activo resaltado) -->
              <ol
                class="space-y-1.5 max-h-[600px] overflow-y-auto pr-2"
                aria-label="Acciones del plan"
              >
                @for (action of expectedPlan; track action.step; let i = $index) {
                  <li
                    [class]="actionRowClass(i)"
                    (click)="jumpTo(i + 1)"
                  >
                    <span [class]="actionBadgeClass(i)">
                      {{ action.step }}
                    </span>
                    <span class="font-mono text-xs">
                      ({{ action.name }} {{ action.args.join(' ') }})
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

            <div class="mt-8 pt-6 border-t border-fog">
              <h3 class="font-display text-base text-forest mb-3">
                Re-ejecutar / Simular
              </h3>
              <app-plan-runner
                domainSlug="domain"
                problemSlug="problem-1"
              />
            </div>
          </div>
        </section>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class RoverComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);

  protected readonly tab = signal<Tab>('enunciado');
  protected readonly domainText = signal<string>('Cargando domain.pddl...');
  protected readonly problemText = signal<string>('Cargando problem-1.pddl...');
  protected readonly domainSha = signal<string | null>(null);
  protected readonly problemSha = signal<string | null>(null);

  // Playback del plan
  protected readonly step = signal(0);
  protected readonly playing = signal(false);
  private playTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly expectedPlan = [
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

  protected readonly planRaw: string[] = this.expectedPlan.map(
    (a) => `(${a.name} ${a.args.join(' ')})`,
  );

  protected readonly progressPercent = computed(() =>
    Math.round((this.step() / this.expectedPlan.length) * 100),
  );

  protected actionRowClass(i: number): string {
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

  protected actionBadgeClass(i: number): string {
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
    if (this.step() < this.expectedPlan.length) {
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
    this.step.set(this.expectedPlan.length);
  }
  protected jumpTo(s: number): void {
    this.stopTimer();
    this.step.set(Math.max(0, Math.min(s, this.expectedPlan.length)));
  }
  protected togglePlay(): void {
    if (this.playing()) {
      this.stopTimer();
      return;
    }
    if (this.step() === this.expectedPlan.length) {
      this.step.set(0);
    }
    this.playing.set(true);
    this.playTimer = setInterval(() => {
      if (this.step() >= this.expectedPlan.length) {
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
