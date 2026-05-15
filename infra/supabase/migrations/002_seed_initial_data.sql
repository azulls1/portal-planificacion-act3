-- ============================================================================
-- Portal Actividad 3 — seed inicial
-- ============================================================================
-- Datos extraídos del código hardcoded actual (scenarios.py) y del filesystem
-- (entregables/pddl/, entregables/planes/, entregables/capturas/).
-- Idempotente: usa ON CONFLICT DO UPDATE.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- team_members
-- ----------------------------------------------------------------------------
INSERT INTO public.portal_act3_team_members (slug, full_name, role, bio)
VALUES (
    'autor',
    'Adonai Samael Hernández Mata',
    'Estudiante de la maestría — autor único de la actividad',
    'Maestría en Inteligencia Artificial — UNIR. Curso de Razonamiento y planificación automática.'
)
ON CONFLICT (slug) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role      = EXCLUDED.role,
    bio       = EXCLUDED.bio;

-- ----------------------------------------------------------------------------
-- scenarios
-- ----------------------------------------------------------------------------
INSERT INTO public.portal_act3_scenarios
    (member_slug, member_name, problem_slug, title, description, differs_from_base, is_base, display_order)
VALUES
    (
        'problem-1',
        'Adonai Samael Hernández Mata',
        'problem-1',
        'Problema base — un mineral, un laboratorio',
        'Configuración base del dominio rover-mineral-transport: el rover debe extraer un mineral (M1) en L4 y entregarlo en el laboratorio (L5). Topología lineal L1→L2→L3→L4↔L5. Plan óptimo: 14 acciones.',
        '[]'::jsonb,
        TRUE,
        1
    ),
    (
        'problem-2',
        'Adonai Samael Hernández Mata',
        'problem-2',
        'Tres minerales con acceso condicionado por el laboratorio',
        'Extensión del problema base con un tercer mineral (M3) en una nueva localidad (L6) y una arista unidireccional L5→L6 que obliga al rover a visitar el laboratorio antes de poder acceder a M3. Examina si el planner razona sobre precondiciones topológicas no triviales. Plan óptimo: 19 acciones.',
        '["+1 mineral (M3 en L6)", "+1 localidad (L6)", "+1 arista bidireccional (L4↔L6)", "+1 arista UNIDIRECCIONAL (L5→L6) — restricción del escenario"]'::jsonb,
        FALSE,
        2
    ),
    (
        'problem-3',
        'Adonai Samael Hernández Mata',
        'problem-3',
        'Dos laboratorios con asignación oportunista',
        'Extensión del problema base con un segundo laboratorio (L7) que también puede aceptar cualquier mineral, dos minerales adicionales (M3 en L6 y M4 en L7), y aristas bidireccionales L5↔L6↔L7. M4 está en el mismo nodo del segundo lab, permitiendo resolverse en 2 acciones. Examina si el planner elige asignación oportunista (entregar M3 en L7 para encadenar con M4) en lugar de la ruta obvia. Plan óptimo: 20 acciones.',
        '["+2 localidades (L6, L7)", "+2 minerales (M3 en L6, M4 en L7)", "+1 laboratorio adicional (L7 también es lab)", "+4 aristas bidireccionales (L5↔L6, L6↔L7)"]'::jsonb,
        FALSE,
        3
    )
ON CONFLICT (problem_slug) DO UPDATE SET
    title             = EXCLUDED.title,
    description       = EXCLUDED.description,
    differs_from_base = EXCLUDED.differs_from_base,
    is_base           = EXCLUDED.is_base,
    display_order     = EXCLUDED.display_order;

-- ----------------------------------------------------------------------------
-- pddl_files (metadata — el contenido vive en disco dentro de la imagen)
-- ----------------------------------------------------------------------------
INSERT INTO public.portal_act3_pddl_files
    (slug, kind, name, relative_path, size_bytes, content_sha256, description)
VALUES
    ('rover-domain',  'domain',         'domain.pddl',                 'entregables/pddl/domain.pddl',                 3486, '50b91b648cb36740', 'Dominio PDDL del rover-mineral-transport'),
    ('problem-1',     'problem',        'problem-1.pddl',              'entregables/pddl/problem-1.pddl',              1834, '30d88d370cd368ce', 'Problema base: 1 mineral, 1 laboratorio'),
    ('problem-2',     'problem',        'problem-2.pddl',              'entregables/pddl/problem-2.pddl',              4106, 'bcb82f3b5fcd4373', 'Escenario alternativo 1: 3 minerales con acceso condicionado'),
    ('problem-3',     'problem',        'problem-3.pddl',              'entregables/pddl/problem-3.pddl',              4454, 'e30bd14c74622944', 'Escenario alternativo 2: 2 laboratorios con asignación oportunista'),
    ('snake-domain',  'snake_domain',   'snake-ipc2018/domain.pddl',   'entregables/pddl/snake-ipc2018/domain.pddl',   2276, '44f28cb9960bff02', 'Dominio PDDL Snake del IPC 2018'),
    ('snake-p01',     'snake_problem',  'snake-ipc2018/p01.pddl',      'entregables/pddl/snake-ipc2018/p01.pddl',      3711, '396cff91f6f7c741', 'Snake p01 — instancia objetivo del C1')
ON CONFLICT (slug) DO UPDATE SET
    name           = EXCLUDED.name,
    relative_path  = EXCLUDED.relative_path,
    size_bytes     = EXCLUDED.size_bytes,
    content_sha256 = EXCLUDED.content_sha256,
    description    = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- plans
-- ----------------------------------------------------------------------------
INSERT INTO public.portal_act3_plans
    (slug, problem_slug, name, relative_path, actions_count, plan_cost, planner_used)
VALUES
    ('snake-problem-1-plan',  'snake-p01',  'snake-problem-1-plan.txt',  'entregables/planes/snake-problem-1-plan.txt',  24, 24.00, 'Delfi 1 (IPC2018 optimal track winner)'),
    ('rover-problem-1-plan',  'problem-1',  'rover-problem-1-plan.txt',  'entregables/planes/rover-problem-1-plan.txt',  14, 14.00, 'Delfi 1 (IPC2018 optimal track winner)'),
    ('rover-problem-2-plan',  'problem-2',  'rover-problem-2-plan.txt',  'entregables/planes/rover-problem-2-plan.txt',  19, 19.00, 'Delfi 1 (IPC2018 optimal track winner)'),
    ('rover-problem-3-plan',  'problem-3',  'rover-problem-3-plan.txt',  'entregables/planes/rover-problem-3-plan.txt',  20, 20.00, 'Delfi 1 (IPC2018 optimal track winner)')
ON CONFLICT (slug) DO UPDATE SET
    actions_count = EXCLUDED.actions_count,
    plan_cost     = EXCLUDED.plan_cost,
    planner_used  = EXCLUDED.planner_used,
    relative_path = EXCLUDED.relative_path;

-- ----------------------------------------------------------------------------
-- captures
-- ----------------------------------------------------------------------------
INSERT INTO public.portal_act3_captures
    (name, criterion, relative_path, description)
VALUES
    ('c1-singularity-install',       'C1', 'entregables/capturas/c1-singularity-install.png',       'Instalación de Singularity en el VPS'),
    ('c1-snake-execution-terminal',  'C1', 'entregables/capturas/c1-snake-execution-terminal.png',  'Terminal con ejecución del planner Delfi 1 sobre Snake p01'),
    ('c1-snake-plan-file',           'C1', 'entregables/capturas/c1-snake-plan-file.png',           'Plan generado para Snake p01 (24 acciones)'),
    ('c2-rover-execution-terminal',  'C2', 'entregables/capturas/c2-rover-execution-terminal.png',  'Terminal ejecutando el planner sobre el dominio rover'),
    ('c2-rover-plan-file',           'C2', 'entregables/capturas/c2-rover-plan-file.png',           'Plan generado para el problema rover base'),
    ('c3-escenario1-plan-file',      'C2', 'entregables/capturas/c3-escenario1-plan-file.png',      'Plan generado para escenario alternativo problem-2'),
    ('c3-escenario2-plan-file',      'C2', 'entregables/capturas/c3-escenario2-plan-file.png',      'Plan generado para escenario alternativo problem-3')
ON CONFLICT (name) DO UPDATE SET
    criterion     = EXCLUDED.criterion,
    relative_path = EXCLUDED.relative_path,
    description   = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- audit_log: registrar el bootstrap
-- ----------------------------------------------------------------------------
INSERT INTO public.portal_act3_audit_log (event_type, payload)
VALUES (
    'schema.bootstrap',
    jsonb_build_object(
        'migration', '001+002',
        'applied_at', NOW(),
        'note', 'Migración inicial + seed desde código hardcoded'
    )
);
