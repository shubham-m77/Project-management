import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import NewProjectForm from "@/components/NewProjectForm";
import { getProjects } from "@/lib/api";

export default async function DashboardPage() {
  const { getToken } = await auth();
  const projects = await getProjects(getToken);
  const activeProjects = projects.filter((project) => project.status === "active").length;
  const teamMembers = new Set(projects.flatMap((project) => project.members.map((member) => member.user._id))).size;

  return (
    <div className="app-shell page-enter min-h-screen">
      <Navbar />
      <main className="mx-auto min-w-0 max-w-7xl px-4 py-7 sm:px-5 md:px-10 md:py-12">
        <section className="grid gap-8 lg:grid-cols-[1.4fr_.6fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-[#e7775d]">Good morning, team</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-[#16333b] md:text-5xl">Make meaningful progress, together.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#69737d]">A calm command center for the work that moves your team forward.</p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-[#dfe4df] bg-white p-2 shadow-[0_16px_45px_rgba(22,51,59,.05)] sm:gap-2 sm:p-3">
            <div className="stat-card rounded-xl bg-[#edf5f1] p-2.5 sm:p-3"><p className="text-xl font-bold text-[#16333b] sm:text-2xl">{projects.length}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#69737d] sm:text-[10px] sm:tracking-[.12em]">Projects</p></div>
            <div className="stat-card rounded-xl bg-[#fff4dc] p-2.5 sm:p-3"><p className="text-xl font-bold text-[#16333b] sm:text-2xl">{activeProjects}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#69737d] sm:text-[10px] sm:tracking-[.12em]">Active</p></div>
            <div className="stat-card rounded-xl bg-[#fbe9e4] p-2.5 sm:p-3"><p className="text-xl font-bold text-[#16333b] sm:text-2xl">{teamMembers}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#69737d] sm:text-[10px] sm:tracking-[.12em]">People</p></div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#2d7a72]">Workspace</p><h2 className="mt-1 text-2xl font-bold text-[#16333b]">Your projects</h2></div>
            <span className="text-sm text-[#69737d]">{projects.length} total</span>
          </div>
          <div className="stagger mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => <ProjectCard key={project._id} project={project} />)}
            {projects.length === 0 && <div className="rounded-2xl border border-dashed border-[#b8cdc8] bg-white/60 p-8 text-sm text-[#69737d] md:col-span-2 xl:col-span-3">Your first project will appear here. Start small, then build momentum.</div>}
          </div>
        </section>

        <div className="mt-10 max-w-xl">
          <NewProjectForm />
        </div>
      </main>
    </div>
  );
}