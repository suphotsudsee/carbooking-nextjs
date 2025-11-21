/* Client calendar grid with modal detail */
"use client";

import { useMemo, useState } from "react";
import type { CalendarBadge, CalendarData, CalendarEvent } from "@/lib/calendar";
import Link from "next/link";

type Props = CalendarData & {
  thaiDays: string[];
  canBook?: boolean;
};

export function CalendarGrid({ weeks, monthName, year, navigation, thaiDays, canBook }: Props) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const statusColor: Record<CalendarBadge, string> = useMemo(
    () => ({
      "badge-full": "bg-[#f4cf44] text-[#3c2b00]",
      "badge-morning": "bg-[#2e66d7] text-white",
      "badge-afternoon": "bg-[#4f9df5] text-white",
      "badge-pending": "bg-[#f9b1bc] text-[#8a2b3d]",
    }),
    []
  );

  return (
    <>
      <div className="rounded-2xl border border-[#d6d9e0] bg-white shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6d9e0] px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">
              ปฏิทินการใช้รถ {monthName} {year}
            </h1>
            <p className="text-sm text-slate-600">คลิกวันที่เพื่อดูรายละเอียดการจอง</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canBook ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-[#f4cf44] px-4 py-2 text-sm font-semibold text-[#3c2b00] shadow transition hover:bg-[#efc52c]"
              >
                จองรถ
              </Link>
            ) : null}
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link
                className="rounded-full border border-[#d6d9e0] px-3 py-1 text-[#2e66d7] hover:bg-[#eff3fc]"
                href={`/?month=${navigation.prev.month}&year=${navigation.prev.year}`}
              >
                &lt; เดือนก่อนหน้า
              </Link>
              <Link
                className="rounded-full border border-[#d6d9e0] px-3 py-1 text-[#2e66d7] hover:bg-[#eff3fc]"
                href={`/?month=${navigation.next.month}&year=${navigation.next.year}`}
              >
                เดือนถัดไป &gt;
              </Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-[#d6d9e0] bg-[#0a7bf2] text-center text-sm font-semibold text-white">
          {thaiDays.map((day) => (
            <div key={day} className="px-2 py-3">
              {day}
            </div>
          ))}
        </div>
        <div className="divide-y divide-[#d6d9e0]">
          {weeks.map((week, idx) => (
            <div key={idx} className="grid grid-cols-7">
              {week.map((day, jdx) =>
                day ? (
                  <button
                    key={`${idx}-${jdx}`}
                    className={`min-h-[120px] border-r border-[#d6d9e0] px-3 py-3 text-left transition ${
                      day.is_today ? "bg-[#e5c400] text-slate-900" : "hover:bg-[#f7f8fb]"
                    }`}
                    onClick={() => day.events[0] && setSelected(day.events[0])}
                    disabled={!day.events.length}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span>{day.day}</span>
                      {day.is_today && <span className="text-xs text-[#8a6b00]">วันนี้</span>}
                    </div>
                    <div className="mt-2 space-y-1">
                      {day.events.map((event, i) => (
                        <div
                          key={i}
                          className={`rounded-md px-2 py-1 text-xs font-medium ${statusColor[event.badge] || "bg-slate-200 text-slate-800"}`}
                        >
                          <div className="truncate">{event.title}</div>
                          <div className="truncate text-[11px] opacity-80">
                            {event.time_label}
                            {event.vehicle ? ` • ${event.vehicle}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                ) : (
                  <div key={`${idx}-${jdx}`} className="min-h-[120px] border-r border-[#d6d9e0] bg-white"></div>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">{selected.status_label}</div>
                <h2 className="text-xl font-semibold text-slate-900">{selected.title}</h2>
                <p className="text-sm text-slate-600">{selected.purpose}</p>
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setSelected(null)}
              >
                ปิด
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <Row label="เวลา" value={formatDate(selected.start_datetime, selected.end_datetime)} />
              <Row label="รถ" value={selected.vehicle || "-"} />
              <Row label="ผู้ขอใช้" value={selected.requester || "-"} />
              <Row label="คนขับ" value={selected.driver || "-"} />
              <Row label="ปลายทาง" value={selected.destination || "-"} />
              <Row label="วัตถุประสงค์" value={selected.purpose || "-"} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

function formatDate(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  try {
    return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
  } catch {
    return start;
  }
}
