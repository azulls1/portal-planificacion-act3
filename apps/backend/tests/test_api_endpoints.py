"""Tests de los endpoints HTTP."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_pddl_files(client: TestClient) -> None:
    response = client.get("/api/pddl-files")
    assert response.status_code == 200
    files = response.json()
    slugs = {f["slug"] for f in files}
    assert {"domain", "problem-1", "problem-2", "problem-3"}.issubset(slugs)
    for f in files:
        assert f["is_valid"] is True
        assert f["validation_error"] is None
        assert f["size_bytes"] > 0
        assert len(f["sha256"]) == 64


def test_get_pddl_domain(client: TestClient) -> None:
    response = client.get("/api/pddl-files/domain")
    assert response.status_code == 200
    body = response.text
    assert "rover-mineral-transport" in body
    assert "(:action move" in body


def test_get_pddl_missing(client: TestClient) -> None:
    response = client.get("/api/pddl-files/does-not-exist")
    assert response.status_code == 404


def test_get_pddl_path_traversal_blocked(client: TestClient) -> None:
    response = client.get("/api/pddl-files/..%2F..%2Fetc%2Fpasswd")
    assert response.status_code == 404


def test_list_plans(client: TestClient) -> None:
    response = client.get("/api/plans")
    assert response.status_code == 200
    plans = response.json()
    slugs = {p["slug"] for p in plans}
    assert {"rover-problem-1", "rover-problem-2", "rover-problem-3"}.issubset(slugs)


def test_get_plan_1(client: TestClient) -> None:
    response = client.get("/api/plans/rover-problem-1")
    assert response.status_code == 200
    assert "(move R1 L4 L3)" in response.text
    assert "(deliver R1 M2 L5)" in response.text


def test_simulate_plan_1(client: TestClient) -> None:
    response = client.post("/api/plan-runs/problem-1/simulate")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["goal_satisfied"] is True
    assert body["cost"] == 14


def test_simulate_plan_2(client: TestClient) -> None:
    response = client.post("/api/plan-runs/problem-2/simulate")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["cost"] == 19


def test_simulate_plan_3(client: TestClient) -> None:
    response = client.post("/api/plan-runs/problem-3/simulate")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["cost"] == 20


def test_simulate_missing_problem(client: TestClient) -> None:
    response = client.post("/api/plan-runs/no-existe/simulate")
    assert response.status_code == 404


def test_list_scenarios(client: TestClient) -> None:
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) >= 2


def test_list_team_members(client: TestClient) -> None:
    """Trabajo individual: devuelve un solo autor."""
    response = client.get("/api/scenarios/team")
    assert response.status_code == 200
    team = response.json()
    assert len(team) == 1
    assert team[0]["slug"] == "autor"


def test_get_author(client: TestClient) -> None:
    response = client.get("/api/scenarios/author")
    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "autor"
    assert "Sergio" in body["name"]


def test_get_scenario_by_slug_problem2(client: TestClient) -> None:
    response = client.get("/api/scenarios/problem-2")
    assert response.status_code == 200
    body = response.json()
    assert body is not None
    assert body["problem_slug"] == "problem-2"
    assert "L6" in body["description"] or "tercer mineral" in body["description"].lower()


def test_get_scenario_by_slug_problem3(client: TestClient) -> None:
    response = client.get("/api/scenarios/problem-3")
    assert response.status_code == 200
    body = response.json()
    assert body is not None
    assert body["problem_slug"] == "problem-3"


def test_get_scenario_missing(client: TestClient) -> None:
    response = client.get("/api/scenarios/no-existe")
    assert response.status_code == 200
    assert response.json() is None


def test_list_captures_empty(client: TestClient) -> None:
    response = client.get("/api/captures")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_plan_run_validates_pddl_404(client: TestClient) -> None:
    response = client.post(
        "/api/plan-runs",
        json={
            "domain_slug": "no-existe",
            "problem_slug": "problem-1",
            "planner_name": "delfi",
            "timeout_seconds": 60,
        },
    )
    assert response.status_code == 404


def test_plan_run_lifecycle(client: TestClient) -> None:
    """Smoke test: crear run, listarlo, consultarlo. Celery puede no estar arriba."""
    response = client.post(
        "/api/plan-runs",
        json={
            "domain_slug": "domain",
            "problem_slug": "problem-1",
            "planner_name": "delfi",
            "timeout_seconds": 60,
        },
    )
    assert response.status_code == 202
    body = response.json()
    run_id = body["run_id"]
    assert body["domain_slug"] == "domain"
    assert body["problem_slug"] == "problem-1"

    list_response = client.get("/api/plan-runs")
    assert list_response.status_code == 200
    assert any(r["run_id"] == run_id for r in list_response.json())

    get_response = client.get(f"/api/plan-runs/{run_id}")
    assert get_response.status_code == 200
    assert get_response.json()["run_id"] == run_id

    del_response = client.delete(f"/api/plan-runs/{run_id}")
    assert del_response.status_code == 204
