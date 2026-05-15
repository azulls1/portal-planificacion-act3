import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ApiService, PlanFileInfo, PddlFileInfo, CaptureInfo, EntregableInfo } from '../../core/api.service';

interface EntregableRow {
  criterio: 'C1' | 'C2' | 'C3' | 'C4' | '—';
  tipo: 'PDDL' | 'Plan' | 'Figura' | 'Captura' | 'Reporte';
  nombre: string;
  detalle: string;
  ruta: string;
  hash?: string;
}

const CRITERIO_COLOR: Record<string, 'blue' | 'green' | 'amber' | 'forest'> = {
  C1: 'blue',
  C2: 'green',
  C3: 'amber',
  C4: 'forest',
};

@Component({
  selector: 'app-entregables',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
      .entregables-table__head,
      .entregables-table__row {
        grid-template-columns: 64px 96px 1.4fr 1.5fr 1fr 100px;
      }
      @media (max-width: 900px) {
        .entregables-table__head {
          display: none;
        }
        .entregables-table__row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
        }
        .entregables-table__row > * {
          font-size: 12px;
        }
      }

      .filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 14px;
      }
      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 9999px;
        background: #FFFFFF;
        border: 1px solid var(--color-border);
        font-size: 12px;
        color: var(--color-text-secondary, #4A5C50);
        cursor: pointer;
        transition: all 150ms ease;
      }
      .filter-chip:hover {
        border-color: var(--color-forest, #2E5A3C);
      }
      .filter-chip.is-active {
        background: var(--color-forest, #2E5A3C);
        border-color: var(--color-forest, #2E5A3C);
        color: #FFFFFF;
      }
      .filter-chip__count {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 9999px;
        background: rgba(0, 0, 0, 0.06);
      }
      .filter-chip.is-active .filter-chip__count {
        background: rgba(255, 255, 255, 0.2);
      }
    `,
  ],
  template: `
    <header class="page-hero">
      <div>
        <span class="tag mb-3 inline-block">Catálogo único</span>
        <h1 class="page-hero__title">Entregables</h1>
        <p class="page-hero__lead">
          Todos los archivos físicos que componen la entrega de la Actividad 3.
          Cada fila indica su criterio de la rúbrica, ubicación en el repositorio
          y hash SHA-256 cuando aplica.
        </p>
      </div>

      <div class="page-hero__stats">
        <div class="stat-card stat-card--accent">
          <div class="stat-card__label">Total archivos</div>
          <div class="stat-card__value">{{ rows().length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Planes</div>
          <div class="stat-card__value">{{ countByType('Plan') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">PDDL</div>
          <div class="stat-card__value">{{ countByType('PDDL') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Figuras</div>
          <div class="stat-card__value">{{ countByType('Figura') }}</div>
        </div>
      </div>
    </header>

    @if (loading()) {
      <div class="skeleton mt-8" style="height: 320px; border-radius: 14px;"></div>
    } @else {
      <!-- ZIP -->
      @let zip = entregableZip();
      @if (zip) {
        <section class="page-section">
          <div class="page-section__header">
            <div class="page-section__num">⬇</div>
            <div>
              <h2 class="page-section__title">ZIP del entregable</h2>
              <p class="page-section__lead">
                Empaquetado único con PDDL, planes, capturas, reporte y figuras.
              </p>
            </div>
          </div>

          <div class="split-grid">
            <div class="step-card-v2">
              <div class="step-card-v2__head">
                <div class="step-card-v2__dot">📦</div>
                <div class="step-card-v2__title">{{ zip.exists ? zip.filename : 'No generado' }}</div>
              </div>
              <div class="step-card-v2__body">
                @if (zip.exists) {
                  Listo para descargar (alineado con la rúbrica de 3 criterios del profesor).
                  <div class="mt-3 flex flex-wrap items-center gap-3">
                    <a [href]="zip.download_url" class="btn btn-cta text-sm" download>
                      Descargar
                    </a>
                    <span class="text-xs font-mono text-moss">
                      {{ ((zip.size_bytes ?? 0) / 1024).toFixed(1) }} KB
                    </span>
                  </div>
                } @else {
                  Aún no se ha generado. Corre
                  <code>python tools/build_entregable_zip.py</code>.
                }
              </div>
            </div>

            <div class="info-grid">
              <div class="info-cell info-cell--full">
                <div class="info-cell__label">SHA-256</div>
                <div class="info-cell__value text-xs">
                  {{ zip.exists ? zip.sha256 : '—' }}
                </div>
              </div>
              <div class="info-cell">
                <div class="info-cell__label">Estado</div>
                <div class="info-cell__value">{{ zip.exists ? '✓ Generado' : '✗ Pendiente' }}</div>
              </div>
              <div class="info-cell">
                <div class="info-cell__label">Tamaño</div>
                <div class="info-cell__value">{{ zip.exists ? (((zip.size_bytes ?? 0) / 1024).toFixed(1) + ' KB') : '—' }}</div>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- distribución por criterio -->
      <section class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">Σ</div>
          <div>
            <h2 class="page-section__title">Resumen por criterio</h2>
            <p class="page-section__lead">
              Conteo de archivos asociados a cada criterio de la rúbrica.
            </p>
          </div>
        </div>

        <div class="dist-grid">
          @for (k of summary(); track k.criterio) {
            <div class="dist-card" [class]="'dist-card dist-card--' + critColor(k.criterio)">
              <div class="dist-card__bar"></div>
              <div class="dist-card__verb">{{ k.criterio }}</div>
              <div class="dist-card__count">{{ k.count }}</div>
              <div class="dist-card__pct">{{ k.label }}</div>
            </div>
          }
        </div>
      </section>

      <!-- catálogo completo -->
      <section class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">≡</div>
          <div>
            <h2 class="page-section__title">Catálogo completo</h2>
            <p class="page-section__lead">
              Filtra por criterio para enfocarte en una parte de la entrega.
            </p>
          </div>
        </div>

        <div class="filter-bar">
          <button class="filter-chip" [class.is-active]="filter() === 'all'" (click)="filter.set('all')">
            Todos <span class="filter-chip__count">{{ rows().length }}</span>
          </button>
          <button class="filter-chip" [class.is-active]="filter() === 'C1'" (click)="filter.set('C1')">
            C1 · Snake <span class="filter-chip__count">{{ countByCrit('C1') }}</span>
          </button>
          <button class="filter-chip" [class.is-active]="filter() === 'C2'" (click)="filter.set('C2')">
            C2 · Rover <span class="filter-chip__count">{{ countByCrit('C2') }}</span>
          </button>
          <button class="filter-chip" [class.is-active]="filter() === 'C3'" (click)="filter.set('C3')">
            C3 · Escenarios <span class="filter-chip__count">{{ countByCrit('C3') }}</span>
          </button>
          <button class="filter-chip" [class.is-active]="filter() === 'C4'" (click)="filter.set('C4')">
            C4 · Reporte <span class="filter-chip__count">{{ countByCrit('C4') }}</span>
          </button>
        </div>

        <div class="data-table">
          <div class="data-table__head entregables-table__head">
            <div>Criterio</div>
            <div>Tipo</div>
            <div>Nombre</div>
            <div>Detalle</div>
            <div>Ruta</div>
            <div>SHA-256</div>
          </div>
          @for (row of filteredRows(); track row.ruta) {
            <div
              class="data-table__row entregables-table__row"
              [class]="'data-table__row entregables-table__row row--' + critColor(row.criterio)"
            >
              <div>
                <span class="verb-pill" [class]="'verb-pill verb-pill--' + critColor(row.criterio)">
                  {{ row.criterio }}
                </span>
              </div>
              <div class="text-xs text-pine">{{ row.tipo }}</div>
              <div class="font-mono text-xs text-forest">{{ row.nombre }}</div>
              <div class="text-xs text-evergreen">{{ row.detalle }}</div>
              <div class="font-mono text-[11px] text-moss">{{ row.ruta }}</div>
              <div class="font-mono text-[10px] text-moss">
                {{ row.hash ? row.hash.substring(0, 12) + '…' : '—' }}
              </div>
            </div>
          }
          <div class="data-table__foot">
            <span>Mostrando: <strong>{{ filteredRows().length }}</strong> de {{ rows().length }}</span>
            <span>Verificación: <code class="font-mono">sha256sum entregables/planes/*.txt</code></span>
          </div>
        </div>
      </section>
    }
  `,
  host: { class: 'block max-w-6xl mx-auto' },
})
export class EntregablesComponent implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly loading = signal(true);
  protected readonly rows = signal<EntregableRow[]>([]);
  protected readonly entregableZip = signal<EntregableInfo | null>(null);
  protected readonly summary = signal<
    { criterio: string; count: number; label: string }[]
  >([]);
  protected readonly filter = signal<'all' | 'C1' | 'C2' | 'C3' | 'C4'>('all');

  protected readonly filteredRows = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.rows() : this.rows().filter((r) => r.criterio === f);
  });

  protected countByType(t: EntregableRow['tipo']): number {
    return this.rows().filter((r) => r.tipo === t).length;
  }

  protected countByCrit(c: 'C1' | 'C2' | 'C3' | 'C4'): number {
    return this.rows().filter((r) => r.criterio === c).length;
  }

  protected critColor(c: string): 'blue' | 'green' | 'amber' | 'forest' {
    return CRITERIO_COLOR[c] ?? 'forest';
  }

  ngOnInit(): void {
    Promise.all([
      this.api.listPlanFiles().toPromise(),
      this.api.listPddlFiles().toPromise(),
      this.api.listCaptures().toPromise().catch(() => [] as CaptureInfo[]),
      this.api.getEntregableInfo().toPromise().catch(() => null),
    ])
      .then(([plans, pddls, capturas, zip]) => {
        if (zip) this.entregableZip.set(zip);
        const all: EntregableRow[] = [];

        (pddls ?? []).forEach((p: PddlFileInfo) => {
          const isSnake = p.slug.startsWith('snake');
          const isDomain = p.kind === 'domain';
          all.push({
            criterio: isSnake ? 'C1' : isDomain ? '—' : (p.slug === 'problem-1' ? 'C2' : 'C3'),
            tipo: 'PDDL',
            nombre: `${p.slug}.pddl`,
            detalle: isDomain
              ? `Dominio · ${(p.size_bytes / 1024).toFixed(1)} KB · ${p.is_valid ? 'sintaxis válida' : 'error de sintaxis'}`
              : isSnake
                ? `Original IPC2018 · ${(p.size_bytes / 1024).toFixed(1)} KB`
                : `Problema rover · ${(p.size_bytes / 1024).toFixed(1)} KB`,
            ruta: isSnake
              ? `entregables/pddl/snake-ipc2018/${p.slug}.pddl`
              : `entregables/pddl/${p.slug}.pddl`,
            hash: p.sha256,
          });
        });

        (plans ?? []).forEach((plan: PlanFileInfo) => {
          const isSnake = plan.slug.startsWith('snake');
          const idx = plan.slug.split('-').pop();
          all.push({
            criterio: isSnake ? 'C1' : (idx === '1' ? 'C2' : 'C3'),
            tipo: 'Plan',
            nombre: plan.filename,
            detalle: `${plan.actions_count} acciones · costo ${plan.total_cost}`,
            ruta: `entregables/planes/${plan.filename}`,
            hash: plan.sha256,
          });
        });

        (capturas ?? []).forEach((c: CaptureInfo) => {
          const crit = c.criterio.toUpperCase() as EntregableRow['criterio'];
          all.push({
            criterio: ['C1', 'C2', 'C3', 'C4'].includes(crit) ? crit : '—',
            tipo: 'Captura',
            nombre: c.filename,
            detalle: `Captura por criterio · ${(c.size_bytes / 1024).toFixed(1)} KB`,
            ruta: `entregables/capturas/${c.filename}`,
          });
        });

        const figuras: { name: string; criterio: EntregableRow['criterio']; detalle: string }[] = [
          { name: 'figura-01-singularity-snake.png', criterio: 'C1', detalle: 'Comando IPC2018 ejecutando Snake' },
          { name: 'figura-02-snake-plan.png', criterio: 'C1', detalle: 'Plan obtenido por Delfi 1 (24 acciones)' },
          { name: 'figura-03-rover-topologia.svg', criterio: 'C2', detalle: 'Topología del problema base' },
          { name: 'figura-04-rover-plan-1.png', criterio: 'C2', detalle: 'Plan del rover (14 acciones)' },
          { name: 'figura-05-escenario-1.svg', criterio: 'C3', detalle: 'Topología del escenario 1' },
          { name: 'figura-06-escenario-1-plan.png', criterio: 'C3', detalle: 'Plan escenario 1 (19 acciones)' },
          { name: 'figura-07-escenario-2.svg', criterio: 'C3', detalle: 'Topología del escenario 2' },
          { name: 'figura-08-escenario-2-plan.png', criterio: 'C3', detalle: 'Plan escenario 2 (20 acciones)' },
        ];
        figuras.forEach((f) =>
          all.push({
            criterio: f.criterio,
            tipo: 'Figura',
            nombre: f.name,
            detalle: f.detalle,
            ruta: `entregables/reporte/figuras/${f.name}`,
          }),
        );

        all.push({
          criterio: 'C4',
          tipo: 'Reporte',
          nombre: 'reporte.md',
          detalle: 'Reporte APA fuente (exportable a PDF)',
          ruta: 'entregables/reporte/reporte.md',
        });
        all.push({
          criterio: 'C4',
          tipo: 'Reporte',
          nombre: 'references.bib',
          detalle: '11 referencias APA en BibTeX',
          ruta: 'entregables/reporte/references.bib',
        });

        this.rows.set(all);

        const byCrit: Record<string, { count: number; label: string }> = {
          C1: { count: 0, label: 'Snake IPC2018' },
          C2: { count: 0, label: 'Rover base' },
          C3: { count: 0, label: 'Escenarios alt.' },
          C4: { count: 0, label: 'Reporte APA' },
        };
        all.forEach((r) => {
          if (r.criterio in byCrit) byCrit[r.criterio].count += 1;
        });
        this.summary.set(
          Object.entries(byCrit).map(([c, v]) => ({
            criterio: c,
            count: v.count,
            label: v.label,
          })),
        );
      })
      .finally(() => this.loading.set(false));
  }
}
