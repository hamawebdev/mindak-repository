import { OrderDetailsView } from "../_components/order-details-view";

interface OrderDetailsPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { orderId } = await params;

  return <OrderDetailsView reservationId={orderId} />;
}

