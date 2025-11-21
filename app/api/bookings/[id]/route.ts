import { NextResponse } from "next/server";
import { requireUser, forbid } from "@/lib/auth/helpers";
import { bookingUpdateSchema } from "@/lib/validators/booking";
import { deleteBooking, findBooking, updateBooking } from "@/lib/services/bookings";

type Params = { params: Promise<{ id: string }> };

async function parseId(params: Params["params"]) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return { error: NextResponse.json({ message: "รหัสคำขอไม่ถูกต้อง" }, { status: 400 }) };
  }
  return { id: numericId };
}

export async function GET(_: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const parsed = await parseId(ctx.params);
  if ("error" in parsed) return parsed.error;

  const booking = await findBooking(parsed.id);
  if (!booking) return NextResponse.json({ message: "ไม่พบการจอง" }, { status: 404 });
  return NextResponse.json(booking);
}

export async function PATCH(request: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const parsed = await parseId(ctx.params);
  if ("error" in parsed) return parsed.error;
  const id = parsed.id;

  const existing = await findBooking(id);
  if (!existing) return NextResponse.json({ message: "ไม่พบการจอง" }, { status: 404 });

  const json = await request.json();
  const parsedBody = bookingUpdateSchema.safeParse({
    ...json,
    driver_id: json.driver_id ? Number(json.driver_id) : json.driver_id,
    passenger_count: json.passenger_count ? Number(json.passenger_count) : json.passenger_count,
  });
  if (!parsedBody.success) {
    return NextResponse.json({ message: parsedBody.error.message }, { status: 422 });
  }
  const payload = parsedBody.data;

  const statusChange = payload.status && ["approved", "rejected", "completed"].includes(payload.status);
  if (statusChange && user.role !== "admin" && user.role !== "approver") {
    return forbid();
  }

  const result = await updateBooking(id, {
    driverId: payload.driver_id ?? undefined,
    startDatetime: payload.start_datetime ? new Date(payload.start_datetime) : undefined,
    endDatetime: payload.end_datetime ? new Date(payload.end_datetime) : undefined,
    destination: payload.destination,
    purpose: payload.purpose,
    passengerCount: payload.passenger_count,
    notes: payload.notes ?? undefined,
    status: payload.status,
    approvedBy: statusChange ? user.id : undefined,
    approvedAt: statusChange ? new Date() : undefined,
  });

  return NextResponse.json(result);
}

export async function DELETE(_: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const parsed = await parseId(ctx.params);
  if ("error" in parsed) return parsed.error;

  await deleteBooking(parsed.id);
  return NextResponse.json({ message: "ลบสำเร็จ" });
}
