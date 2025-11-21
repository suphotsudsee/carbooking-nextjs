import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { requireUser, forbid } from "@/lib/auth/helpers";
import { userCreateSchema } from "@/lib/validators/user";
import { createUser, findByUsername, listPublicUsers } from "@/lib/services/users";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const data = await listPublicUsers();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const json = await request.json();
  const parsed = userCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 422 });
  }

  const payload = parsed.data;
  const existing = await findByUsername(payload.username);
  if (existing) {
    return NextResponse.json({ message: "มีชื่อผู้ใช้นี้แล้ว" }, { status: 409 });
  }

  const userRecord = await createUser({
    username: payload.username,
    password: await hash(payload.password, 10),
    fullName: payload.full_name,
    role: payload.role,
    department: payload.department ?? null,
    position: payload.position ?? null,
    status: payload.status ?? "active",
  });

  return NextResponse.json(userRecord, { status: 201 });
}
