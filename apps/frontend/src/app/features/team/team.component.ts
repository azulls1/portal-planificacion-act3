import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ApiService, TeamMember } from '../../core/api.service';

@Component({
  selector: 'app-team',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <h1 class="font-display text-3xl text-forest font-semibold">Autor</h1>
      <p class="text-sm text-pine mt-2 max-w-3xl">
        Esta actividad es trabajo individual. A continuación se identifica al
        autor responsable del modelado, ejecución y redacción.
      </p>
    </header>

    @let a = author();

    @if (loading()) {
      <div class="skeleton" style="height: 220px;"></div>
    } @else if (a) {
      <article class="card-section animate-fadeInUp max-w-2xl">
        <div class="flex items-center gap-5">
          <div
            class="w-20 h-20 rounded-full bg-fog flex items-center justify-center font-display text-forest text-3xl"
          >
            {{ initials(a.name) }}
          </div>
          <div>
            <h2 class="font-display text-2xl text-forest font-semibold">
              {{ a.name }}
            </h2>
            <p class="text-sm text-moss font-mono mt-1">{{ a.slug }}</p>
          </div>
        </div>

        <p class="text-sm text-pine mt-6">{{ a.role }}</p>

        <div class="mt-6 pt-6 border-t border-fog">
          <h3 class="font-display text-base text-forest mb-3">
            Responsabilidades
          </h3>
          <ul class="list-disc list-inside text-sm text-evergreen space-y-1">
            <li>Transcripción del problema del rover a PDDL (criterio 2)</li>
            <li>Ejecución de Delfi 1 sobre la tarea Snake del IPC2018 (criterio 1)</li>
            <li>
              Diseño de dos escenarios alternativos: problem-2 y problem-3
              (criterio 3)
            </li>
            <li>Redacción del reporte APA (criterio 4)</li>
          </ul>
        </div>
      </article>
    }
  `,
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
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  }
}
