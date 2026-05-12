import { SlicePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { ApiService, PlanRun, PlanRunStatus } from '../core/api.service';

@Component({
  selector: 'app-plan-runner',
  standalone: true,
  imports: [SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-3">
        <button
          (click)="run()"
          [disabled]="busy()"
          class="btn btn-cta"
        >
          @if (busy()) {
            <span class="loading-dots"><span></span><span></span><span></span></span>
          } @else {
            Ejecutar planner
          }
        </button>

        <button
          (click)="simulate()"
          [disabled]="busy()"
          class="btn btn-secondary"
        >
          Simular plan persistido
        </button>

        @if (currentRun(); as r) {
          <span
            class="badge"
            [class.badge-active]="r.status === 'completed'"
            [class.badge-info]="r.status === 'running' || r.status === 'queued'"
            [class.badge-error]="r.status === 'failed' || r.status === 'timeout'"
          >
            {{ statusLabel(r.status) }}
          </span>
        }
      </div>

      @if (simulationResult(); as sim) {
        <div
          class="alert"
          [class.alert-success]="sim.success"
          [class.alert-error]="!sim.success"
        >
          <div class="alert__content">
            <div class="alert__title">
              {{ sim.success ? 'Simulación exitosa' : 'Simulación falló' }}
            </div>
            <p class="text-xs">
              cost = {{ sim.cost }} · actions = {{ sim.actions_count }} ·
              goal = {{ sim.goal_satisfied ? '✓' : '✗' }} ·
              sha256 = <code class="font-mono">{{ sim.plan_sha256 | slice: 0 : 12 }}…</code>
            </p>
            @if (!sim.success && sim.first_error) {
              <p class="text-xs mt-2 font-mono">
                paso {{ sim.first_error.step }}: {{ sim.first_error.action }}({{
                  sim.first_error.parameters.join(' ')
                }}) → {{ sim.first_error.error }}
              </p>
            }
          </div>
        </div>
      }

      @if (errorMessage(); as msg) {
        <div class="alert alert-error">
          <div class="alert__content">
            <div class="alert__title">Error</div>
            {{ msg }}
          </div>
        </div>
      }

      @if (currentRun()?.plan_text; as planText) {
        <div class="card-section">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-display text-base text-forest">
              Plan generado por el planner
            </h3>
            @if (currentRun()?.plan_sha256; as sha) {
              <span class="tag">sha256: {{ sha | slice: 0 : 12 }}…</span>
            }
          </div>
          <pre class="dark-surface font-mono p-4 rounded-xl text-xs overflow-x-auto max-h-[400px]"><code>{{ planText }}</code></pre>
        </div>
      }
    </div>
  `,
})
export class PlanRunnerComponent implements OnDestroy {
  @Input({ required: true }) domainSlug = 'domain';
  @Input({ required: true }) problemSlug = 'problem-1';
  @Input() plannerName = 'delfi';

  private readonly api = inject(ApiService);
  private pollSub?: Subscription;

  protected readonly busy = signal(false);
  protected readonly currentRun = signal<PlanRun | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly simulationResult = signal<{
    success: boolean;
    goal_satisfied: boolean;
    cost: number;
    actions_count: number;
    plan_sha256: string;
    first_error: {
      step: number;
      action: string;
      parameters: string[];
      error: string;
    } | null;
  } | null>(null);

  run(): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.simulationResult.set(null);
    this.api
      .createPlanRun({
        domain_slug: this.domainSlug,
        problem_slug: this.problemSlug,
        planner_name: this.plannerName,
      })
      .subscribe({
        next: (run) => {
          this.currentRun.set(run);
          this.startPolling(run.run_id);
        },
        error: (err) => {
          this.busy.set(false);
          this.errorMessage.set(
            err?.error?.detail ?? 'no se pudo encolar la ejecución',
          );
        },
      });
  }

  simulate(): void {
    this.busy.set(true);
    this.errorMessage.set(null);
    this.simulationResult.set(null);
    this.api
      .simulatePlan(this.problemSlug)
      .subscribe({
        next: (result) => {
          this.simulationResult.set(result);
          this.busy.set(false);
        },
        error: (err) => {
          this.busy.set(false);
          this.errorMessage.set(
            err?.error?.detail ?? 'no se pudo simular el plan',
          );
        },
      });
  }

  private startPolling(runId: string): void {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(1500)
      .pipe(
        switchMap(() => this.api.getPlanRun(runId)),
        takeWhile(
          (run) =>
            run.status === 'queued' || run.status === 'running',
          true,
        ),
      )
      .subscribe({
        next: (run) => {
          this.currentRun.set(run);
          if (
            run.status === 'completed' ||
            run.status === 'failed' ||
            run.status === 'timeout'
          ) {
            this.busy.set(false);
          }
        },
        error: () => {
          this.busy.set(false);
          this.errorMessage.set(
            'no se pudo consultar el estado del run (¿Redis/Celery están arriba?)',
          );
        },
      });
  }

  protected statusLabel(status: PlanRunStatus): string {
    return (
      {
        queued: 'En cola',
        running: 'Ejecutando',
        completed: 'Completado',
        failed: 'Falló',
        timeout: 'Timeout',
      }[status] ?? status
    );
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }
}
