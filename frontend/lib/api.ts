import { Project, Task } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || (
  process.env.NODE_ENV === "development" ? "http://localhost:5000/api" : ""
);

type GetToken = () => Promise<string | null>;

// Centralized fetch wrapper for authentication and consistent API errors.
async function request<T>(
  path: string,
  getToken: GetToken,
  options: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured. Set it to the deployed MngPro backend URL.");
  }

  const token = await getToken();

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Unable to reach the MngPro API at ${API_URL}. Check that the backend is running and publicly reachable.`);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---------- Projects ----------
export const getProjects = (getToken: GetToken) =>
  request<Project[]>("/projects", getToken);

export const getProject = (getToken: GetToken, id: string) =>
  request<Project>(`/projects/${id}`, getToken);

export const createProject = (
  getToken: GetToken,
  data: { name: string; description?: string }
) =>
  request<Project>("/projects", getToken, {
    method: "POST",
    body: JSON.stringify(data),
  });


export const addProjectMember = (getToken: GetToken, projectId: string, email: string) =>
  request<Project>(`/projects/${projectId}/members`, getToken, {
    method: "POST",
    body: JSON.stringify({ email }),
  });

// ---------- Tasks ----------
export const getTasks = (getToken: GetToken, projectId: string) =>
  request<Task[]>(`/tasks?project=${projectId}`, getToken);

export const createTask = (
  getToken: GetToken,
  data: { title: string; project: string; priority?: string; assignedTo?: string }
) =>
  request<Task>("/tasks", getToken, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateTaskStatus = (
  getToken: GetToken,
  taskId: string,
  status: Task["status"]
) =>
  request<Task>(`/tasks/${taskId}`, getToken, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

export const updateProject = (
  getToken: GetToken,
  projectId: string,
  data: { name: string; description?: string }
) =>
  request<Project>(`/projects/${projectId}`, getToken, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const updateTask = (
  getToken: GetToken,
  taskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: Task["priority"];
    assignedTo?: string | null;
    status?: Task["status"];
  }
) =>
  request<Task>(`/tasks/${taskId}`, getToken, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteTask = (getToken: GetToken, taskId: string) =>
  request<{ message: string }>(`/tasks/${taskId}`, getToken, { method: "DELETE" });

export const deleteProject = (getToken: GetToken, projectId: string) =>
  request<{ message: string }>(`/projects/${projectId}`, getToken, { method: "DELETE" });