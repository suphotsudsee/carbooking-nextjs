import { NextResponse } from "next/server";
import { requireUser, forbid } from "@/lib/auth/helpers";
import { vehicleSchema } from "@/lib/validators/vehicle";
import { deleteVehicle, findVehicle, updateVehicle } from "@/lib/services/vehicles";

type Params = { params: Promise<{ id: string }> };

async function parseId(params: Params["params"]) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return { error: NextResponse.json({ message: "�,��,��,�,��,,�,3�,,�,-�1,�,��1^�,-�,1�,?�,\u0007�1%�,-�,�" }, { status: 400 }) };
  }
  return { id: numericId };
}

export async function GET(_: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const parsed = await parseId(ctx.params);
  if ("error" in parsed) return parsed.error;

  const vehicle = await findVehicle(parsed.id);
  if (!vehicle) return NextResponse.json({ message: "�1,�,��1^�,z�,s�,��,-" }, { status: 404 });
  return NextResponse.json(vehicle);
}

export async function PATCH(request: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const parsedId = await parseId(ctx.params);
  if ("error" in parsedId) return parsedId.error;

  const json = await request.json();
  const parsed = vehicleSchema.partial().safeParse({
    ...json,
    capacity: json.capacity ? Number(json.capacity) : json.capacity,
    assigned_driver_id: json.assigned_driver_id ? Number(json.assigned_driver_id) : json.assigned_driver_id,
  });
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 422 });
  }

  const payload = parsed.data;
  const updated = await updateVehicle(parsedId.id, {
    licensePlate: payload.license_plate,
    brandModel: payload.brand_model,
    vehicleType: payload.vehicle_type,
    capacity: payload.capacity,
    status: payload.status,
    assignedDriverId: payload.assigned_driver_id ?? undefined,
  });

  if (!updated) return NextResponse.json({ message: "�1,�,��1^�,z�,s�,��,-" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, ctx: Params) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const parsedId = await parseId(ctx.params);
  if ("error" in parsedId) return parsedId.error;

  await deleteVehicle(parsedId.id);
  return NextResponse.json({ message: "�,��,s�,��,3�1?�,��1؅,^" });
}
