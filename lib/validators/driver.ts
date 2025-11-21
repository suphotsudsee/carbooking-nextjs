import { z } from "zod";

export const driverSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  license_no: z.string().min(1),
  experience_years: z.number().int().nonnegative().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
