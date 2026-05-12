# Troubleshooting

Problemas comunes y sus soluciones.

---

## Backend

### `pip install -e ".[dev]"` falla con `pyiceberg` o build wheel error

**Causa**: estás en Python 3.13+ y alguna sub-dependencia transitiva (típicamente de `supabase`) no compila.

**Solución**:

```bash
pip install -e ".[dev]"   # sin el extra [supabase]
```

`supabase-py` es opcional. El backend funciona en modo `degraded` sin él. Si necesitas Supabase, instala primero Python 3.11 con pyenv/uv y reintenta.

---

### `pytest` se queja de "Connection to Redis lost"

**Causa**: alguno de los tests intenta consultar a Celery/Redis y Redis no está corriendo.

**Solución**:

- Arranca Redis: `docker run -d -p 6379:6379 redis:7.2-alpine`
- O ignora el test específico (el lifecycle test ya está protegido para no fallar).

---

### `uvicorn` levanta pero el frontend recibe 404 en `/api`

**Causa**: el proxy del dev-server no apunta al backend.

**Solución**:

- Verifica `apps/frontend/proxy.conf.json` tiene `target: http://localhost:8000`.
- En `angular.json` la sección `serve.options` debe tener `proxyConfig: "proxy.conf.json"`.
- Reinicia `npm start` después de cambios al proxy.

---

### Celery worker reporta `KeyError` en una tarea

**Causa**: el worker se inició antes que el código de la tarea estuviese actualizado.

**Solución**:

```bash
# Reinicia el worker
Ctrl+C
celery -A portal_act3.tasks.celery_app.celery_app worker --loglevel=info -P solo
```

`--max-tasks-per-child=1` durante debug ayuda a forzar reload.

---

## Frontend

### `npm start` da error "Module not found: forest.css"

**Causa**: la carpeta `src/forest/` está vacía o no se copiaron los CSS del DS.

**Solución**:

```bash
cp -r ../../desing-system/css/*.css apps/frontend/src/forest/
```

---

### Tailwind v4 no aplica clases `text-forest`, `bg-pine`, etc.

**Causa**: el `@import "./forest/forest.css"` debe ir **después** de `@import "tailwindcss"` para que los `@theme` overrides apliquen.

**Solución**: revisa `src/styles.css`. Orden correcto:

```css
@import "tailwindcss";
@import "./forest/forest.css";
```

---

### Build de producción falla por presupuestos (`anyComponentStyle`)

**Causa**: algún componente tiene `styles: [...]` con muchas líneas.

**Solución**: muévelas a CSS externo o reduce. Los presupuestos están en `angular.json`. Como alternativa temporal, sube los umbrales pero documenta por qué.

---

## Singularity

### `singularity --version` no encuentra el binario en WSL

**Causa**: Singularity instalado en sesión anterior pero `PATH` no exportado.

**Solución**:

```bash
export PATH=$PATH:/usr/local/go/bin:/usr/local/bin
echo 'export PATH=$PATH:/usr/local/go/bin:/usr/local/bin' >> ~/.bashrc
```

---

### `singularity exec` falla con `FATAL: while extracting`

**Causa**: la imagen `.sif` está corrupta o incompleta.

**Solución**:

```bash
ls -lh infra/singularity/planner.sif   # ¿tamaño razonable? (>50 MB)
rm infra/singularity/planner.sif
./infra/singularity/pull-planner.sh    # re-descargar
```

---

### El planner cicla / excede memoria en Snake

**Causa**: los problemas del IPC2018 son grandes; el planner óptimo puede no terminar.

**Solución**: aceptable por la rúbrica del profesor.

- Documentar el ciclado con capturas → nivel 3 del criterio 1 (2 pts).
- Aumentar `PLAN_TIMEOUT_SECONDS` en `.env` (default: 1800).
- Como alternativa: usar el editor en línea https://editor.planning.domains/ con un planner satisficing para evidencia parcial → nivel 2.

---

### Singularity no se puede correr dentro de un contenedor Docker

**Causa**: Singularity y Docker compiten por capabilities del kernel.

**Solución**: ejecutar Singularity en el **host** (Linux nativo o WSL2), no dentro del `worker` de Docker Compose. El `singularity_runner.py` está pensado para invocarse desde un worker que corre en el host directamente.

---

## PDDL

### El parser rechaza el dominio con "paréntesis desbalanceados"

**Causa**: olvidaste cerrar un `(`.

**Solución**: usa un editor con matching de paréntesis (VS Code, Emacs). El error reporta el primer paréntesis sin pareja.

---

### El planner devuelve plan vacío o "no plan found"

**Causa**: el goal no es alcanzable desde el estado inicial.

**Solución**: simula manualmente con el endpoint:

```bash
curl -X POST http://localhost:8000/api/plan-runs/problem-1/simulate
```

Si el plan persistido funciona y el del planner no, revisa que (a) los nombres de objetos coincidan exactamente (mayúsculas), (b) las aristas dirigidas estén bien declaradas, (c) el goal no exija algo imposible.

---

### El plan generado no se entiende / orden raro

**Causa**: planners óptimos pueden retornar planes equivalentes en costo pero distintos en orden por simetrías.

**Solución**: comparar costo total, no la secuencia exacta. Para problem-1 el costo óptimo es 14 (no importa si M1 va antes o después de M2).

---

## Reporte APA

### El PDF excede 12 páginas

**Causa**: incluiste todo el código PDDL en el PDF.

**Solución**: mueve apéndices al portal.

- Bloques PDDL completos → ya están en `/rover/domain` y `/rover/problem` del portal.
- Capturas adicionales → ya están en `/snake/ejecución` del portal.
- En el PDF, cita solo los fragmentos clave y enlaza al portal.

---

### Word desordena la sangría francesa en referencias

**Causa**: Word a veces "corrige" el formato APA.

**Solución**: aplicar sangría francesa manualmente:

1. Selecciona el bloque de referencias.
2. Inicio → Párrafo → Especial → Sangría francesa → 1.27 cm.
3. Verificar después de guardar como PDF.

---

## Git / Docker

### `docker compose up` falla con "port 6379 already in use"

**Causa**: tienes Redis local corriendo además del de Docker.

**Solución**:

```bash
# Opción A: detener el Redis local
sudo systemctl stop redis           # Linux
brew services stop redis            # macOS

# Opción B: cambiar el puerto en docker-compose.yml
# redis:
#   ports:
#     - "6380:6379"
# y actualizar REDIS_URL en .env: redis://localhost:6380/0
```

---

### `git push` rechaza por hooks que tardan demasiado

**Causa**: el pre-commit corre ruff + prettier + tests.

**Solución**: ejecuta los checks por separado primero:

```bash
pre-commit run --all-files
```

Solo si todos pasan, intenta el commit.
