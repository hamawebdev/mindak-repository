import { PodcastReservationForm } from "@/components/agency/podcast-reservation-form";
import { PodcastLayout } from "@/components/agency/podcast-layout";

export default function PodcastPage() {
  return (
    <PodcastLayout>
      <PodcastReservationForm />
    </PodcastLayout>
  );
}
