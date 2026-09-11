import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MngProLogo from "@/components/MngProLogo";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="app-shell flex min-h-screen flex-col px-6 py-8 md:px-12">
      <header className="flex items-center justify-between gap-4"><MngProLogo /><span className="hidden text-right text-xs font-bold uppercase tracking-[.18em] text-[#69737d] sm:block">Plan. Collaborate. Deliver.</span></header>
      <section className="mx-auto flex w-full max-w-6xl flex-1 items-center py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div className="page-enter"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#e7775d]">The team productivity platform</p><h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.05] text-[#16333b] md:text-7xl">Turn good ideas into <em className="font-normal text-[#2d7a72]">shared momentum.</em></h1><p className="mt-6 max-w-xl text-lg leading-8 text-[#69737d]">One calm, connected workspace for projects, tasks and the people making it happen.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/sign-up" className="focus-ring rounded-xl bg-[#e7775d] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d9654d]">Create your workspace -&gt;</Link><Link href="/sign-in" className="focus-ring rounded-xl border border-[#b8cdc8] bg-white px-6 py-3.5 text-sm font-bold text-[#16333b] transition hover:border-[#2d7a72]">Sign in</Link></div></div>
          <div className="hero-grid relative rounded-[2rem] border border-[#dfe4df] bg-[#16333b] p-6 text-[#f6f7f4] shadow-[0_28px_80px_rgba(22,51,59,.18)] md:p-8"><div className="flex items-center justify-between border-b border-white/15 pb-5"><span className="text-sm font-bold tracking-[.12em]">TODAY / MNGPRO</span><span className="live-dot h-3 w-3 rounded-full bg-[#f2c66d]" /></div><p className="mt-8 text-3xl font-bold leading-tight">Clarity for the work<br /><span className="text-[#f2c66d]">ahead of you.</span></p><div className="mt-10 space-y-3"><div className="rounded-xl bg-white/10 p-4 transition hover:bg-white/15"><div className="flex justify-between text-xs"><span className="font-bold">Website refresh</span><span className="text-[#a8d6c8]">72%</span></div><div className="mt-3 h-1.5 rounded-full bg-white/15"><div className="h-full w-[72%] rounded-full bg-[#a8d6c8] transition-all duration-1000" /></div></div><div className="flex items-center gap-3 rounded-xl bg-[#e7775d] p-4 text-sm font-bold transition hover:-translate-y-1"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">3</span> Tasks ready for review</div></div></div>
        </div>
      </section>
      <footer className="flex justify-between gap-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#69737d] sm:text-xs"><span>Built for focused teams</span><span>est. 2026</span></footer>
    </main>
  );
}