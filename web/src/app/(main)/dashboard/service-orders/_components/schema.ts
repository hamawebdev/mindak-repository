import { z } from "zod";

import type { ServiceReservationListItem } from "@/types/admin-api";

// Schema matching the API response structure
export const serviceReservationSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  confirmationId: z.string(),
  serviceIds: z.array(z.string()),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  submittedAt: z.string(),
});

export type ServiceReservation = z.infer<typeof serviceReservationSchema>;

// Re-export the API type for consistency
export type { ServiceReservationListItem };

