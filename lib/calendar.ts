import { listBookingsForMonth } from "@/lib/services/bookings";

export type CalendarBadge = "badge-full" | "badge-morning" | "badge-afternoon" | "badge-pending";

export type CalendarEvent = {
  title: string;
  subtitle: string | null;
  vehicle: string | null;
  status: string;
  status_label: string;
  time_label: string;
  badge: CalendarBadge;
  start_datetime: string;
  end_datetime: string;
  requester: string | null;
  driver: string | null;
  purpose: string | null;
  destination: string | null;
};

export type CalendarDay = {
  day: number;
  date: string;
  events: CalendarEvent[];
  is_today: boolean;
};

export type CalendarData = {
  weeks: (CalendarDay | null)[][];
  monthName: string;
  year: number;
  navigation: {
    prev: { month: number; year: number };
    next: { month: number; year: number };
  };
};

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export async function buildCalendar(monthParam?: number, yearParam?: number): Promise<CalendarData> {
  const today = new Date();
  const month = monthParam && monthParam >= 1 && monthParam <= 12 ? monthParam : today.getMonth() + 1;
  const year = yearParam && yearParam >= 2000 ? yearParam : today.getFullYear();

  const bookings = await listBookingsForMonth(month, year);
  const monthStart = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  const eventsByDay: CalendarEvent[][] = Array.from({ length: daysInMonth + 1 }, () => []);

  bookings.forEach((booking) => {
    const start = new Date(booking.startDatetime);
    const end = new Date(booking.endDatetime);
    const loopStart = start < monthStart ? monthStart : start;
    const loopEnd = end > new Date(year, month, 0, 23, 59, 59) ? new Date(year, month, 0, 23, 59, 59) : end;

    for (let date = new Date(loopStart); date <= loopEnd; date.setDate(date.getDate() + 1)) {
      const dayIndex = date.getDate();
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const slotStart = start > dayStart ? start : dayStart;
      const slotEnd = end < dayEnd ? end : dayEnd;

      eventsByDay[dayIndex].push({
        title: booking.destination || booking.purpose || "การจอง",
        subtitle: booking.purpose || booking.requester_name || null,
        vehicle: booking.license_plate,
        status: booking.status,
        status_label: statusText(booking.status),
        time_label: describeTimeslot(slotStart, slotEnd),
        badge: resolveBadge(booking.status, slotStart, slotEnd),
        start_datetime: booking.startDatetime.toISOString(),
        end_datetime: booking.endDatetime.toISOString(),
        requester: booking.requester_name,
        driver: booking.driver_name,
        purpose: booking.purpose,
        destination: booking.destination,
      });
    }
  });

  const weeks: (CalendarDay | null)[][] = [];
  let week: (CalendarDay | null)[] = [];
  const firstWeekday = monthStart.getDay(); // 0 Sunday

  for (let i = 0; i < firstWeekday; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push({
      day,
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      events: eventsByDay[day],
      is_today: isToday(year, month, day),
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const navCurrent = new Date(year, month - 1, 1);
  const prev = new Date(navCurrent);
  prev.setMonth(prev.getMonth() - 1);
  const next = new Date(navCurrent);
  next.setMonth(next.getMonth() + 1);

  return {
    weeks,
    monthName: THAI_MONTHS[month - 1],
    year: year + 543, // Thai year display
    navigation: {
      prev: { month: prev.getMonth() + 1, year: prev.getFullYear() },
      next: { month: next.getMonth() + 1, year: next.getFullYear() },
    },
  };
}

function isToday(year: number, month: number, day: number) {
  const now = new Date();
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  );
}

function describeTimeslot(start: Date, end: Date) {
  const startHour = start.getHours();
  const endHour = end.getHours();
  if (startHour <= 8 && endHour >= 16) return "เต็มวัน";
  if (endHour <= 12) return "ครึ่งวันเช้า";
  if (startHour >= 12) return "ครึ่งวันบ่าย";
  return "ช่วงเวลา";
}

function resolveBadge(status: string, start: Date, end: Date): CalendarBadge {
  if (status !== "approved") return "badge-pending";
  const startHour = start.getHours();
  const endHour = end.getHours();
  if (startHour <= 8 && endHour >= 16) return "badge-full";
  if (endHour <= 12) return "badge-morning";
  if (startHour >= 12) return "badge-afternoon";
  return "badge-full";
}

function statusText(status: string) {
  switch (status) {
    case "pending":
      return "รออนุมัติ";
    case "approved":
      return "อนุมัติแล้ว";
    case "rejected":
      return "ถูกปฏิเสธ";
    case "completed":
      return "เสร็จสิ้น";
    case "cancelled":
      return "ยกเลิก";
    default:
      return status;
  }
}
