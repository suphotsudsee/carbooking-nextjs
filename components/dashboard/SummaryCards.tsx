import type { Summary } from "@/lib/dashboard/data";

type Props = {
  summary: Summary;
};

const cards = [
  { key: "total_bookings", label: "การจองทั้งหมด", color: "bg-[#1e88e5]" },
  { key: "pending_bookings", label: "รออนุมัติ", color: "bg-[#f5b62f]" },
  { key: "available_vehicles", label: "รถพร้อมใช้งาน", color: "bg-[#15a05c]" },
  { key: "active_drivers", label: "คนขับพร้อม", color: "bg-[#7c3aed]" },
] as const;

export function SummaryCards({ summary }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`rounded-xl ${card.color} p-5 text-white shadow-md`}
        >
          <p className="text-sm text-white/80">{card.label}</p>
          <div className="mt-2 text-3xl font-semibold leading-none">
            {summary[card.key as keyof Summary] ?? 0}
          </div>
          <p className="mt-1 text-xs text-white/70">งานรวม</p>
        </div>
      ))}
    </section>
  );
}
