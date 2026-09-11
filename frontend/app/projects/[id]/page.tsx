import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";
import ProjectEditor from "@/components/ProjectEditor";
import MembersPanel from "@/components/MembersPanel";
import TaskBoard from "@/components/TaskBoard";
import { getProject, getTasks } from "@/lib/api";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { getToken, userId } = await auth();

  const [project, tasks] = await Promise.all([
    getProject(getToken, id),
    getTasks(getToken, id),
  ]);

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const canManage = project.owner.clerkId === userId || project.members.some(
    (member) => member.user.clerkId === userId && member.role === "admin"
  );

  return (
    <div className="app-shell page-enter min-h-screen">
      <Navbar />
      <main className="mx-auto min-w-0 max-w-7xl px-4 py-7 sm:px-5 md:px-10 md:py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e7775d]">Project workspace</p><div className="mt-2"><ProjectEditor project={project} canManage={canManage} /></div></div>
          <div className="w-full rounded-2xl border border-[#dfe4df] bg-white p-4 shadow-[0_12px_35px_rgba(22,51,59,.05)] md:min-w-56 md:w-auto"><div className="flex justify-between text-xs font-bold uppercase tracking-[.12em] text-[#69737d]"><span>Project progress</span><span className="text-[#2d7a72]">{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf0ec]"><div className="h-full rounded-full bg-[#2d7a72] transition-all duration-700" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-xs text-[#69737d]">{completedTasks} of {tasks.length} tasks complete</p></div>
        </div>

        <div className="mt-10">
           <TaskBoard projectId={id} initialTasks={tasks} members={project.members} canManage={canManage} currentUserId={userId} />
          <MembersPanel project={project} canManage={canManage} />
        </div>
      </main>
    </div>
  );
}