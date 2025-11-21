import { z } from "zod";

export const userCreateSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  full_name: z.string().min(1),
  role: z.enum(["admin", "approver", "user"]),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const userUpdateSchema = z.object({
  username: z.string().min(1).optional(),
  password: z.string().optional(),
  full_name: z.string().min(1).optional(),
  role: z.enum(["admin", "approver", "user"]).optional(),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});
