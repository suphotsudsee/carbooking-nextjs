"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type Props = {
  fullName: string;
  role: string;
};

export function Navbar({ fullName, role }: Props) {
  return (
    <header className="bg-[#0a7bf2] text-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold text-white">
          ระบบขอใช้รถ สำนักงานสาธารณสุขจังหวัดอุบลราชธานี
        </Link>
        <div className="flex items-center gap-4 text-sm text-white">
          <div className="text-right leading-tight">
            <div className="font-semibold">{fullName}</div>
            <div className="uppercase text-blue-100">{role}</div>
          </div>
          <button
            className="rounded-full border border-white/70 px-4 py-2 font-medium text-white transition hover:bg-white/10"
            onClick={() => signOut({ callbackUrl: "/", redirect: true })}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </header>
  );
}
