import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface PddlFileInfo {
  slug: string;
  kind: 'domain' | 'problem';
  size_bytes: number;
  sha256: string;
  is_valid: boolean;
  validation_error: string | null;
}

export interface PlanRunRequest {
  domain_slug: string;
  problem_slug: string;
  planner_name?: string;
  timeout_seconds?: number;
}

export type PlanRunStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'timeout';

export interface PlanRun {
  run_id: string;
  domain_slug: string;
  problem_slug: string;
  planner_name: string;
  status: PlanRunStatus;
  created_at: string;
  updated_at: string;
  plan_text: string | null;
  plan_cost: number | null;
  plan_actions_count: number | null;
  plan_sha256: string | null;
  stdout: string | null;
  stderr: string | null;
  error_message: string | null;
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  portal_route: string;
  scenario_problem_slug: string | null;
}

export interface Scenario {
  scenario_id: string;
  member_slug: string;
  member_name: string;
  title: string;
  description: string;
  problem_slug: string;
  differs_from_base: string[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  listPddlFiles(): Observable<PddlFileInfo[]> {
    return this.http.get<PddlFileInfo[]>(`${this.base}/pddl-files`);
  }

  getPddlFile(slug: string): Observable<string> {
    return this.http.get(`${this.base}/pddl-files/${slug}`, {
      responseType: 'text',
    });
  }

  createPlanRun(req: PlanRunRequest): Observable<PlanRun> {
    return this.http.post<PlanRun>(`${this.base}/plan-runs`, req);
  }

  getPlanRun(runId: string): Observable<PlanRun> {
    return this.http.get<PlanRun>(`${this.base}/plan-runs/${runId}`);
  }

  listTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.base}/scenarios/team`);
  }

  listScenarios(): Observable<Scenario[]> {
    return this.http.get<Scenario[]>(`${this.base}/scenarios`);
  }

  getScenarioByMember(slug: string): Observable<Scenario | null> {
    return this.http.get<Scenario | null>(`${this.base}/scenarios/${slug}`);
  }

  listPlanFiles(): Observable<PlanFileInfo[]> {
    return this.http.get<PlanFileInfo[]>(`${this.base}/plans`);
  }

  getPlanFile(slug: string): Observable<string> {
    return this.http.get(`${this.base}/plans/${slug}`, { responseType: 'text' });
  }

  simulatePlan(problemSlug: string): Observable<SimulationResult> {
    return this.http.post<SimulationResult>(
      `${this.base}/plan-runs/${problemSlug}/simulate`,
      {},
    );
  }

  listCaptures(): Observable<CaptureInfo[]> {
    return this.http.get<CaptureInfo[]>(`${this.base}/captures`);
  }

  getEntregableInfo(): Observable<EntregableInfo> {
    return this.http.get<EntregableInfo>(`${this.base}/entregable/info`);
  }
}

export interface EntregableInfo {
  exists: boolean;
  filename: string;
  size_bytes: number | null;
  sha256: string | null;
  download_url: string | null;
}

export interface PlanFileInfo {
  slug: string;
  filename: string;
  size_bytes: number;
  sha256: string;
  actions_count: number;
  total_cost: number;
}

export interface SimulationResult {
  problem_slug: string;
  success: boolean;
  goal_satisfied: boolean;
  cost: number;
  actions_count: number;
  plan_sha256: string;
  parsed_cost: number;
  first_error: {
    step: number;
    action: string;
    parameters: string[];
    error: string;
  } | null;
}

export interface CaptureInfo {
  slug: string;
  filename: string;
  criterio: string;
  size_bytes: number;
}
