-- ============================================================================
-- Portal Actividad 3 — alinear schema plan_runs con domain.models.PlanRun
-- ============================================================================
-- Añade columnas faltantes para que la persistencia en Supabase pueda
-- representar el modelo completo sin pérdida de información.
-- Idempotente: usa IF NOT EXISTS.
-- ============================================================================

-- Renombra actions_count → plan_actions_count para coincidir con el modelo
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'portal_act3_plan_runs'
          AND column_name  = 'actions_count'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'portal_act3_plan_runs'
          AND column_name  = 'plan_actions_count'
    ) THEN
        ALTER TABLE public.portal_act3_plan_runs
            RENAME COLUMN actions_count TO plan_actions_count;
    END IF;
END
$$;

-- Añade columnas que faltan
ALTER TABLE public.portal_act3_plan_runs
    ADD COLUMN IF NOT EXISTS domain_slug   TEXT,
    ADD COLUMN IF NOT EXISTS planner_name  TEXT,
    ADD COLUMN IF NOT EXISTS plan_sha256   TEXT,
    ADD COLUMN IF NOT EXISTS stdout        TEXT,
    ADD COLUMN IF NOT EXISTS stderr        TEXT;

-- Alinear CHECK del status con el enum PlanRunStatus (Python):
-- queued, running, completed, failed, timeout
ALTER TABLE public.portal_act3_plan_runs
    DROP CONSTRAINT IF EXISTS portal_act3_plan_runs_status_check;

ALTER TABLE public.portal_act3_plan_runs
    ADD CONSTRAINT portal_act3_plan_runs_status_check
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'timeout'));

-- Aliviamos: domain_slug puede ir vacío para runs históricos, pero ahora
-- los nuevos deben traerlo. Solo lo hacemos NOT NULL cuando ya no haya
-- filas con NULL (no rompemos al re-aplicar).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.portal_act3_plan_runs WHERE domain_slug IS NULL
    ) THEN
        BEGIN
            ALTER TABLE public.portal_act3_plan_runs
                ALTER COLUMN domain_slug SET NOT NULL;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END IF;
END
$$;
