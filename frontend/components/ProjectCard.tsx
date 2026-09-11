import Link from "next/link";
import { Project } from "@/types";

const statusColors: Record<Project["status"], string> = {
  planning: "bg-[#edf0ec] text-[#69737d]",
  active: "bg-[#dcefe8] text-[#287264]",
  "on-hold": "bg-[#fff1ce] text-[#94702c]",
  completed: "bg-[#e3eaf1] text-[#46637c]",
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project._id}`}
      className="focus-ring group block rounded-2xl border border-[#dfe4df] bg-white p-5 shadow-[0_12px_35px_rgba(22,51,59,.05)] transition duration-300 hover:-translate-y-1 hover:border-[#b8cdc8] hover:shadow-[0_18px_45px_rgba(22,51,59,.1)]"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-[#16333b]">{project.name}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${statusColors[project.status]}`}
        >
          {project.status}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#69737d]">
        {project.description || "No description"}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-[#edf0ec] pt-3 text-xs text-[#69737d]">
        <span>{project.members.length} member{project.members.length !== 1 ? "s" : ""}</span>
        <span className="font-bold text-[#2d7a72] transition group-hover:translate-x-1">Open -&gt;</span>
      </div>
    </Link>
  );
}