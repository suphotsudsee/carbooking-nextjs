import { prisma } from "@/db/client";
import { listBookings } from "@/lib/services/bookings";
import { listDrivers } from "@/lib/services/drivers";
import { listVehicles } from "@/lib/services/vehicles";
import { listPublicUsers } from "@/lib/services/users";

export type Summary = {
  total_bookings: number;
  pending_bookings: number;
  approved_bookings: number;
  active_bookings: number;
  available_vehicles: number;
  inuse_vehicles: number;
  maintenance_vehicles: number;
  active_drivers: number;
  pending_users: number;
};

export async function getDashboardData(includeUsers: boolean) {
  const [summary, bookings, vehicles, drivers, users] = await Promise.all([
    getSummary(),
    listBookings(),
    listVehicles(),
    listDrivers(),
    includeUsers ? listPublicUsers() : Promise.resolve([]),
  ]);

  return {
    summary,
    bookings,
    vehicles,
    drivers,
    users,
  };
}

async function getSummary(): Promise<Summary> {
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

  return {
    total_bookings: totalBookings,
    pending_bookings: pendingBookings,
    approved_bookings: approvedBookings,
    active_bookings: activeBookings,
    available_vehicles: availableVehicles,
    inuse_vehicles: inUseVehicles,
    maintenance_vehicles: maintenanceVehicles,
    active_drivers: activeDrivers,
    pending_users: pendingUsers,
  };
}
