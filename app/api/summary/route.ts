import { NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { requireUser } from "@/lib/auth/helpers";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const [
    totalBookings,
    pendingBookings,
    approvedBookings,
    activeBookings,
    availableVehicles,
    inUseVehicles,
    maintenanceVehicles,
    activeDrivers,
    pendingUsers,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.booking.count({ where: { status: "approved" } }),
    prisma.booking.count({
      where: { status: "approved", endDatetime: { gte: new Date() } },
    }),
    prisma.vehicle.count({ where: { status: "available" } }),
    prisma.vehicle.count({ where: { status: "in_use" } }),
    prisma.vehicle.count({ where: { status: "maintenance" } }),
    prisma.driver.count({ where: { status: "active" } }),
    prisma.user.count({ where: { status: "inactive" } }),
  ]);

  return NextResponse.json({
    total_bookings: totalBookings,
    pending_bookings: pendingBookings,
    approved_bookings: approvedBookings,
    active_bookings: activeBookings,
    available_vehicles: availableVehicles,
    inuse_vehicles: inUseVehicles,
    maintenance_vehicles: maintenanceVehicles,
    active_drivers: activeDrivers,
    pending_users: pendingUsers,
  });
}
