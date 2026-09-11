"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/api";

export default function NewProjectForm() {
	const { getToken } = useAuth();
	const router = useRouter();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!name.trim()) return setError("Give your project a name first.");
		setIsSaving(true);
		setError("");
		try {
			const project = await createProject(getToken, { name: name.trim(), description: description.trim() });
			router.push(`/projects/${project._id}`);
			router.refresh();
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Could not create project.");
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="rounded-2xl border border-[#dfe4df] bg-white p-5 shadow-[0_16px_45px_rgba(22,51,59,.06)]">
			<div className="mb-5 flex items-start justify-between gap-4">
				<div>
					<p className="text-xs font-bold uppercase tracking-[.18em] text-[#e7775d]">Start something new</p>
					<h2 className="mt-1 text-xl font-bold text-[#16333b]">Create a project</h2>
				</div>
				<span className="text-2xl text-[#f2c66d]">+</span>
			</div>
			<label className="block text-xs font-bold uppercase tracking-[.12em] text-[#69737d]">Project name
				<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Website refresh" className="focus-ring mt-2 w-full rounded-xl border border-[#dfe4df] bg-[#f6f7f4] px-3 py-2.5 text-sm text-[#16202a] outline-none transition focus:border-[#2d7a72]" />
			</label>
			<label className="mt-4 block text-xs font-bold uppercase tracking-[.12em] text-[#69737d]">Description <span className="font-normal normal-case tracking-normal">(optional)</span>
				<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does your team want to deliver?" rows={3} className="focus-ring mt-2 w-full resize-none rounded-xl border border-[#dfe4df] bg-[#f6f7f4] px-3 py-2.5 text-sm text-[#16202a] outline-none transition focus:border-[#2d7a72]" />
			</label>
			{error && <p className="mt-3 text-sm text-[#c4513d]">{error}</p>}
			<button disabled={isSaving} className="button-shine focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e7775d] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d9654d] disabled:cursor-wait disabled:opacity-60">
				{isSaving ? "Creating..." : "Create project"} <span aria-hidden="true">-&gt;</span>
			</button>
		</form>
	);
}
