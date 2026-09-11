"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Project } from "@/types";
import { addProjectMember } from "@/lib/api";
import { LoaderCircle, MailPlus, Users } from "lucide-react";

export default function MembersPanel({ project, canManage }: { project: Project; canManage: boolean }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addProjectMember(getToken, project._id, email);
      setEmail("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-[#dfe4df] bg-white p-5 shadow-[0_12px_35px_rgba(22,51,59,.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#2d7a72]"><Users className="size-3.5" /> Collaboration</p>
          <h3 className="mt-1 text-lg font-bold text-[#16333b]">Team members</h3>
        </div>
        <span className="rounded-full bg-[#edf5f1] px-2.5 py-1 text-xs font-bold text-[#287264]">{project.members.length}</span>
      </div>

      <ul className="mt-5 flex flex-col gap-2">
        {project.members.map((m) => (
          <li key={m.user._id} className="flex items-center justify-between rounded-xl bg-[#f6f7f4] px-3 py-2.5 text-sm">
            <span className="font-medium text-[#16202a]">{m.user.name || m.user.email}</span>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#69737d]">
              {m.role}
            </span>
          </li>
        ))}
      </ul>

      {canManage ? <form onSubmit={handleInvite} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@company.com"
          className="focus-ring flex-1 rounded-xl border border-[#dfe4df] bg-[#f6f7f4] px-3 py-2.5 text-sm outline-none transition focus:border-[#2d7a72]"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="button-shine focus-ring flex items-center justify-center gap-2 rounded-xl bg-[#16333b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#2d7a72] disabled:cursor-wait disabled:opacity-50"
        >
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : <MailPlus className="size-4" />}
          {loading ? "Sending..." : "Invite"}
        </button>
      </form> : <p className="mt-5 rounded-xl bg-[#f6f7f4] px-3 py-2.5 text-xs text-[#69737d]">Only project admins can invite new members.</p>}
      {error && <p role="alert" className="mt-3 rounded-lg bg-[#fbe9e4] px-3 py-2 text-xs text-[#c4513d]">{error}</p>}
      <p className="mt-3 text-xs leading-5 text-[#69737d]">Members must have an account before they can be added to a project.</p>
    </section>
  );
}