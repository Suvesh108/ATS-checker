// ─── Shared Types ─────────────────────────────────────────────────────────────

export type Screen = 'landing' | 'dashboard' | 'optimizer' | 'report' | 'matches' | 'settings';

export interface Resume {
  id: string;
  filename: string;
  uploaded_at: string;
  latest_score: number | null;
  status: string;
}

export interface AnalysisResult {
  ats_score: number;
  summary: string;
  keywords_found: string[];
  keywords_missing: string[];
  critical_fixes: number;
  parsing_factors: Record<string, { status: 'passed' | 'warning' | 'failed'; note: string }>;
  strategic_improvements: { title: string; description: string; points: number }[];
  readable_sections: string[];
  unreadable_sections: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  priority: 'critical' | 'normal';
}

export interface JobMatch {
  job_title: string;
  company_name: string;
  location: string;
  remote_status: string;
  compatibility_score: number;
  salary_min: number;
  salary_max: number;
  posted_ago: string;
  missing_skills: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  plan: string;
  avatar_url: string | null;
  created_at: string;
  stats?: {
    avg_score: number | null;
    resumes_count: number;
    job_matches_count: number;
  };
}
