import { buildCalendar } from "@/lib/calendar";
import { CalendarGrid } from "@/components/public-calendar/CalendarGrid";
import { getSession } from "@/lib/auth/session";

const THAI_DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function PublicCalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();
  const month = Number(params?.month);
  const year = Number(params?.year);
  const calendar = await buildCalendar(month, year);

  return <CalendarGrid {...calendar} thaiDays={THAI_DAYS} canBook={session?.user?.role === "user"} />;
}
