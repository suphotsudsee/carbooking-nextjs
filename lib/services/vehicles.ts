import { prisma } from "@/db/client";
import { Prisma } from "@prisma/client";

export async function listVehicles() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedDriver: true },
  });
  return vehicles.map((v) => ({
    ...v,
    driver_name: v.assignedDriver?.name ?? null,
    driver_phone: v.assignedDriver?.phone ?? null,
  }));
}

export async function findVehicle(id: number) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { assignedDriver: true },
  });
  return vehicle
    ? {
        ...vehicle,
        driver_name: vehicle.assignedDriver?.name ?? null,
        driver_phone: vehicle.assignedDriver?.phone ?? null,
      }
    : null;
}

export async function createVehicle(data: Prisma.VehicleUncheckedCreateInput) {
  const created = await prisma.vehicle.create({ data });
  return findVehicle(created.id);
}

export async function updateVehicle(id: number, data: Prisma.VehicleUncheckedUpdateInput) {
  await prisma.vehicle.update({ where: { id }, data });
  return findVehicle(id);
}

export async function deleteVehicle(id: number) {
  await prisma.vehicle.delete({ where: { id } });
}
