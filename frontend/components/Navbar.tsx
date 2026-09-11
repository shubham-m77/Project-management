import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import MngProLogo from "@/components/MngProLogo";

export default function Navbar() {
  return (
    <nav className="border-b border-[#dfe4df] bg-[#f6f7f4]/90 px-5 py-4 backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/dashboard" className="focus-ring"><MngProLogo /></Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs font-semibold uppercase tracking-[.16em] text-[#69737d] sm:inline">Team workspace</span>
          <UserButton userProfileMode="modal" />
        </div>
      </div>
    </nav>
  );
}