"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const search = useSearchParams();
  const orderId = search.get("orderId");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      try {
        const resp = await fetch(`/api/payments/order/${orderId}`);
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error || "Failed to load order");
        setData(json);
      } catch (e: any) {
        setError(e?.message || "Failed to load order details");
      }
    }
    load();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Thank you for your purchase!</h1>
        {error && <div className="p-3 rounded bg-red-50 text-red-700 mb-4">{error}</div>}
        {!orderId && (
          <div className="p-3 rounded bg-yellow-50 text-yellow-800">Missing order ID.</div>
        )}
        {orderId && !data && !error && (
          <div>Loading receipt...</div>
        )}
        {data && (
          <div className="bg-white rounded-xl p-5 shadow space-y-2">
            <div><strong>Order ID:</strong> {orderId}</div>
            {/* Attempt common fields; backend format may vary */}
            {data?.status && <div><strong>Status:</strong> {String(data.status)}</div>}
            {data?.purchase_units?.[0]?.payments?.captures?.[0]?.id && (
              <div><strong>Capture ID:</strong> {data.purchase_units[0].payments.captures[0].id}</div>
            )}
            {data?.payer?.email_address && (
              <div><strong>Payer Email:</strong> {data.payer.email_address}</div>
            )}
            {data?.purchase_units?.[0]?.amount?.value && (
              <div>
                <strong>Amount:</strong> ${data.purchase_units[0].amount.value} {data.purchase_units[0].amount.currency_code || "USD"}
              </div>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              A confirmation has been recorded. You may close this page.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
