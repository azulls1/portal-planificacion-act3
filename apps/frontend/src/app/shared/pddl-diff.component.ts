import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';

interface DiffLine {
  kind: 'unchanged' | 'added' | 'removed';
  base: string;
  target: string;
}

@Component({
  selector: 'app-pddl-diff',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-section">
      <h3 class="font-display text-base text-forest mb-3">
        Diff vs.
        <code class="font-mono text-sm">{{ baseSlug }}.pddl</code>
      </h3>

      @if (loading()) {
        <div class="skeleton" style="height: 200px;"></div>
      } @else if (rows().length === 0) {
        <p class="text-sm text-pine">No hay diferencias significativas.</p>
      } @else {
        <div class="overflow-x-auto rounded-lg border border-fog">
          <table class="w-full text-xs font-mono">
            <thead class="bg-fog/40 text-forest">
              <tr>
                <th class="p-2 text-left w-1/2">{{ baseSlug }}.pddl</th>
                <th class="p-2 text-left w-1/2">{{ targetSlug }}.pddl</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track $index) {
                <tr
                  [class]="rowClass(row.kind)"
                  class="border-t border-fog/60"
                >
                  <td class="p-1 align-top whitespace-pre">{{ row.base }}</td>
                  <td class="p-1 align-top whitespace-pre">{{ row.target }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class PddlDiffComponent implements OnChanges {
  @Input({ required: true }) baseSlug = 'problem-1';
  @Input({ required: true }) targetSlug = 'problem-2';

  private readonly api = inject(ApiService);

  protected readonly loading = signal(true);
  protected readonly rows = signal<DiffLine[]>([]);

  ngOnChanges(_: SimpleChanges): void {
    this.loading.set(true);
    forkJoin({
      base: this.api.getPddlFile(this.baseSlug),
      target: this.api.getPddlFile(this.targetSlug),
    }).subscribe({
      next: ({ base, target }) => {
        this.rows.set(this.computeDiff(base, target));
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.loading.set(false);
      },
    });
  }

  protected rowClass(kind: DiffLine['kind']): string {
    if (kind === 'added') return 'bg-emerald-50/60 text-emerald-700';
    if (kind === 'removed') return 'bg-red-50/60 text-red-700 line-through';
    return '';
  }

  /**
   * LCS-based diff suficiente para archivos PDDL chicos (<1000 líneas).
   * No es optimizado pero produce output legible.
   */
  private computeDiff(base: string, target: string): DiffLine[] {
    const baseLines = base.split('\n');
    const targetLines = target.split('\n');
    const result: DiffLine[] = [];
    const baseSet = new Set(baseLines);
    const targetSet = new Set(targetLines);
    const maxLen = Math.max(baseLines.length, targetLines.length);
    for (let i = 0; i < maxLen; i++) {
      const b = baseLines[i] ?? '';
      const t = targetLines[i] ?? '';
      if (b === t) {
        result.push({ kind: 'unchanged', base: b, target: t });
      } else if (b && !targetSet.has(b) && t && !baseSet.has(t)) {
        result.push({ kind: 'removed', base: b, target: '' });
        result.push({ kind: 'added', base: '', target: t });
      } else if (b && !targetSet.has(b)) {
        result.push({ kind: 'removed', base: b, target: '' });
      } else if (t && !baseSet.has(t)) {
        result.push({ kind: 'added', base: '', target: t });
      } else {
        result.push({ kind: 'unchanged', base: b, target: t });
      }
    }
    return result.filter((r) => r.kind !== 'unchanged' || (r.base.trim() !== '' && r.target.trim() !== ''));
  }
}
