"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { deleteProject, updateProject } from "@/lib/api";
import { LoaderCircle, SquarePen, Trash2 } from "lucide-react";

export default function ProjectEditor({ project, canManage }: { project: Project; canManage: boolean }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [currentProject, setCurrentProject] = useState(project);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancel = () => {
    setName(currentProject.name);
    setDescription(currentProject.description);
    setError("");
    setIsEditing(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const savedProject = await updateProject(getToken, currentProject._id, {
        name: trimmedName,
        description: description.trim(),
      });
      setCurrentProject(savedProject);
      setName(savedProject.name);
      setDescription(savedProject.description);
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${currentProject.name}" and all its tasks? This cannot be undone.`)) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteProject(getToken, currentProject._id);
      router.push("/dashboard");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete project.");
      setIsDeleting(false);
    }
  };

  if (!canManage) {
    return (
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-bold text-[#16333b]">{currentProject.name}</h1>
          <span className="rounded-full bg-[#edf0ec] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#69737d]">Member access</span>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#69737d]">{currentProject.description || "A focused space for your team to plan, build and deliver."}</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="w-full max-w-2xl rounded-2xl border border-[#b8cdc8] bg-white p-5 shadow-[0_16px_45px_rgba(22,51,59,.08)]">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#e7775d]">Edit project</p>
        <label className="mt-4 block text-xs font-bold uppercase tracking-[.12em] text-[#69737d]">
          Project name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
            maxLength={100}
            className="focus-ring mt-2 w-full rounded-xl border border-[#dfe4df] bg-[#f6f7f4] px-3 py-3 text-base font-bold text-[#16333b] outline-none transition focus:border-[#2d7a72]"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase tracking-[.12em] text-[#69737d]">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="What does this project aim to deliver?"
            className="focus-ring mt-2 w-full resize-none rounded-xl border border-[#dfe4df] bg-[#f6f7f4] px-3 py-3 text-sm leading-6 text-[#16202a] outline-none transition focus:border-[#2d7a72]"
          />
        </label>
        {error && <p className="mt-3 text-sm text-[#c4513d]">{error}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={handleCancel} disabled={isSaving} className="focus-ring rounded-xl px-4 py-2.5 text-sm font-bold text-[#69737d] transition hover:bg-[#edf0ec] disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={isSaving} className="button-shine focus-ring rounded-xl bg-[#16333b] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d7a72] disabled:cursor-wait disabled:opacity-60">{isSaving ? <><LoaderCircle className="inline size-4 animate-spin" /> Saving...</> : "Save changes"}</button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start gap-3">
        <h1 className="text-4xl font-bold text-[#16333b]">{currentProject.name}</h1>
        <button type="button" onClick={() => setIsEditing(true)} aria-label="Edit project" title="Edit project" className="focus-ring rounded-lg border border-[#dfe4df] bg-white px-2 py-1.5 font-bold text-[#2d7a72] transition hover:-translate-y-0.5 hover:border-[#b8cdc8] hover:shadow-sm"><SquarePen className="size-4" /></button>
        <button type="button" onClick={handleDelete} disabled={isDeleting} aria-label="Delete project" title="Delete project" className="focus-ring rounded-lg border border-[#f1d1ca] bg-white px-2 py-1.5 font-bold text-[#c4513d] transition hover:-translate-y-0.5 hover:bg-[#fbe9e4] disabled:cursor-wait disabled:opacity-60">{isDeleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#69737d]">{currentProject.description || "A focused space for your team to plan, build and deliver."}</p>
      {error && <p className="mt-3 text-sm text-[#c4513d]">{error}</p>}
    </div>
  );
}
