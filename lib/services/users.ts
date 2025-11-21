import { prisma } from "@/db/client";
import { Prisma } from "@prisma/client";

export async function listPublicUsers() {
  return prisma.user.findMany({
    select: publicFields,
    orderBy: { createdAt: "desc" },
  });
}

export async function findPublicUser(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: publicFields,
  });
}

export async function findByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function createUser(data: Prisma.UserCreateInput) {
  const created = await prisma.user.create({ data });
  return findPublicUser(created.id);
}

export async function updateUser(id: number, data: Prisma.UserUpdateInput) {
  await prisma.user.update({ where: { id }, data });
  return findPublicUser(id);
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
}

const publicFields = {
  id: true,
  username: true,
  fullName: true,
  role: true,
  department: true,
  position: true,
  status: true,
  createdAt: true,
} satisfies Record<string, boolean>;
