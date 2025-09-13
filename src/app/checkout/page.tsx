"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

function loadPayPal(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Window not available"));
    if ((window as any).paypal) return resolve();
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD`; // live mode uses same URL
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const search = useSearchParams();
  const itemId = search.get("id");
  const minStr = search.get("min") ?? "0";
  const qsName = search.get("name") ?? "Digital Resource";
  const qsType = search.get("type") ?? "document";

  const min = useMemo(() => {
    const n = Number(minStr?.toString().replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? Math.max(0.01, Math.round(n * 100) / 100) : 0.01;
  }, [minStr]);

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(min.toFixed(2));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const paypalButtonsRef = useRef<HTMLDivElement | null>(null);

  const [item, setItem] = useState<any>(null);
  const [itemLoading, setItemLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadItem() {
      if (!itemId) { setItemLoading(false); return; }
      try {
        const resp = await fetch(`/api/library-items/${itemId}`);
        const json = await resp.json();
        if (resp.ok) {
          setItem(json);
        }
      } catch { /* ignore */ }
      finally { setItemLoading(false); }
    }
    loadItem();
  }, [itemId]);

  const itemName = item?.title || qsName;
  const itemType = item?.fileType || qsType;

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string | undefined;

  useEffect(() => {
    // Render PayPal buttons when SDK loaded and form is valid
    async function renderButtons() {
      if (!clientId) return; // show notice below
      if (!paypalButtonsRef.current) return;
      const valid = validate();
      if (!valid) return;

      try {
        await loadPayPal(clientId);
        const paypal = (window as any).paypal;
        if (!paypal) return;
        // Clean previous buttons
        paypalButtonsRef.current.innerHTML = "";
        paypal.Buttons({
          createOrder: async () => {
            // call our Next.js proxy to create order on backend
            const origin = window.location.origin;
            const resp = await fetch("/api/payments/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                itemId: itemId ? Number(itemId) : undefined,
                itemName,
                itemType,
                amount: Number(amount),
                currency: "USD",
                returnUrl: `${origin}/checkout/success`,
                cancelUrl: `${origin}/checkout/cancel`,
                customerEmail: email,
                description: `Purchase of ${itemName}`,
                category: itemType,
                fileType: itemType,
              }),
            });
            const data = await resp.json();
            if (!resp.ok) {
              throw new Error(data?.error || "Failed to create PayPal order");
            }
            return data?.orderId || data?.id || data?.result?.id; // be lenient with field names
          },
          onApprove: async (data: any) => {
            const orderId = data?.orderID || data?.orderId || data?.id;
            if (!orderId) {
              setError("Missing order ID after approval");
              return;
            }
            const resp = await fetch(`/api/payments/capture/${orderId}`, { method: "POST" });
            const payload = await resp.json().catch(() => ({}));
            if (!resp.ok) {
              setError(payload?.error || "Payment capture failed");
              return;
            }
            router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
          },
          onCancel: () => {
            router.push("/checkout/cancel");
          },
          onError: (err: any) => {
            console.error("PayPal error", err);
            setError("A PayPal error occurred. Please try again.");
          },
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
        }).render(paypalButtonsRef.current);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to initialize PayPal");
      }
    }

    renderButtons();
    // Re-render if amount/email changes and still valid
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, amount, email, itemId, itemName, itemType]);

  function validate() {
    setError(null);
    if (!itemId) {
      setError("Missing item id");
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n < min) {
      setError(`Amount must be at least $${min.toFixed(2)}`);
      return false;
    }
    return true;
  }

  const handlePayClick = async () => {
    // Re-render buttons to ensure latest amount/email
    setLoading(true);
    try {
      const ok = validate();
      if (!ok) return;
      // Buttons will re-render via dependency changes
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {!clientId && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700">
            PayPal Client ID is not configured. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Item card */}
          <Card className="md:col-span-3 overflow-hidden">
            <CardContent className="p-0">
              {item?.thumbnail ? (
                <div className="relative h-48 w-full bg-muted/40">
                  <img src={item.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              ) : (
                <div className="h-48 w-full bg-muted/40" />
              )}
              <div className="p-5">
                <div className="text-2xl font-semibold">{itemName}</div>
                <div className="mt-1 text-sm text-muted-foreground capitalize">{itemType}</div>
                {item?.description && (
                  <p className="text-sm mt-3 text-muted-foreground leading-relaxed">{item.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment card */}
          <Card className="md:col-span-2">
            <CardContent className="p-5 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={min}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum: ${min.toFixed(2)} — You can pay more to support.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded bg-red-50 text-red-700">{error}</div>
              )}

              <div className="flex items-center gap-3">
                <Button disabled={loading} onClick={handlePayClick}>Update</Button>
              </div>

              <div className="mt-2" ref={paypalButtonsRef} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
