import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="bg-[#0a7bf2] text-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-semibold">
          ระบบจองรถ สำนักงานสารธารณสุขจังหวัดอุบลราชธานี
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-white/70 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </header>
  );
}
