"""Tests de persistencia de plan_runs."""

from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from portal_act3.adapters.plan_run_store import PlanRunStore
from portal_act3.domain.models import PlanRun, PlanRunStatus


def _make_run() -> PlanRun:
    return PlanRun(
        run_id=uuid4(),
        domain_slug="domain",
        problem_slug="problem-1",
        planner_name="delfi",
        status=PlanRunStatus.QUEUED,
    )


def test_put_and_get(tmp_path: Path) -> None:
    store = PlanRunStore(storage_path=tmp_path / "runs.json")
    run = _make_run()
    store.put(run)
    assert store.get(run.run_id) is not None
    assert store.get(run.run_id).problem_slug == "problem-1"


def test_persistence_across_instances(tmp_path: Path) -> None:
    path = tmp_path / "runs.json"
    store_a = PlanRunStore(storage_path=path)
    run = _make_run()
    store_a.put(run)

    store_b = PlanRunStore(storage_path=path)
    loaded = store_b.get(run.run_id)
    assert loaded is not None
    assert loaded.run_id == run.run_id
    assert loaded.problem_slug == run.problem_slug


def test_list_returns_most_recent_first(tmp_path: Path) -> None:
    store = PlanRunStore(storage_path=tmp_path / "runs.json")
    runs = [_make_run() for _ in range(3)]
    for r in runs:
        store.put(r)
    listed = store.list_all()
    assert len(listed) == 3


def test_delete_removes_run(tmp_path: Path) -> None:
    store = PlanRunStore(storage_path=tmp_path / "runs.json")
    run = _make_run()
    store.put(run)
    assert store.delete(run.run_id) is True
    assert store.get(run.run_id) is None
    assert store.delete(run.run_id) is False


def test_status_update_persists(tmp_path: Path) -> None:
    path = tmp_path / "runs.json"
    store = PlanRunStore(storage_path=path)
    run = _make_run()
    store.put(run)
    run.status = PlanRunStatus.COMPLETED
    run.plan_cost = 14.0
    store.put(run)

    store_b = PlanRunStore(storage_path=path)
    loaded = store_b.get(run.run_id)
    assert loaded is not None
    assert loaded.status == PlanRunStatus.COMPLETED
    assert loaded.plan_cost == 14.0
