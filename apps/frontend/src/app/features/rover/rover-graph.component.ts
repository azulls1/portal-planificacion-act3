import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

interface PlanAction {
  op: 'move' | 'pickup' | 'deliver';
  args: string[];
  raw: string;
}

interface RoverState {
  at: string;            // L1..L5
  carrying: string | null; // M1, M2 o null
  remaining: Set<string>;  // minerales aún en su origen
  delivered: Set<string>;  // minerales ya analizados
}

const COORD: Record<string, { x: number; y: number }> = {
  L1: { x: 100, y: 80 },
  L2: { x: 500, y: 80 },
  L3: { x: 300, y: 80 },
  L4: { x: 300, y: 243 },
  L5: { x: 300, y: 401 },
};

/**
 * Grafo SVG animado de la topología del rover. Acepta opcionalmente
 * un plan + step actual y mueve un token del rover por las localidades,
 * cambiando el estado de los minerales (origen → carrying → delivered).
 */
@Component({
  selector: 'app-rover-graph',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glass-subtle p-6 rounded-2xl">
      <svg
        viewBox="0 0 600 460"
        class="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Topología de localidades L1 a L5"
      >
        <defs>
          <marker
            id="arrow-bidir"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" class="fill-evergreen" />
          </marker>
          <marker
            id="arrow-dir"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" class="fill-forest" />
          </marker>
        </defs>

        <!-- Edges -->
        <line x1="120" y1="80" x2="290" y2="80" class="stroke-evergreen" stroke-width="2" marker-start="url(#arrow-bidir)" marker-end="url(#arrow-bidir)" />
        <line x1="310" y1="80" x2="480" y2="80" class="stroke-forest" stroke-width="2.5" marker-end="url(#arrow-dir)" />
        <line x1="300" y1="100" x2="300" y2="220" class="stroke-evergreen" stroke-width="2" marker-start="url(#arrow-bidir)" marker-end="url(#arrow-bidir)" />
        <line x1="480" y1="100" x2="320" y2="230" class="stroke-forest" stroke-width="2.5" marker-end="url(#arrow-dir)" />
        <line x1="300" y1="260" x2="300" y2="380" class="stroke-evergreen" stroke-width="2" marker-start="url(#arrow-bidir)" marker-end="url(#arrow-bidir)" />

        <!-- Localidades fijas -->
        <g>
          <circle cx="100" cy="80" r="34" class="fill-white stroke-pine" stroke-width="2" />
          <text x="100" y="78" text-anchor="middle" class="fill-forest font-display" font-weight="600" font-size="16">L1</text>
          @if (mineralAt('M1') === 'L1') {
            <text x="100" y="96" text-anchor="middle" class="fill-pine font-body" font-size="9">M1</text>
          }
        </g>
        <g>
          <circle cx="300" cy="80" r="34" class="fill-white stroke-pine" stroke-width="2" />
          <text x="300" y="85" text-anchor="middle" class="fill-forest font-display" font-weight="600" font-size="16">L3</text>
        </g>
        <g>
          <circle cx="500" cy="80" r="34" class="fill-white stroke-pine" stroke-width="2" />
          <text x="500" y="78" text-anchor="middle" class="fill-forest font-display" font-weight="600" font-size="16">L2</text>
          @if (mineralAt('M2') === 'L2') {
            <text x="500" y="96" text-anchor="middle" class="fill-pine font-body" font-size="9">M2</text>
          }
        </g>
        <g>
          <rect x="262" y="222" width="76" height="42" rx="8" class="fill-forest stroke-forest" />
          <text x="300" y="240" text-anchor="middle" class="fill-white font-display" font-weight="600" font-size="14">L4</text>
          <text x="300" y="256" text-anchor="middle" class="fill-fog font-body" font-size="9">inicio</text>
        </g>
        <g>
          <rect x="262" y="380" width="76" height="42" rx="8" class="fill-fog stroke-pine" />
          <text x="300" y="398" text-anchor="middle" class="fill-forest font-display" font-weight="600" font-size="14">L5</text>
          <text x="300" y="414" text-anchor="middle" class="fill-evergreen font-body" font-size="9">laboratorio</text>
        </g>

        <!-- Token del rover (se mueve con CSS transition) -->
        @let pos = roverPos();
        <g
          [attr.transform]="'translate(' + pos.x + ',' + pos.y + ')'"
          class="rover-token-pos"
        >
          <circle r="18" class="fill-fern stroke-white" stroke-width="3" opacity="0.95" />
          <text text-anchor="middle" dy="4" class="fill-white font-display" font-weight="700" font-size="11">R1</text>
          @if (carrying(); as m) {
            <circle cx="14" cy="-14" r="7" class="fill-white stroke-fern" stroke-width="2" />
            <text x="14" y="-11" text-anchor="middle" class="fill-fern font-mono" font-size="7" font-weight="700">{{ m }}</text>
          }
        </g>

        <!-- Minerales entregados (mostrar pequeño marker sobre L5) -->
        @if (delivered().has('M1') || delivered().has('M2')) {
          <g transform="translate(355,401)">
            @if (delivered().has('M1')) {
              <circle cx="0" cy="0" r="6" class="fill-fern" />
              <text x="0" y="3" text-anchor="middle" class="fill-white font-mono" font-size="7" font-weight="700">1</text>
            }
            @if (delivered().has('M2')) {
              <circle [attr.cx]="delivered().has('M1') ? 18 : 0" cy="0" r="6" class="fill-fern" />
              <text [attr.x]="delivered().has('M1') ? 18 : 0" y="3" text-anchor="middle" class="fill-white font-mono" font-size="7" font-weight="700">2</text>
            }
          </g>
        }
      </svg>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="inline-block w-4 h-0.5 bg-evergreen"></span>
          <span class="text-pine">Arista bidireccional</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-block w-4 h-0.5 bg-forest"></span>
          <span class="text-pine">Arista unidireccional (con flecha)</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rover-token-pos {
      transition: transform 700ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  `],
})
export class RoverGraphComponent {
  /** Pasos del plan que se han ejecutado (0 = inicial). */
  readonly step = input<number>(0);
  /** Acciones del plan (sin parsear). Cuando se omite, el grafo está estático. */
  readonly plan = input<string[]>([]);

  private readonly initial: RoverState = {
    at: 'L4',
    carrying: null,
    remaining: new Set(['M1', 'M2']),
    delivered: new Set(),
  };

  private readonly state = computed<RoverState>(() => {
    const actions = this.parsedPlan();
    const s: RoverState = {
      at: this.initial.at,
      carrying: this.initial.carrying,
      remaining: new Set(this.initial.remaining),
      delivered: new Set(this.initial.delivered),
    };
    const upto = Math.max(0, Math.min(this.step(), actions.length));
    for (let i = 0; i < upto; i++) {
      const a = actions[i];
      if (a.op === 'move') {
        s.at = a.args[2].toUpperCase();
      } else if (a.op === 'pickup') {
        const m = a.args[1].toUpperCase();
        s.carrying = m;
        s.remaining.delete(m);
      } else if (a.op === 'deliver') {
        const m = a.args[1].toUpperCase();
        s.carrying = null;
        s.delivered.add(m);
      }
    }
    return s;
  });

  private readonly parsedPlan = computed<PlanAction[]>(() => {
    return this.plan()
      .map((raw) => raw.trim())
      .filter((raw) => raw.startsWith('('))
      .map((raw) => {
        const inner = raw.replace(/^\(/, '').replace(/\)$/, '').trim();
        const parts = inner.split(/\s+/);
        const [op, ...args] = parts;
        const opKey = op.toLowerCase();
        const norm: PlanAction['op'] =
          opKey === 'move' || opKey === 'pickup' || opKey === 'deliver'
            ? opKey
            : 'move';
        return { op: norm, args, raw };
      });
  });

  protected mineralAt(m: 'M1' | 'M2'): string | null {
    const s = this.state();
    if (s.delivered.has(m)) return 'L5';
    if (s.carrying === m) return null;
    if (s.remaining.has(m)) {
      return m === 'M1' ? 'L1' : 'L2';
    }
    return null;
  }

  protected carrying = computed(() => this.state().carrying);
  protected delivered = computed(() => this.state().delivered);
  protected roverPos = computed(() => COORD[this.state().at] ?? COORD['L4']);
}
