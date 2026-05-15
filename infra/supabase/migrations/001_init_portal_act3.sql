-- ============================================================================
-- Portal Actividad 3 — schema inicial sobre Supabase (instancia maestria)
-- ============================================================================
-- Convención de naming: prefix `portal_act3_*` en todas las tablas para
-- evitar colisiones con otros proyectos que comparten el schema `public`.
-- Idempotente: usa IF NOT EXISTS / CREATE OR REPLACE para que se pueda
-- re-aplicar sin romper.
-- ============================================================================

-- Extensión para uuid generation (Supabase la trae habilitada por defecto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Helper: trigger genérico para auto-actualizar updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_act3_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. team_members — datos del autor / equipo
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_act3_team_members (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         TEXT NOT NULL UNIQUE,
    full_name    TEXT NOT NULL,
    role         TEXT,
    bio          TEXT,
    avatar_url   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_team_members_touch ON public.portal_act3_team_members;
CREATE TRIGGER trg_team_members_touch
    BEFORE UPDATE ON public.portal_act3_team_members
    FOR EACH ROW EXECUTE FUNCTION public.portal_act3_touch_updated_at();

-- ----------------------------------------------------------------------------
-- 3. scenarios — escenarios del rover (problem-2, problem-3, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_act3_scenarios (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_slug         TEXT NOT NULL,
    member_name         TEXT NOT NULL,
    problem_slug        TEXT NOT NULL UNIQUE,
    title               TEXT NOT NULL,
    description         TEXT NOT NULL,
    differs_from_base   JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_base             BOOLEAN NOT NULL DEFAULT FALSE,
    display_order       INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_act3_scenarios_member_slug
    ON public.portal_act3_scenarios (member_slug);

DROP TRIGGER IF EXISTS trg_scenarios_touch ON public.portal_act3_scenarios;
CREATE TRIGGER trg_scenarios_touch
    BEFORE UPDATE ON public.portal_act3_scenarios
    FOR EACH ROW EXECUTE FUNCTION public.portal_act3_touch_updated_at();

-- ----------------------------------------------------------------------------
-- 4. pddl_files — metadata de archivos PDDL (el contenido vive en disco
--    dentro de la imagen del backend; aquí solo guardamos índice + hash)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_act3_pddl_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    kind            TEXT NOT NULL CHECK (kind IN ('domain', 'problem', 'snake_domain', 'snake_problem')),
    name            TEXT NOT NULL,
    relative_path   TEXT NOT NULL,
    size_bytes      INTEGER NOT NULL,
    content_sha256  TEXT,
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_act3_pddl_files_kind
    ON public.portal_act3_pddl_files (kind);

-- ----------------------------------------------------------------------------
-- 5. plans — metadata de planes generados (output del planner)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_act3_plans (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug               TEXT NOT NULL UNIQUE,
    problem_slug       TEXT NOT NULL,
    name               TEXT NOT NULL,
    relative_path      TEXT NOT NULL,
    actions_count      INTEGER,
    plan_cost          NUMERIC(10, 2),
    planner_used       TEXT NOT NULL DEFAULT 'Delfi 1 (IPC2018 winner)',
    generated_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_act3_plans_problem_slug
    ON public.portal_act3_plans (problem_slug);

-- ----------------------------------------------------------------------------
-- 6. plan_runs — ejecuciones encoladas desde el portal (mutable)
--    Esta tabla SOBREVIVE reinicios del backend → la razón principal de mover
--    de JSON local a Supabase.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_act3_plan_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id              UUID NOT NULL UNIQUE,
    problem_slug        TEXT NOT NULL,
    status              TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'degraded')),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at          TIMESTAMPTZ,
    finished_at         TIMESTAMPTZ,
    plan_text           TEXT,
    actions_count       INTEGER,
    plan_cost           NUMERIC(10, 2),
    error_message       TEXT,
    requester_ip        INET,
    user_agent          TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_act3_plan_runs_problem_slug
    ON public.portal_act3_plan_runs (problem_slug);
CREATE INDEX IF NOT EXISTS idx_portal_act3_plan_runs_status
    ON public.portal_act3_plan_runs (status);
CREATE INDEX IF NOT EXISTS idx_portal_act3_plan_runs_submitted_at
    ON public.portal_act3_plan_runs (submitted_at DESC);

DROP TRIGGER IF EXISTS trg_plan_runs_touch ON public.portal_act3_plan_runs;
CREATE TRIGGER trg_plan_runs_touch
    BEFORE UPDATE ON public.portal_act3_plan_runs
    FOR EACH ROW EXECUTE FUNCTION public.portal_act3_touch_updated_at();

-- ----------------------------------------------------------------------------
-- 7. captures — metadata de capturas / evidencias (rúbrica)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_act3_captures (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL UNIQUE,
    criterion       TEXT NOT NULL CHECK (criterion IN ('C1', 'C2', 'C3')),
    relative_path   TEXT NOT NULL,
    description     TEXT,
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_act3_captures_criterion
    ON public.portal_act3_captures (criterion);

-- ----------------------------------------------------------------------------
-- 8. audit_log — eventos para observabilidad (visitas, requests, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_act3_audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      TEXT NOT NULL,
    payload         JSONB NOT NULL DEFAULT '{}'::jsonb,
    requester_ip    INET,
    user_agent      TEXT,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_act3_audit_log_event_type
    ON public.portal_act3_audit_log (event_type);
CREATE INDEX IF NOT EXISTS idx_portal_act3_audit_log_occurred_at
    ON public.portal_act3_audit_log (occurred_at DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
-- Política:
-- - team_members, scenarios, pddl_files, plans, captures: lectura PÚBLICA (anon)
-- - plan_runs, audit_log: sin acceso anon — solo service_role (vía backend)
-- ============================================================================

ALTER TABLE public.portal_act3_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_act3_scenarios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_act3_pddl_files   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_act3_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_act3_captures     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_act3_plan_runs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_act3_audit_log    ENABLE ROW LEVEL SECURITY;

-- Lectura pública en catálogos
DROP POLICY IF EXISTS portal_act3_public_read_team_members ON public.portal_act3_team_members;
CREATE POLICY portal_act3_public_read_team_members ON public.portal_act3_team_members
    FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS portal_act3_public_read_scenarios ON public.portal_act3_scenarios;
CREATE POLICY portal_act3_public_read_scenarios ON public.portal_act3_scenarios
    FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS portal_act3_public_read_pddl_files ON public.portal_act3_pddl_files;
CREATE POLICY portal_act3_public_read_pddl_files ON public.portal_act3_pddl_files
    FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS portal_act3_public_read_plans ON public.portal_act3_plans;
CREATE POLICY portal_act3_public_read_plans ON public.portal_act3_plans
    FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS portal_act3_public_read_captures ON public.portal_act3_captures;
CREATE POLICY portal_act3_public_read_captures ON public.portal_act3_captures
    FOR SELECT TO anon, authenticated USING (TRUE);

-- plan_runs y audit_log: NO políticas para anon → quedan invisibles para ellos.
-- service_role bypasses RLS automáticamente — el backend con SERVICE_KEY tiene
-- acceso total.

-- ============================================================================
-- Comentarios para documentar
-- ============================================================================
COMMENT ON TABLE public.portal_act3_scenarios IS
    'Escenarios alternativos del problema rover (problem-2, problem-3, etc.). Catálogo de lectura pública.';
COMMENT ON TABLE public.portal_act3_plan_runs IS
    'Ejecuciones encoladas desde el portal. Reemplaza el JSON local — sobrevive reinicios.';
COMMENT ON TABLE public.portal_act3_audit_log IS
    'Log de eventos para observabilidad (visitas a páginas, requests de planner, errores). Solo lectura interna.';
