import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/navigation/Navbar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  const { fullName, role } = session.user;
  if (!fullName || !role) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar fullName={fullName} role={role} />
      {children}
    </div>
  );
}
