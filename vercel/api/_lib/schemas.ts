import { z } from "zod";

export const zEnrollPayload = z.object({
  intake: z.record(z.unknown()).default({}),
  consent: z.record(z.unknown()).default({}),
  booking: z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
      time: z.string().min(1, "Time is required"),
    })
    .passthrough(),
});

export const zCredentials = z.object({
  email: z.string().email("Invalid email").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  name: z.string().max(200).optional(),
});

export const zReschedule = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().min(1, "Time is required"),
});

export const zIntakeUpdate = z.object({
  intake: z.record(z.unknown()),
});
