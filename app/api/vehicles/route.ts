import { NextResponse } from "next/server";
import { requireUser, forbid } from "@/lib/auth/helpers";
import { vehicleSchema } from "@/lib/validators/vehicle";
import { createVehicle, listVehicles } from "@/lib/services/vehicles";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;
  const data = await listVehicles();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;
  if (user.role !== "admin") return forbid();

  const json = await request.json();
  const parsed = vehicleSchema.safeParse({
    ...json,
    capacity: json.capacity ? Number(json.capacity) : json.capacity,
    assigned_driver_id: json.assigned_driver_id ? Number(json.assigned_driver_id) : json.assigned_driver_id,
  });
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 422 });
  }

  const payload = parsed.data;
  const vehicle = await createVehicle({
    licensePlate: payload.license_plate,
    brandModel: payload.brand_model,
    vehicleType: payload.vehicle_type,
    capacity: payload.capacity,
    status: payload.status ?? "available",
    assignedDriverId: payload.assigned_driver_id ?? null,
  });

  return NextResponse.json(vehicle, { status: 201 });
}
