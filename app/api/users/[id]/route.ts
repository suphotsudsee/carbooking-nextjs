import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { requireUser, forbid } from "@/lib/auth/helpers";
import { userUpdateSchema } from "@/lib/validators/user";
import { deleteUser, findByUsername, findPublicUser, updateUser } from "@/lib/services/users";

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
  if (user.role !== "admin") return forbid();

  const parsed = await parseId(ctx.params);
  if ("error" in parsed) return parsed.error;

  const record = await findPublicUser(parsed.id);
  if (!record) return NextResponse.json({ message: "ไม่พบผู้ใช้งาน" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(request: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const parsedParams = await parseId(ctx.params);
  if ("error" in parsedParams) return parsedParams.error;
  const id = parsedParams.id;

  const json = await request.json();
  const parsedBody = userUpdateSchema.safeParse(json);
  if (!parsedBody.success) {
    return NextResponse.json({ message: parsedBody.error.message }, { status: 422 });
  }
  const payload = parsedBody.data;

  if (payload.username) {
    const existing = await findByUsername(payload.username);
    if (existing && existing.id !== id) {
      return NextResponse.json({ message: "ชื่อผู้ใช้งานถูกใช้แล้ว" }, { status: 409 });
    }
  }

  const result = await updateUser(id, {
    username: payload.username,
    password: payload.password ? await hash(payload.password, 10) : undefined,
    fullName: payload.full_name,
    role: payload.role,
    department: payload.department ?? undefined,
    position: payload.position ?? undefined,
    status: payload.status,
  });

  return NextResponse.json(result);
}

export async function DELETE(_: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const parsed = await parseId(ctx.params);
  if ("error" in parsed) return parsed.error;
  const id = parsed.id;

  if (id === user.id) {
    return NextResponse.json({ message: "ไม่สามารถลบบัญชีของตนเองได้" }, { status: 422 });
  }

  await deleteUser(id);
  return NextResponse.json({ message: "ลบสำเร็จ" });
}
