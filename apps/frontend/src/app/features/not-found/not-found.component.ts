import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="text-center py-16 animate-fadeIn">
      <span class="tag mb-4 inline-block">Error 404</span>
      <h1 class="font-display text-5xl text-forest font-semibold mb-4">
        Esta ruta no existe en el grafo
      </h1>
      <p class="text-pine max-w-xl mx-auto">
        El rover intentó moverse a una localidad sin arista declarada. Verifica
        la URL o regresa a la página principal.
      </p>
      <div class="mt-8">
        <a routerLink="/" class="btn btn-cta">Volver al inicio</a>
      </div>
    </section>
  `,
})
export class NotFoundComponent {}
