import { z } from "zod";

export const createReservationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().regex(/^\d{2}:00$/, "Time must be on the hour (e.g. 10:00)"),
  duration: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, "Duration must be at least 1 hour"),
  status: z.enum(["pending", "confirmed"]).default("confirmed"),
  decorId: z.string().optional(),
  themeId: z.string().optional(),
  customTheme: z.string().optional(),
  podcastDescription: z.string().optional(),
  packOfferId: z.string().optional(),
  supplementIds: z.array(z.string()).optional(),
  assignedAdminId: z.string().optional(),
  notes: z.string().optional(),
  answers: z.record(z.string(), z.string()).optional(), // questionId -> answerText
});

export type CreateReservationFormValues = z.infer<typeof createReservationSchema>;
