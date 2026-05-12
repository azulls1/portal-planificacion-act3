import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Reference {
  citation: string;
  url?: string;
}

@Component({
  selector: 'app-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <span class="tag mb-2 inline-block">Criterio 4 · 2 pts</span>
      <h1 class="font-display text-3xl text-forest font-semibold">Reporte APA</h1>
      <p class="text-sm text-pine mt-2 max-w-3xl">
        Documento académico con formato APA 7ª edición. Extensión máxima:
        12 páginas. Cubre instalación de Singularity, ejecución de Snake,
        modelado del rover, escenarios alternativos y referencias.
      </p>
    </header>

    <section class="card-section mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display text-lg text-forest">Documento</h2>
        <a
          href="/entregables/reporte/reporte.pdf"
          target="_blank"
          rel="noopener"
          class="btn btn-cta"
        >
          Descargar PDF
        </a>
      </div>
      <div class="empty-state">
        <div class="empty-state__icon">📄</div>
        <div class="empty-state__title">PDF pendiente</div>
        <div class="empty-state__desc">
          Cargar el reporte final en
          <code class="font-mono">entregables/reporte/reporte.pdf</code>
        </div>
      </div>
    </section>

    <section class="card-section mb-6">
      <h2 class="font-display text-lg text-forest mb-4">Referencias APA</h2>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cita</th>
              <th>Enlace</th>
            </tr>
          </thead>
          <tbody>
            @for (ref of references; track ref.citation; let i = $index) {
              <tr>
                <td class="mono">{{ i + 1 }}</td>
                <td class="text-xs">{{ ref.citation }}</td>
                <td>
                  @if (ref.url) {
                    <a
                      [href]="ref.url"
                      target="_blank"
                      rel="noopener"
                      class="text-forest underline text-xs"
                      >Abrir</a
                    >
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="card-section">
      <h2 class="font-display text-lg text-forest mb-3">Estructura sugerida</h2>
      <ol class="list-decimal list-inside text-sm text-evergreen space-y-1">
        <li>Portada (no cuenta en límite de 12 págs si APA lo permite)</li>
        <li>Resumen / Abstract (1 párrafo)</li>
        <li>Introducción al problema de planificación clásica</li>
        <li>Marco teórico: PDDL, IPC, planners óptimos</li>
        <li>Entorno de ejecución: Singularity en Linux/WSL</li>
        <li>Ejecución de la tarea Snake</li>
        <li>Modelado del problema del rover (decisiones ADR-001..004)</li>
        <li>Escenarios alternativos por integrante</li>
        <li>Conclusiones y aprendizajes</li>
        <li>Referencias (APA 7)</li>
      </ol>
    </section>
  `,
})
export class ReportComponent {
  protected readonly references: Reference[] = [
    {
      citation:
        'International Conference on Automated Planning and Scheduling. (s. f.). Competitions.',
      url: 'https://www.icaps-conference.org/competitions/',
    },
    {
      citation:
        'IPC2018. (s. f.). International Planning Competition 2018: Classical Tracks.',
      url: 'https://ipc2018-classical.bitbucket.io/',
    },
    {
      citation:
        'Singularity Admin Guide. (s. f.). Installing Singularity.',
      url: 'https://docs.sylabs.io/guides/3.5/admin-guide/installation.html',
    },
    {
      citation:
        'Ghallab, M., Nau, D., & Traverso, P. (2016). Automated Planning and Acting. Cambridge University Press.',
    },
    {
      citation:
        'Russell, S., & Norvig, P. (2020). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.',
    },
  ];
}
