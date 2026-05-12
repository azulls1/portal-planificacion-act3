# Supabase — configuración del backend de datos

El portal funciona **sin Supabase** en modo `degraded` (lectura/escritura no persistente). Para experiencia completa, crear un proyecto Supabase free tier.

## Setup rápido

1. Crear proyecto en https://supabase.com (free tier).
2. Project Settings → API → copiar `URL`, `anon key`, `service_role key`.
3. En `.env` raíz del repo:
   ```
   SUPABASE_URL=https://<proyecto>.supabase.co
   SUPABASE_ANON_KEY=<anon_key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
   ```
4. SQL Editor → ejecutar el contenido de `migrations/0001_initial.sql`.
5. Storage → crear buckets:
   - `pddl-files`
   - `plans`
   - `screenshots`
   - `report`
6. Auth → habilitar provider Email/Password e invitar a los integrantes.

## Tablas

| Tabla | Propósito |
|---|---|
| `team_members` | Lista de integrantes del equipo (slug, name, role). |
| `scenarios` | Escenarios alternativos por integrante. |
| `plan_runs` | Ejecuciones del planner con resultado y hash. |
| `references` | Referencias APA del reporte. |

RLS habilitado: lectura pública (para que el profesor evalúe), escritura solo autenticada.

## Migraciones futuras

Crear archivos `migrations/NNNN_descripcion.sql` numerados. Aplicar manualmente
en el SQL Editor o usar el CLI:

```bash
supabase db push
```
