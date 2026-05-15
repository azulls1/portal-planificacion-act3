import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Reference {
  citation: string;
  url?: string;
}

interface SectionItem {
  num: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
      .ref-row {
        grid-template-columns: 40px 1fr 90px;
      }
      .toc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 12px;
      }
      .toc-item {
        display: grid;
        grid-template-columns: 36px 1fr;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 12px;
        background: #FFFFFF;
        border: 1px solid var(--color-border);
        transition: border-color 150ms ease, transform 150ms ease;
      }
      .toc-item:hover {
        border-color: var(--color-forest, #2E5A3C);
        transform: translateY(-2px);
      }
      .toc-item__num {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 13px;
        font-weight: 700;
        color: var(--color-forest, #2E5A3C);
        background: rgba(46, 90, 60, 0.08);
        border-radius: 8px;
        display: grid;
        place-items: center;
        height: 32px;
      }
      .toc-item__title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      .toc-item__desc {
        font-size: 12px;
        color: var(--color-text-secondary, #4A5C50);
        margin-top: 2px;
      }
    `,
  ],
  template: `
    <header class="page-hero">
      <div>
        <span class="tag mb-3 inline-block">Criterio 4 · 2 pts</span>
        <h1 class="page-hero__title">Reporte APA</h1>
        <p class="page-hero__lead">
          Documento académico con formato APA 7ª edición. Extensión máxima
          12 páginas. Cubre instalación de Singularity, ejecución de Snake,
          modelado del rover, escenarios alternativos y referencias.
        </p>
      </div>

      <div class="page-hero__stats">
        <div class="stat-card stat-card--accent">
          <div class="stat-card__label">Páginas</div>
          <div class="stat-card__value">≤ 12</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Formato</div>
          <div class="stat-card__value">APA 7</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Secciones</div>
          <div class="stat-card__value">{{ sections.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Referencias</div>
          <div class="stat-card__value">{{ references.length }}</div>
        </div>
      </div>
    </header>

    <nav class="page-toc">
      <a class="page-toc__link" href="#descarga">
        <span class="page-toc__num">01</span> Descarga
      </a>
      <a class="page-toc__link" href="#estructura">
        <span class="page-toc__num">02</span> Estructura
      </a>
      <a class="page-toc__link" href="#referencias">
        <span class="page-toc__num">03</span> Referencias
      </a>
    </nav>

    <!-- ────────── 01 DESCARGA ────────── -->
    <section id="descarga" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">01</div>
        <div>
          <h2 class="page-section__title">Documento final</h2>
          <p class="page-section__lead">
            PDF para entregar al profesor (formato APA, ≤ 12 páginas).
          </p>
        </div>
      </div>

      <div class="split-grid">
        <article class="step-card-v2">
          <div class="step-card-v2__head">
            <div class="step-card-v2__dot">📄</div>
            <div class="step-card-v2__title">reporte.pdf</div>
          </div>
          <div class="step-card-v2__body">
            Cuando el PDF esté en <code>entregables/reporte/reporte.pdf</code>
            podrás descargarlo desde aquí. Mientras tanto, el reporte fuente
            está en <code>reporte.md</code>.
          </div>
          <a href="/entregables/reporte/reporte.pdf" target="_blank" rel="noopener"
             class="btn btn-cta text-sm mt-2 w-fit">
            Descargar PDF
          </a>
        </article>

        <div class="info-grid">
          <div class="info-cell">
            <div class="info-cell__label">Fuente</div>
            <div class="info-cell__value">reporte.md</div>
          </div>
          <div class="info-cell">
            <div class="info-cell__label">Salida</div>
            <div class="info-cell__value">reporte.pdf</div>
          </div>
          <div class="info-cell">
            <div class="info-cell__label">Citas</div>
            <div class="info-cell__value">references.bib</div>
          </div>
          <div class="info-cell">
            <div class="info-cell__label">Estilo</div>
            <div class="info-cell__value">APA 7</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ────────── 02 ESTRUCTURA ────────── -->
    <section id="estructura" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">02</div>
        <div>
          <h2 class="page-section__title">Estructura sugerida</h2>
          <p class="page-section__lead">
            Diez secciones que cubren las recomendaciones APA y los tres
            criterios de la rúbrica.
          </p>
        </div>
      </div>

      <div class="toc-grid">
        @for (s of sections; track s.num) {
          <div class="toc-item">
            <div class="toc-item__num">{{ s.num }}</div>
            <div>
              <div class="toc-item__title">{{ s.title }}</div>
              <div class="toc-item__desc">{{ s.desc }}</div>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- ────────── 03 REFERENCIAS ────────── -->
    <section id="referencias" class="page-section">
      <div class="page-section__header">
        <div class="page-section__num">03</div>
        <div>
          <h2 class="page-section__title">Referencias APA</h2>
          <p class="page-section__lead">
            Bibliografía que respalda el reporte (formato APA 7).
          </p>
        </div>
      </div>

      <div class="data-table">
        <div class="data-table__head ref-row">
          <div>#</div>
          <div>Cita</div>
          <div>Enlace</div>
        </div>
        @for (ref of references; track ref.citation; let i = $index) {
          <div class="data-table__row ref-row row--forest">
            <div class="font-mono text-xs text-pine">{{ i + 1 }}</div>
            <div class="text-xs text-evergreen">{{ ref.citation }}</div>
            <div>
              @if (ref.url) {
                <a [href]="ref.url" target="_blank" rel="noopener"
                   class="text-forest underline text-xs">Abrir →</a>
              } @else {
                <span class="text-xs text-moss">—</span>
              }
            </div>
          </div>
        }
        <div class="data-table__foot">
          <span>Total referencias: <strong>{{ references.length }}</strong></span>
          <span>Formato: APA 7ª edición</span>
        </div>
      </div>
    </section>
  `,
  host: { class: 'block max-w-5xl mx-auto' },
})
export class ReportComponent {
  protected readonly sections: SectionItem[] = [
    { num: '01', title: 'Portada', desc: 'Identificación del autor, materia, fecha. No cuenta en límite de 12 págs si APA lo permite.' },
    { num: '02', title: 'Resumen / Abstract', desc: 'Un párrafo (~150 palabras) describiendo el trabajo.' },
    { num: '03', title: 'Introducción', desc: 'Contextualiza la planificación clásica y la motivación del trabajo.' },
    { num: '04', title: 'Marco teórico', desc: 'PDDL, IPC, planners óptimos y heurísticas.' },
    { num: '05', title: 'Entorno de ejecución', desc: 'Singularity / Apptainer en Linux y WSL2.' },
    { num: '06', title: 'Tarea Snake', desc: 'Ejecución de Delfi 1 sobre el problema 1 del IPC2018.' },
    { num: '07', title: 'Modelado del rover', desc: 'Decisiones de diseño documentadas como ADR-001..004.' },
    { num: '08', title: 'Escenarios alternativos', desc: 'Diseño y ejecución de los dos problemas extra.' },
    { num: '09', title: 'Conclusiones', desc: 'Aprendizajes, limitaciones y trabajo futuro.' },
    { num: '10', title: 'Referencias', desc: 'Bibliografía en formato APA 7.' },
  ];

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
