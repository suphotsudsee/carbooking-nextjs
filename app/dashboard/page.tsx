import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard/data";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { TabSwitcher } from "@/components/dashboard/TabSwitcher";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.role === "admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SummaryCards summary={data.summary} />
      <div className="mt-6">
        <TabSwitcher
          bookings={data.bookings}
          vehicles={data.vehicles}
          drivers={data.drivers}
          users={data.users}
          canViewUsers={session.user.role === "admin"}
          canCreateBooking={session.user.role === "user"}
          canApprove={session.user.role !== "user"}
        />
      </div>
    </div>
  );
}
