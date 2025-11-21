import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/helpers";
import { bookingCreateSchema } from "@/lib/validators/booking";
import { createBooking, generateCode, listBookings } from "@/lib/services/bookings";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const data = await listBookings();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const json = await request.json();
  const parsed = bookingCreateSchema.safeParse({
    ...json,
    vehicle_id: json.vehicle_id ? Number(json.vehicle_id) : json.vehicle_id,
    driver_id: json.driver_id ? Number(json.driver_id) : json.driver_id,
    passenger_count: json.passenger_count ? Number(json.passenger_count) : json.passenger_count,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 422 });
  }

  const payload = parsed.data;
  const booking = await createBooking({
    bookingCode: await generateCode(),
    vehicleId: payload.vehicle_id,
    driverId: payload.driver_id ?? null,
    requesterId: user.id,
    startDatetime: new Date(payload.start_datetime),
    endDatetime: new Date(payload.end_datetime),
    destination: payload.destination,
    purpose: payload.purpose,
    passengerCount: payload.passenger_count,
    status: "pending",
    notes: payload.notes ?? null,
  });

  if (!booking) {
    return NextResponse.json({ message: "ไม่สามารถสร้างการจองได้" }, { status: 500 });
  }

  return NextResponse.json(booking, { status: 201 });
}
