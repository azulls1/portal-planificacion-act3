# Singularity + Delfi 1 — guía verificada contra IPC2018

> **Datos verificados directamente del sitio oficial del profesor**: https://ipc2018-classical.bitbucket.io/
> Última verificación: 2026-05-11

## Identificación del planner ganador

| # | Planner | Autores |
|---|---|---|
| 🥇 **1er lugar** | **Delfi 1** | Michael Katz, Shirin Sohrabi, Horst Samulowitz, Silvan Sievers |
| 🥈 2do lugar | Complementary | Santiago Franco, Levi H. S. Lelis, Mike W. Barley, Stefan Edelkamp, Moisés Martínez, Ionut Moraru |

**Fuente del código de Delfi 1**:
- Repo: https://bitbucket.org/ipc2018-classical/team23/src/ipc-2018-seq-opt/
- Receta Singularity (raw): https://bitbucket.org/ipc2018-classical/team23/raw/ipc-2018-seq-opt/Singularity

## Pre-requisitos

1. Linux nativo, VM Ubuntu, o WSL2.
2. **Singularity** ≥ 3.5 (el profesor referencia la guía de Sylabs v3.5).
3. Privilegios sudo para `singularity build` (compila Fast Downward + heurísticas).
4. ~30 minutos de tiempo de build (Delfi 1 incluye varios planners base que se compilan desde fuente).

## Instalación de Singularity

Siguiendo https://docs.sylabs.io/guides/3.5/admin-guide/installation.html:

```bash
# Dependencias del sistema
sudo apt-get update
sudo apt-get install -y build-essential libseccomp-dev pkg-config \
    squashfs-tools cryptsetup curl wget git

# Go ≥ 1.13 (Singularity 3.5 lo requiere)
export GOVERSION=1.21.5
wget https://go.dev/dl/go${GOVERSION}.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go${GOVERSION}.linux-amd64.tar.gz
export PATH=/usr/local/go/bin:$PATH

# Singularity
git clone --recurse-submodules https://github.com/sylabs/singularity.git
cd singularity
git checkout v3.11.5    # versión estable más reciente compatible con la receta de Delfi
./mconfig
make -C builddir
sudo make -C builddir install
singularity --version
```

## Construir la imagen de Delfi 1

```bash
cd infra/singularity
./pull-planner.sh
```

El script:
1. Descarga `Singularity` (receta) del repo team23.
2. Ejecuta `sudo singularity build planner.img Singularity`.
3. Reporta dónde quedó la imagen.

Duración estimada: **10-30 minutos** (compila Fast Downward + componentes adicionales).

## Ejecutar Delfi 1 sobre Snake problema 1

**Script EXACTO de la sección "DETAILS ON SINGULARITY → How can I test my containers?"** del sitio del profesor:

```bash
# 1. Preparar rundir con domain + problem
mkdir rundir
cp ../../entregables/pddl/snake-ipc2018/domain.pddl rundir/
cp ../../entregables/pddl/snake-ipc2018/p01.pddl rundir/problem.pddl

# 2. Variables (siguiendo el patrón del profesor)
RUNDIR="$(pwd)/rundir"
DOMAIN="$RUNDIR/domain.pddl"
PROBLEM="$RUNDIR/problem.pddl"
PLANFILE="$RUNDIR/sas_plan"

# 3. Límites del IPC2018 oficial: 30 min CPU, 8 GB RAM
ulimit -t 1800
ulimit -v 8388608

# 4. Ejecutar
singularity run -C -H $RUNDIR planner.img $DOMAIN $PROBLEM $PLANFILE
```

> **Observaciones del script oficial**:
> - Comando es `singularity run`, **NO** `singularity exec`.
> - Imagen es `.img`, **NO** `.sif` (formato anterior, aún compatible con Singularity 3.5+).
> - Flags `-C` (contain) y `-H` (home) aíslan el proceso y fijan el directorio de trabajo.
> - El plan se escribe en `$PLANFILE` (típicamente `sas_plan`, `sas_plan.1`, etc. para planes anytime).

## Ejecutar sobre el problema del rover (criterio 2)

Mismo procedimiento, cambiando los archivos:

```bash
mkdir rundir-rover
cp ../../entregables/pddl/domain.pddl rundir-rover/
cp ../../entregables/pddl/problem-1.pddl rundir-rover/problem.pddl

RUNDIR="$(pwd)/rundir-rover"
DOMAIN="$RUNDIR/domain.pddl"
PROBLEM="$RUNDIR/problem.pddl"
PLANFILE="$RUNDIR/sas_plan"
ulimit -t 1800
ulimit -v 8388608
singularity run -C -H $RUNDIR planner.img $DOMAIN $PROBLEM $PLANFILE
```

Repetir para `problem-2.pddl` y `problem-3.pddl` (escenarios por integrante, criterio 3).

## Archivos PDDL de Snake (descargados del sitio del profesor)

Bajados de `https://bitbucket.org/ipc2018-classical/domains/raw/master/opt/snake/`:

| Archivo local | Tamaño | URL fuente |
|---|---|---|
| `entregables/pddl/snake-ipc2018/domain.pddl` | 2,276 B | `.../opt/snake/domain.pddl` |
| `entregables/pddl/snake-ipc2018/p01.pddl` | 3,711 B | `.../opt/snake/p01.pddl` |

Problemas adicionales disponibles del mismo path: `p02.pddl` hasta `p09.pddl`.

## Modos de fallo aceptables (rúbrica criterio 1)

| Nivel | Pts | Condición | Cómo nos vemos |
|---|---|---|---|
| 1 | 0 | Ni Singularity ni alternativa | (descartado) |
| 2 | 1 | Singularity falla → editor online | Usar https://editor.planning.domains/ con un planner satisficing y documentar |
| **3** | **2** | **Singularity instalado, ejecución cicla por recursos, capturas presentes** | **Plan B si nuestro PC no aguanta** |
| **4** | **3** | **Plan generado + captura del archivo del plan** | **Objetivo principal** |

## Variables `.env` del backend

Una vez construida la imagen:

```bash
# .env de portal-planificacion-act3/
SINGULARITY_IMAGE_PATH=/ruta/absoluta/a/portal-planificacion-act3/infra/singularity/planner.img
SINGULARITY_PLANNER_NAME=delfi-1
PLAN_TIMEOUT_SECONDS=1800
```

El backend (`apps/backend/src/portal_act3/adapters/singularity_runner.py`) usa estas variables para invocar el binario con el comando exacto del IPC2018.

## Plan B si Singularity nativo no es viable

| Opción | Cuándo usar | Esfuerzo |
|---|---|---|
| WSL2 Ubuntu | Tienes Windows + 8 GB RAM libre | 1-2 horas setup |
| VM Ubuntu | WSL falla por kernel | 30 min |
| **editor.planning.domains** (online) | Singularity simplemente no es viable | 5 min — pero pierde puntos del criterio 1 |
