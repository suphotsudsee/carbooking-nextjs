import { z } from "zod";

export const bookingCreateSchema = z.object({
  vehicle_id: z.number().int().positive(),
  driver_id: z.number().int().positive().optional().nullable(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  destination: z.string().min(1),
  purpose: z.string().min(1),
  passenger_count: z.number().int().positive(),
  notes: z.string().optional().nullable(),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "completed", "cancelled"]).optional(),
  driver_id: z.number().int().positive().optional().nullable(),
  start_datetime: z.string().optional(),
  end_datetime: z.string().optional(),
  destination: z.string().optional(),
  purpose: z.string().optional(),
  passenger_count: z.number().int().positive().optional(),
  notes: z.string().optional().nullable(),
});
