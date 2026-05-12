-- ============================================================
-- Migración inicial — Portal Actividad 3
-- ============================================================
-- Aplicar con: supabase migration up
-- O manualmente en SQL Editor del proyecto Supabase.

create extension if not exists "uuid-ossp";

-- ============================================================
-- Tabla: team_members
-- ============================================================
create table if not exists public.team_members (
    slug                  text primary key,
    name                  text not null,
    role                  text not null,
    portal_route          text not null,
    scenario_problem_slug text,
    created_at            timestamptz not null default now()
);

-- ============================================================
-- Tabla: scenarios — escenarios alternativos por integrante
-- ============================================================
create table if not exists public.scenarios (
    scenario_id      uuid primary key default uuid_generate_v4(),
    member_slug      text not null references public.team_members(slug) on delete cascade,
    title            text not null,
    description      text not null,
    problem_slug     text not null,
    differs_from_base jsonb not null default '[]'::jsonb,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index if not exists scenarios_member_slug_idx on public.scenarios(member_slug);

-- ============================================================
-- Tabla: plan_runs — ejecuciones del planner
-- ============================================================
create type plan_run_status as enum (
    'queued', 'running', 'completed', 'failed', 'timeout'
);

create table if not exists public.plan_runs (
    run_id              uuid primary key default uuid_generate_v4(),
    domain_slug         text not null,
    problem_slug        text not null,
    planner_name        text not null default 'delfi',
    status              plan_run_status not null default 'queued',

    plan_text           text,
    plan_cost           numeric,
    plan_actions_count  integer,
    plan_sha256         text,

    stdout              text,
    stderr              text,
    error_message       text,

    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index if not exists plan_runs_status_idx on public.plan_runs(status);
create index if not exists plan_runs_problem_idx on public.plan_runs(problem_slug);

-- ============================================================
-- Tabla: references — referencias APA del reporte
-- ============================================================
create table if not exists public."references" (
    ref_id      uuid primary key default uuid_generate_v4(),
    citation    text not null,
    url         text,
    bibtex_key  text,
    sort_order  integer not null default 0,
    created_at  timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.team_members  enable row level security;
alter table public.scenarios     enable row level security;
alter table public.plan_runs     enable row level security;
alter table public."references"  enable row level security;

-- Lectura pública para que el profesor pueda ver el portal sin login
create policy "public_read_team"     on public.team_members     for select using (true);
create policy "public_read_scenarios" on public.scenarios        for select using (true);
create policy "public_read_plans"    on public.plan_runs        for select using (true);
create policy "public_read_refs"     on public."references"     for select using (true);

-- Escritura: solo usuarios autenticados (integrantes)
create policy "auth_write_scenarios" on public.scenarios
    for all using (auth.uid() is not null);

create policy "auth_write_plans"     on public.plan_runs
    for all using (auth.uid() is not null);

create policy "auth_write_refs"      on public."references"
    for all using (auth.uid() is not null);

-- ============================================================
-- Buckets de Storage (configurar manualmente en panel)
-- ============================================================
-- - pddl-files/    (archivos PDDL subidos por integrantes)
-- - plans/         (planes generados por el planner)
-- - screenshots/   (capturas de pantalla por criterio)
-- - report/        (PDF del reporte APA)
