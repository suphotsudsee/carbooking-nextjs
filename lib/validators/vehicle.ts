import { z } from "zod";

export const vehicleSchema = z.object({
  license_plate: z.string().min(1),
  brand_model: z.string().min(1),
  vehicle_type: z.string().min(1),
  capacity: z.number().int().positive(),
  status: z.enum(["available", "in_use", "maintenance"]).optional(),
  assigned_driver_id: z.number().int().positive().optional().nullable(),
});

