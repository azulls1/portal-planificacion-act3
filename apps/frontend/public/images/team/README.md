# Fotos del equipo

Una foto por integrante para usar en la sección `/equipo` del portal.

## Naming

```
team/<slug-integrante>.{jpg,png,webp}
```

Donde `<slug-integrante>` coincide con el `slug` del integrante en `apps/backend/src/portal_act3/api/scenarios.py` y en el campo `member_slug` de Supabase.

Ejemplos:

```
team/integrante-1.jpg
team/integrante-2.jpg
team/integrante-3.jpg
```

O con nombres reales kebab-case si prefieres:

```
team/sergio-hernandez.jpg
team/maria-garcia.jpg
```

> Si usas nombres reales, actualiza el `slug` del integrante en `scenarios.py` para que coincida.

## Especificaciones

| Atributo | Valor |
|---|---|
| Formato | **WebP** (preferido — mejor compresión) · JPG · PNG |
| Tamaño | 400×400 px mínimo · cuadrada · centrada |
| Peso máximo | 100 KB por foto |
| Encuadre | Plano americano o de pecho hacia arriba, fondo neutro |
| Resolución | 2x para retina (800×800 px source, escalar a 400×400 con `class="w-24 h-24"`) |

## Uso en componente

El componente `team.component.ts` ya tiene un placeholder con iniciales. Para usar la foto real, modificar el template:

```html
<!-- en team.component.ts -->
<img
  [src]="'/images/team/' + member.slug + '.webp'"
  [alt]="member.name"
  class="w-12 h-12 rounded-full object-cover"
  onerror="this.style.display='none'"
/>
```

## Privacidad

- Solicitar consentimiento de cada integrante antes de publicar su foto.
- No commitear fotos privadas/familiares — solo imagen profesional/académica.
- En LinkedIn / perfil universitario se considera "público".
