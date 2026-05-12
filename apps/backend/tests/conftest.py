"""Fixtures compartidas de pytest."""

from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from portal_act3.adapters import plan_run_store as store_module
from portal_act3.config import get_settings
from portal_act3.main import create_app

REPO_ROOT = Path(__file__).resolve().parents[3]
PDDL_DIR = REPO_ROOT / "entregables" / "pddl"
PLANS_DIR = REPO_ROOT / "entregables" / "planes"


@pytest.fixture(scope="session", autouse=True)
def _configure_paths(tmp_path_factory: pytest.TempPathFactory) -> Iterator[None]:
    """Reapunta plans_dir a un temp dir para no escribir en el repo durante tests."""
    settings = get_settings()
    real_plans_dir = settings.plans_dir

    tmp_plans = tmp_path_factory.mktemp("plans")
    for src in PLANS_DIR.glob("*-plan.txt"):
        (tmp_plans / src.name).write_text(src.read_text(encoding="utf-8"), encoding="utf-8")

    object.__setattr__(settings, "plans_dir", tmp_plans)
    store_module._store = None

    yield

    object.__setattr__(settings, "plans_dir", real_plans_dir)
    store_module._store = None


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


@pytest.fixture
def domain_text() -> str:
    return (PDDL_DIR / "domain.pddl").read_text(encoding="utf-8")


@pytest.fixture
def problem_1_text() -> str:
    return (PDDL_DIR / "problem-1.pddl").read_text(encoding="utf-8")


@pytest.fixture
def problem_2_text() -> str:
    return (PDDL_DIR / "problem-2.pddl").read_text(encoding="utf-8")


@pytest.fixture
def problem_3_text() -> str:
    return (PDDL_DIR / "problem-3.pddl").read_text(encoding="utf-8")


@pytest.fixture
def plan_1_text() -> str:
    return (PLANS_DIR / "rover-problem-1-plan.txt").read_text(encoding="utf-8")


@pytest.fixture
def plan_2_text() -> str:
    return (PLANS_DIR / "rover-problem-2-plan.txt").read_text(encoding="utf-8")


@pytest.fixture
def plan_3_text() -> str:
    return (PLANS_DIR / "rover-problem-3-plan.txt").read_text(encoding="utf-8")
