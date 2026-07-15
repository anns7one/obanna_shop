"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { OrderDetail } from "@/components/account/OrderDetail";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <Suspense fallback={null}>
      <OrderDetail orderId={params.id} />
    </Suspense>
  );
}
