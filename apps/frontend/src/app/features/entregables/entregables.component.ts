import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ApiService, PlanFileInfo, PddlFileInfo, CaptureInfo, EntregableInfo } from '../../core/api.service';

interface EntregableRow {
  criterio: 'C1' | 'C2' | 'C3' | 'C4' | '—';
  tipo: 'PDDL' | 'Plan' | 'Figura' | 'Captura' | 'Reporte';
  nombre: string;
  detalle: string;
  ruta: string;
  hash?: string;
}

@Component({
  selector: 'app-entregables',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <h1 class="font-display text-3xl text-forest font-semibold">Entregables</h1>
      <p class="text-sm text-pine mt-2 max-w-3xl">
        Catálogo único de todos los archivos físicos que componen la entrega de
        la Actividad 3. Cada fila lista su criterio de la rúbrica, su ubicación
        en el repositorio y, cuando aplica, su hash SHA-256 para verificación
        de autenticidad.
      </p>
    </header>

    @if (loading()) {
      <div class="skeleton" style="height: 320px;"></div>
    } @else {
      <!-- ZIP descargable -->
      @let zip = entregableZip();
      @if (zip) {
        <section class="card-section mb-6 bg-fern/5 border border-fern/30">
          <div class="flex items-start gap-4">
            <div class="shrink-0 w-12 h-12 rounded-lg bg-fern text-white flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="font-display text-lg text-forest font-semibold">
                ZIP del entregable
              </h2>
              <p class="text-sm text-pine mt-1">
                Empaquetado único con los 4 PDDL del rover, los 4 planes de Delfi 1, capturas
                por criterio, reporte y figuras.
                @if (zip.exists) {
                  Listo para descargar (alineado con la rúbrica de 3 criterios del profesor).
                } @else {
                  Aún no se ha generado. Corre
                  <code class="font-mono text-xs">python tools/build_entregable_zip.py</code>.
                }
              </p>
              @if (zip.exists) {
                <div class="mt-3 flex flex-wrap items-center gap-3">
                  <a
                    [href]="zip.download_url"
                    class="btn-primary text-sm"
                    download
                  >
                    Descargar {{ zip.filename }}
                  </a>
                  <span class="text-xs font-mono text-moss">
                    {{ ((zip.size_bytes ?? 0) / 1024).toFixed(1) }} KB · SHA-256
                    {{ (zip.sha256 ?? '').substring(0, 16) }}…
                  </span>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- Resumen por criterio -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        @for (k of summary(); track k.criterio) {
          <div class="card-section p-4">
            <div class="text-[10px] font-mono text-moss">{{ k.criterio }}</div>
            <div class="font-display text-2xl text-forest font-semibold mt-1">
              {{ k.count }}
            </div>
            <div class="text-xs text-pine mt-1">{{ k.label }}</div>
          </div>
        }
      </section>

      <!-- Tabla -->
      <section class="card-section overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-[11px] font-mono text-moss uppercase">
            <tr class="text-left border-b border-fog/60">
              <th class="py-2 px-3">Criterio</th>
              <th class="py-2 px-3">Tipo</th>
              <th class="py-2 px-3">Nombre</th>
              <th class="py-2 px-3">Detalle</th>
              <th class="py-2 px-3">Ruta</th>
              <th class="py-2 px-3">SHA-256</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.ruta) {
              <tr class="border-b border-fog/30 hover:bg-fog/30">
                <td class="py-2 px-3">
                  <span
                    class="inline-block px-2 py-0.5 rounded text-[10px] font-mono"
                    [class.bg-fern]="row.criterio !== '—'"
                    [class.text-white]="row.criterio !== '—'"
                    [class.bg-fog]="row.criterio === '—'"
                    [class.text-moss]="row.criterio === '—'"
                  >
                    {{ row.criterio }}
                  </span>
                </td>
                <td class="py-2 px-3 text-pine">{{ row.tipo }}</td>
                <td class="py-2 px-3 font-mono text-forest">{{ row.nombre }}</td>
                <td class="py-2 px-3 text-evergreen">{{ row.detalle }}</td>
                <td class="py-2 px-3 font-mono text-[11px] text-moss">{{ row.ruta }}</td>
                <td class="py-2 px-3 font-mono text-[10px] text-moss">
                  {{ row.hash ? row.hash.substring(0, 12) + '…' : '—' }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      <p class="text-xs text-moss mt-6">
        Verificación de hashes:
        <code class="font-mono text-pine">sha256sum entregables/planes/*.txt</code>
      </p>
    }
  `,
})
export class EntregablesComponent implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly loading = signal(true);
  protected readonly rows = signal<EntregableRow[]>([]);
  protected readonly entregableZip = signal<EntregableInfo | null>(null);
  protected readonly summary = signal<
    { criterio: string; count: number; label: string }[]
  >([]);

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

        // PDDL: domain + 3 problems + snake
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

        // Planes
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

        // Capturas
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

        // Figuras (estáticas, conocidas)
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

        // Reporte
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

        // Resumen
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
