import { prisma } from "@/db/client";
import { Prisma } from "@prisma/client";

export async function listBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: { startDatetime: "desc" },
    include: includeBooking,
  });
  return bookings.map(mapBooking);
}

export async function listBookingsForMonth(month: number, year: number) {
  const safeMonth = Math.min(12, Math.max(1, month));
  const safeYear = year;
  const monthStart = new Date(Date.UTC(safeYear, safeMonth - 1, 1, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(safeYear, safeMonth, 0, 23, 59, 59));

  const bookings = await prisma.booking.findMany({
    where: {
      startDatetime: { lte: monthEnd },
      endDatetime: { gte: monthStart },
    },
    orderBy: { startDatetime: "asc" },
    include: includeBooking,
  });
  return bookings.map(mapBooking);
}

export async function findBooking(id: number) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: includeBooking,
  });
  return booking ? mapBooking(booking) : null;
}

export async function createBooking(data: Prisma.BookingUncheckedCreateInput) {
  const created = await prisma.booking.create({ data });
  return findBooking(created.id);
}

export async function updateBooking(id: number, data: Prisma.BookingUncheckedUpdateInput) {
  await prisma.booking.update({ where: { id }, data });
  return findBooking(id);
}

export async function deleteBooking(id: number) {
  await prisma.booking.delete({ where: { id } });
}

export async function generateCode() {
  // mimic BK yymmddHHMMSS
  const stamp = new Date();
  const code = `BK${stamp
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(2, 14)}`;
  return code;
}

const includeBooking = {
  vehicle: true,
  driver: true,
  requester: true,
  approver: true,
} satisfies Prisma.BookingInclude;

function mapBooking(booking: Prisma.BookingGetPayload<{ include: typeof includeBooking }>) {
  return {
    ...booking,
    license_plate: booking.vehicle?.licensePlate ?? null,
    brand_model: booking.vehicle?.brandModel ?? null,
    driver_name: booking.driver?.name ?? null,
    requester_name: booking.requester?.fullName ?? null,
    requester_department: booking.requester?.department ?? null,
    requester_position: booking.requester?.position ?? null,
    approver_name: booking.approver?.fullName ?? null,
  };
}
