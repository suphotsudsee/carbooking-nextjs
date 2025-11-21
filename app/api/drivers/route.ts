import { NextResponse } from "next/server";
import { requireUser, forbid } from "@/lib/auth/helpers";
import { driverSchema } from "@/lib/validators/driver";
import { createDriver, listDrivers } from "@/lib/services/drivers";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  const data = await listDrivers();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const json = await request.json();
  const parsed = driverSchema.safeParse({
    ...json,
    experience_years: json.experience_years ? Number(json.experience_years) : json.experience_years,
  });
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 422 });
  }

  const payload = parsed.data;
  const driver = await createDriver({
    name: payload.name,
    phone: payload.phone,
    licenseNo: payload.license_no,
    experienceYears: payload.experience_years ?? 0,
    status: payload.status ?? "active",
  });

  return NextResponse.json(driver, { status: 201 });
}
