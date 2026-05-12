import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Grafo SVG estático de la topología L1-L5 del problema del rover.
 * Aristas dirigidas en `forest`, bidireccionales en `evergreen` con doble punta.
 *
 * Sin hex literals: usa utilities Tailwind del Forest DS para fill/stroke.
 * Cumple Artículo 6.1 de la constitución del proyecto.
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
        <!-- L1 <-> L3 (bidir) -->
        <line
          x1="120"
          y1="80"
          x2="290"
          y2="80"
          class="stroke-evergreen"
          stroke-width="2"
          marker-start="url(#arrow-bidir)"
          marker-end="url(#arrow-bidir)"
        />
        <!-- L3 -> L2 (unidir) -->
        <line
          x1="310"
          y1="80"
          x2="480"
          y2="80"
          class="stroke-forest"
          stroke-width="2.5"
          marker-end="url(#arrow-dir)"
        />
        <!-- L3 <-> L4 (bidir) -->
        <line
          x1="300"
          y1="100"
          x2="300"
          y2="220"
          class="stroke-evergreen"
          stroke-width="2"
          marker-start="url(#arrow-bidir)"
          marker-end="url(#arrow-bidir)"
        />
        <!-- L2 -> L4 (unidir) -->
        <line
          x1="480"
          y1="100"
          x2="320"
          y2="230"
          class="stroke-forest"
          stroke-width="2.5"
          marker-end="url(#arrow-dir)"
        />
        <!-- L4 <-> L5 (bidir) -->
        <line
          x1="300"
          y1="260"
          x2="300"
          y2="380"
          class="stroke-evergreen"
          stroke-width="2"
          marker-start="url(#arrow-bidir)"
          marker-end="url(#arrow-bidir)"
        />

        <!-- Nodes: L1 (origen M1) -->
        <g>
          <circle cx="100" cy="80" r="34" class="fill-white stroke-pine" stroke-width="2" />
          <text x="100" y="78" text-anchor="middle" class="fill-forest font-display" font-weight="600" font-size="16">L1</text>
          <text x="100" y="96" text-anchor="middle" class="fill-pine font-body" font-size="9">M1</text>
        </g>
        <!-- L3 (nodo de paso) -->
        <g>
          <circle cx="300" cy="80" r="34" class="fill-white stroke-pine" stroke-width="2" />
          <text x="300" y="85" text-anchor="middle" class="fill-forest font-display" font-weight="600" font-size="16">L3</text>
        </g>
        <!-- L2 (origen M2) -->
        <g>
          <circle cx="500" cy="80" r="34" class="fill-white stroke-pine" stroke-width="2" />
          <text x="500" y="78" text-anchor="middle" class="fill-forest font-display" font-weight="600" font-size="16">L2</text>
          <text x="500" y="96" text-anchor="middle" class="fill-pine font-body" font-size="9">M2</text>
        </g>
        <!-- L4 (posición inicial del rover) -->
        <g>
          <rect x="262" y="222" width="76" height="42" rx="8" class="fill-forest stroke-forest" />
          <text x="300" y="240" text-anchor="middle" class="fill-white font-display" font-weight="600" font-size="14">L4</text>
          <text x="300" y="256" text-anchor="middle" class="fill-fog font-body" font-size="9">rover R1</text>
        </g>
        <!-- L5 (laboratorio) -->
        <g>
          <rect x="262" y="380" width="76" height="42" rx="8" class="fill-fog stroke-pine" />
          <text x="300" y="398" text-anchor="middle" class="fill-forest font-display" font-weight="600" font-size="14">L5</text>
          <text x="300" y="414" text-anchor="middle" class="fill-evergreen font-body" font-size="9">laboratorio</text>
        </g>
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
})
export class RoverGraphComponent {}
