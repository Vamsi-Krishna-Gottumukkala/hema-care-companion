const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Token management ───

export function getToken(): string | null {
  return localStorage.getItem("hemaai_token");
}

export function setToken(token: string): void {
  localStorage.setItem("hemaai_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("hemaai_token");
}

// ─── API client ───

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(rest.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "Request failed";
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || errorDetail;
    } catch {
      // ignore
    }

    if (response.status === 401) {
      clearToken();
      window.location.href = "/login";
    }

    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

// ─── Auth API ───

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string | null;
  age?: number | null;
  avatar: string;
  status: string;
  created_at?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export const authApi = {
  register: (name: string, email: string, password: string, phone?: string, age?: number) =>
    apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone, age }),
      skipAuth: true,
    }),

  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  loginGoogle: (idToken: string) =>
    apiRequest<AuthResponse>("/api/auth/login/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
      skipAuth: true,
    }),

  getMe: () => apiRequest<UserData>("/api/auth/me"),
};

// ─── Diagnosis API ───

export interface BloodValues {
  wbc: number;
  rbc: number;
  hemoglobin: number;
  platelet: number;
  neutrophils: number;
  lymphocytes: number;
  monocytes: number;
  eosinophils: number;
}

export interface ParameterAnalysis {
  param: string;
  value: number;
  normal_min: number;
  normal_max: number;
  unit: string;
  flagged: boolean;
}

export interface DiagnosisResultData {
  status: string;
  cancer_type: string;
  risk_level: string;
  confidence_score: number;
  ai_explanation: string[];
  parameter_analysis: ParameterAnalysis[];
}

export interface DiagnosisResponse {
  id: string;
  user_id: string;
  input_type: string;
  result: DiagnosisResultData;
  created_at: string;
  extracted_values?: Record<string, number | null>;
  report_file_url?: string;
}

export interface DiagnosisHistoryResponse {
  items: DiagnosisRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface DiagnosisRecord {
  id: string;
  user_id: string;
  input_type: string;
  wbc?: number;
  rbc?: number;
  hemoglobin?: number;
  platelet?: number;
  neutrophils?: number;
  lymphocytes?: number;
  monocytes?: number;
  eosinophils?: number;
  status: string;
  cancer_type: string;
  risk_level: string;
  confidence_score: number;
  ai_explanation: string[];
  parameter_analysis: ParameterAnalysis[];
  report_file_url?: string;
  created_at: string;
}

export const diagnosisApi = {
  submitBloodValues: (values: BloodValues) =>
    apiRequest<DiagnosisResponse>("/api/diagnosis/blood-values", {
      method: "POST",
      body: JSON.stringify(values),
    }),

  uploadReport: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<DiagnosisResponse>("/api/diagnosis/upload-report", {
      method: "POST",
      body: formData,
    });
  },

  getHistory: (page = 1, limit = 20) =>
    apiRequest<DiagnosisHistoryResponse>(`/api/diagnosis/history?page=${page}&limit=${limit}`),

  getDetail: (id: string) => apiRequest<DiagnosisRecord>(`/api/diagnosis/${id}`),
};

// ─── Hospitals & Doctors API ───

export interface Hospital {
  id?: string;
  name: string;
  address?: string;
  phone?: string;
  rating?: number;
  specializations?: string[];
  lat?: number;
  lng?: number;
  beds?: number;
  founded?: number;
  source?: string;
  place_id?: string;
  open_now?: boolean;
  distance?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  experience?: string;
  hospital_id?: string;
  hospital_name?: string;
  rating?: number;
  patients?: number;
  education?: string;
  avatar?: string;
  available: boolean;
  contact?: string;
}

export const hospitalsApi = {
  searchNearby: (lat: number, lng: number, radius = 5000) =>
    apiRequest<{ hospitals: Hospital[]; total: number }>(
      `/api/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    ),

  list: () =>
    apiRequest<{ hospitals: Hospital[]; total: number }>("/api/hospitals"),

  getById: (id: string) => apiRequest<Hospital>(`/api/hospitals/${id}`),

  getDoctors: (hospitalId: string) =>
    apiRequest<{ doctors: Doctor[]; total: number }>(`/api/hospitals/${hospitalId}/doctors`),
};

export const doctorsApi = {
  list: (specialization?: string, available?: boolean) => {
    const params = new URLSearchParams();
    if (specialization) params.set("specialization", specialization);
    if (available !== undefined) params.set("available", String(available));
    const query = params.toString();
    return apiRequest<{ doctors: Doctor[]; total: number }>(
      `/api/doctors${query ? `?${query}` : ""}`
    );
  },
};

// ─── Reports API ───

export interface Report {
  id: string;
  user_id: string;
  diagnosis_id: string;
  file_url: string;
  generated_at: string;
}

export const reportsApi = {
  generate: (diagnosisId: string) =>
    apiRequest<{ message: string; report_url: string; diagnosis_id: string }>(
      `/api/reports/generate/${diagnosisId}`,
      { method: "POST" }
    ),

  list: () => apiRequest<{ reports: Report[]; total: number }>("/api/reports/"),

  downloadUrl: (diagnosisId: string) =>
    `${API_BASE_URL}/api/reports/download/by-diagnosis/${diagnosisId}`,
};

// ─── Admin API ───

export interface AdminStats {
  total_users: number;
  total_diagnoses: number;
  cancer_detected: number;
  model_accuracy: number;
  monthly_data: { month: string; diagnoses: number; detected: number }[];
  cancer_type_data: { name: string; value: number }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  avatar: string;
  tests_count: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: string;
  module: string;
  message: string;
  user_id?: string;
}

export const adminApi = {
  getStats: () => apiRequest<AdminStats>("/api/admin/stats"),

  listUsers: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return apiRequest<PaginatedResponse<AdminUser>>(`/api/admin/users?${params}`);
  },

  updateUserStatus: (userId: string, status: "active" | "disabled") =>
    apiRequest<{ message: string }>(`/api/admin/users/${userId}/status?status=${status}`, {
      method: "PATCH",
    }),

  listDiagnoses: (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    return apiRequest<PaginatedResponse<DiagnosisRecord & { user_name?: string; user_email?: string }>>(
      `/api/admin/diagnoses?${params}`
    );
  },

  getLogs: (page = 1, limit = 50, level?: string, module?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (level) params.set("level", level);
    if (module) params.set("module", module);
    return apiRequest<PaginatedResponse<SystemLog>>(`/api/admin/logs?${params}`);
  },

  // Hospital CRUD
  createHospital: (data: Omit<Hospital, "id">) =>
    apiRequest<Hospital>("/api/admin/hospitals", { method: "POST", body: JSON.stringify(data) }),
  updateHospital: (id: string, data: Omit<Hospital, "id">) =>
    apiRequest<Hospital>(`/api/admin/hospitals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteHospital: (id: string) =>
    apiRequest<{ message: string }>(`/api/admin/hospitals/${id}`, { method: "DELETE" }),

  // Doctor CRUD
  createDoctor: (data: Omit<Doctor, "id">) =>
    apiRequest<Doctor>("/api/admin/doctors", { method: "POST", body: JSON.stringify(data) }),
  updateDoctor: (id: string, data: Omit<Doctor, "id">) =>
    apiRequest<Doctor>(`/api/admin/doctors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDoctor: (id: string) =>
    apiRequest<{ message: string }>(`/api/admin/doctors/${id}`, { method: "DELETE" }),
};
