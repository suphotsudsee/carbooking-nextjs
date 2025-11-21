import { NextResponse } from "next/server";
import { requireUser, forbid } from "@/lib/auth/helpers";
import { driverSchema } from "@/lib/validators/driver";
import { deleteDriver, findDriver, updateDriver } from "@/lib/services/drivers";

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
  const driver = await findDriver(parsed.id);
  if (!driver) return NextResponse.json({ message: "ไม่พบบันทึก" }, { status: 404 });
  return NextResponse.json(driver);
}

export async function PATCH(request: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const parsed = await parseId(ctx.params);
  if ("error" in parsed) return parsed.error;

  const json = await request.json();
  const parsedBody = driverSchema.partial().safeParse({
    ...json,
    experience_years: json.experience_years ? Number(json.experience_years) : json.experience_years,
  });
  if (!parsedBody.success) {
    return NextResponse.json({ message: parsedBody.error.message }, { status: 422 });
  }

  const payload = parsedBody.data;
  const updated = await updateDriver(parsed.id, {
    name: payload.name,
    phone: payload.phone,
    licenseNo: payload.license_no,
    experienceYears: payload.experience_years,
    status: payload.status,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const parsed = await parseId(ctx.params);
  if ("error" in parsed) return parsed.error;

  await deleteDriver(parsed.id);
  return NextResponse.json({ message: "ลบสำเร็จ" });
}
