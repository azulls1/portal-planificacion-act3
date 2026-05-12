# tools/ — scripts auxiliares del proyecto

Scripts independientes para tareas de verificación, ejecución y validación. No son parte del runtime del portal — son herramientas del autor.

## Catálogo

| Script | Propósito | Cuándo usarlo |
|---|---|---|
| `check_setup.sh` | Valida que el VPS/máquina tiene todo lo necesario para Singularity + Delfi 1 | Antes de empezar a trabajar en el VPS |
| `pull-planner.sh` | (en `infra/singularity/`) Descarga la receta de Delfi 1 y construye la imagen | Una sola vez tras `check_setup.sh` |
| `run_all_planners.sh` | Ejecuta Delfi 1 sobre los 4 problemas (Snake p01 + 3 rover) | Tras tener `planner.img` listo |
| `compare_plans.py` | Compara plan de Delfi vs plan de referencia (mismo costo, equivalencia) | Tras ejecutar el planner real |

## Workflow recomendado

```bash
# En tu VPS, primera vez:
cd portal-planificacion-act3
bash tools/check_setup.sh           # diagnóstico (1 min)

# Si hay errores: instala lo que falta. Si todo OK:
cd infra/singularity
./pull-planner.sh                   # descarga + build (15-30 min)
cd ../..

# Ejecutar todo (60-90 min en total, según hardware):
bash tools/run_all_planners.sh

# Validar resultados (segundos):
python tools/compare_plans.py problem-1 entregables/planes/rover-problem-1-plan.txt
python tools/compare_plans.py problem-2 entregables/planes/rover-problem-2-plan.txt
python tools/compare_plans.py problem-3 entregables/planes/rover-problem-3-plan.txt

# Tomar capturas mientras todo corre y guardarlas en:
#   entregables/capturas/c1-snake-execution-terminal.png
#   entregables/capturas/c1-snake-plan-file.png
#   entregables/capturas/c2-rover-execution-terminal.png
#   entregables/capturas/c2-rover-plan-file.png
#   entregables/capturas/c3-problem-2-execution.png
#   entregables/capturas/c3-problem-3-execution.png
```

## Notas

- `check_setup.sh` y `run_all_planners.sh` son scripts bash POSIX-friendly, deben correrse en Linux (VPS o WSL2).
- `compare_plans.py` corre en cualquier máquina con Python 3.11 que tenga el backend instalado.
- Todos los scripts usan rutas absolutas calculadas dinámicamente — pueden correrse desde cualquier directorio.
