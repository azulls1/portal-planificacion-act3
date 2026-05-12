import { SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
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
      <span class="tag mb-2 inline-block">Criterio 2 · 3 pts</span>
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
            <h2 class="font-display text-lg text-forest mb-4">
              Plan óptimo esperado (coste 14)
            </h2>
            <ol class="stagger-children space-y-2">
              @for (action of expectedPlan; track action.step) {
                <li
                  class="card-compact animate-fadeInUp flex items-center gap-3"
                >
                  <span class="badge">{{ action.step }}</span>
                  <span class="font-mono text-sm text-forest">
                    ({{ action.name }} {{ action.args.join(' ') }})
                  </span>
                </li>
              }
            </ol>

            <div class="alert alert-success mt-6">
              <div class="alert__content">
                <div class="alert__title">14 acciones · coste 14</div>
                Plan válido bajo capacidad = 1: rover hace dos viajes al laboratorio,
                uno por mineral. Cada acción cumple sus precondiciones y el estado
                final satisface ambos sub-objetivos.
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
export class RoverComponent implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly tab = signal<Tab>('enunciado');
  protected readonly domainText = signal<string>('Cargando domain.pddl...');
  protected readonly problemText = signal<string>('Cargando problem-1.pddl...');
  protected readonly domainSha = signal<string | null>(null);
  protected readonly problemSha = signal<string | null>(null);

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
}
