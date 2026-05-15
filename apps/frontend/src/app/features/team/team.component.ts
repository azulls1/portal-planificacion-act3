import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ApiService, TeamMember } from '../../core/api.service';

@Component({
  selector: 'app-team',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
      }
      .author-card {
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 22px;
        align-items: center;
        padding: 28px 32px;
        border-radius: 18px;
        background: linear-gradient(135deg, #FFFFFF 0%, #F7F8F7 100%);
        border: 1px solid var(--color-border);
        overflow: hidden;
      }
      .author-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(400px 200px at 100% 0%, rgba(46, 90, 60, 0.10), transparent 60%);
        pointer-events: none;
      }
      .author-card > * {
        position: relative;
        z-index: 1;
      }
      .author-avatar {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-forest, #2E5A3C) 0%, #1F4B30 100%);
        color: #FFFFFF;
        display: grid;
        place-items: center;
        font-family: var(--font-display, 'Fraunces', serif);
        font-size: 32px;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(4, 32, 44, 0.18);
      }
      .author-name {
        font-family: var(--font-display, 'Fraunces', serif);
        font-size: 26px;
        font-weight: 600;
        color: var(--color-forest, #2E5A3C);
        line-height: 1.1;
      }
      .author-role {
        margin-top: 6px;
        font-size: 13px;
        color: var(--color-text-secondary, #4A5C50);
      }

      .resp-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 12px;
        margin-top: 24px;
      }
      .resp-card {
        position: relative;
        padding: 16px;
        border-radius: 12px;
        background: #FFFFFF;
        border: 1px solid var(--color-border);
        overflow: hidden;
        transition: border-color 150ms ease, transform 150ms ease;
      }
      .resp-card:hover {
        border-color: var(--color-forest, #2E5A3C);
        transform: translateY(-2px);
      }
      .resp-card__icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(46, 90, 60, 0.08);
        color: var(--color-forest, #2E5A3C);
        display: grid;
        place-items: center;
        font-size: 16px;
        margin-bottom: 10px;
      }
      .resp-card__crit {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 10.5px;
        font-weight: 700;
        color: var(--color-forest, #2E5A3C);
      }
      .resp-card__title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-top: 4px;
        line-height: 1.3;
      }

      .affiliation {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        border-radius: 12px;
        background: var(--color-forest, #2E5A3C);
        color: #FFFFFF;
      }
      .affiliation__name {
        font-family: var(--font-display, 'Fraunces', serif);
        font-size: 16px;
        font-weight: 600;
      }
      .affiliation__sub {
        font-size: 11px;
        opacity: 0.75;
      }
      @media (max-width: 720px) {
        .resp-grid {
          grid-template-columns: 1fr 1fr;
        }
        .author-card {
          grid-template-columns: 1fr;
          text-align: center;
          justify-items: center;
        }
      }
    `,
  ],
  template: `
    <header class="page-hero page-hero--single">
      <div>
        <span class="tag mb-3 inline-block">Trabajo individual</span>
        <h1 class="page-hero__title">Autor</h1>
        <p class="page-hero__lead">
          Esta actividad es trabajo individual. A continuación se identifica al
          autor responsable del modelado, ejecución y redacción del entregable.
        </p>
      </div>
    </header>

    @let a = author();

    @if (loading()) {
      <div class="skeleton mt-8" style="height: 220px; border-radius: 18px;"></div>
    } @else if (a) {
      <section class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">👤</div>
          <div>
            <h2 class="page-section__title">Perfil</h2>
            <p class="page-section__lead">
              Identificación, rol y afiliación institucional.
            </p>
          </div>
        </div>

        <article class="author-card">
          <div class="author-avatar">{{ initials(a.name) }}</div>
          <div>
            <h2 class="author-name">{{ a.name }}</h2>
            <p class="text-sm text-moss font-mono mt-1">{{ a.slug }}</p>
            <p class="author-role">{{ a.role }}</p>
          </div>
        </article>
      </section>

      <section class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">📋</div>
          <div>
            <h2 class="page-section__title">Responsabilidades</h2>
            <p class="page-section__lead">
              Aporte por criterio de la rúbrica.
            </p>
          </div>
        </div>

        <div class="resp-grid">
          <div class="resp-card">
            <div class="resp-card__icon">🐍</div>
            <div class="resp-card__crit">CRITERIO 1</div>
            <div class="resp-card__title">Ejecución de Delfi 1 sobre la tarea Snake del IPC2018</div>
          </div>
          <div class="resp-card">
            <div class="resp-card__icon">🤖</div>
            <div class="resp-card__crit">CRITERIO 2</div>
            <div class="resp-card__title">Transcripción del problema del rover a PDDL</div>
          </div>
          <div class="resp-card">
            <div class="resp-card__icon">🧪</div>
            <div class="resp-card__crit">CRITERIO 2</div>
            <div class="resp-card__title">Diseño de dos escenarios alternativos (problem-2 / problem-3)</div>
          </div>
          <div class="resp-card">
            <div class="resp-card__icon">📄</div>
            <div class="resp-card__crit">CRITERIO 3</div>
            <div class="resp-card__title">Redacción del reporte APA</div>
          </div>
        </div>
      </section>

      <section class="page-section">
        <div class="page-section__header">
          <div class="page-section__num">🎓</div>
          <div>
            <h2 class="page-section__title">Afiliación</h2>
            <p class="page-section__lead">
              Institución académica y patrocinador del desarrollo del portal.
            </p>
          </div>
        </div>

        <div class="split-grid">
          <div class="affiliation">
            <img src="/images/logo_ia_withe.webp" alt="iagentek" class="h-12 w-auto shrink-0" />
            <div>
              <div class="affiliation__name">iagentek</div>
              <div class="affiliation__sub">Desarrollo del portal académico</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-cell info-cell--full">
              <div class="info-cell__label">Programa</div>
              <div class="info-cell__value">Maestría en Inteligencia Artificial</div>
            </div>
            <div class="info-cell">
              <div class="info-cell__label">Universidad</div>
              <div class="info-cell__value">UNIR</div>
            </div>
            <div class="info-cell">
              <div class="info-cell__label">Materia</div>
              <div class="info-cell__value">Razonamiento y planificación</div>
            </div>
          </div>
        </div>
      </section>
    }
  `,
  host: { class: 'block max-w-5xl mx-auto' },
})
export class TeamComponent implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly loading = signal(true);
  protected readonly author = signal<TeamMember | null>(null);

  ngOnInit(): void {
    this.api.listTeamMembers().subscribe({
      next: (team) => this.author.set(team[0] ?? null),
      error: () => this.author.set(null),
      complete: () => this.loading.set(false),
    });
  }

  protected initials(name: string): string {
    const cleaned = name.replace(/\[.*?\]/g, '').trim();
    if (!cleaned) return '?';
    const parts = cleaned.split(/\s+/).filter(Boolean);
    const apellidoIdx = parts.length >= 3 ? parts.length - 2 : 1;
    return ((parts[0]?.[0] ?? '') + (parts[apellidoIdx]?.[0] ?? '')).toUpperCase();
  }
}
