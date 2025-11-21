import { prisma } from "@/db/client";
import { Prisma } from "@prisma/client";

export async function listDrivers() {
  return prisma.driver.findMany({ orderBy: { createdAt: "desc" } });
}

export async function findDriver(id: number) {
  return prisma.driver.findUnique({ where: { id } });
}

export async function createDriver(data: Prisma.DriverUncheckedCreateInput) {
  const created = await prisma.driver.create({ data });
  return findDriver(created.id);
}

export async function updateDriver(id: number, data: Prisma.DriverUncheckedUpdateInput) {
  await prisma.driver.update({ where: { id }, data });
  return findDriver(id);
}

export async function deleteDriver(id: number) {
  await prisma.driver.delete({ where: { id } });
}
