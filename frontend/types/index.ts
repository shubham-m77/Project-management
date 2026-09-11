export interface User {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: User;
  members: { user: User; role: "admin" | "member" }[];
  status: "planning" | "active" | "on-hold" | "completed";
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  assignedTo?: User;
  createdBy: User;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
}