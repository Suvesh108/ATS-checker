// ─── API Base URL ─────────────────────────────────────────────────────────────

export const API_BASE = 'http://localhost:8000/api';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const getJsonHeaders = (): Record<string, string> => ({
  ...getAuthHeaders(),
  'Content-Type': 'application/json',
});

export const uploadResume = async (file: File, jobDescription?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (jobDescription) formData.append('job_description', jobDescription);

  const res = await fetch(`${API_BASE}/resumes/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return res.json();
};
