"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { convertByteDataToImageUrl, getFallbackImage } from "@/lib/image-utils";
import { ArrowLeft, Shield, CreditCard, Lock, CheckCircle, FileText, Headphones, Video, File } from "lucide-react";

function loadPayPal(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Window not available"));
    if ((window as any).paypal) return resolve();
    
    // Validate client ID format
    if (!clientId || clientId === "your-paypal-client-id-here") {
      return reject(new Error("Invalid PayPal Client ID. Please configure NEXT_PUBLIC_PAYPAL_CLIENT_ID in your .env.local file"));
    }
    
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD`;
    script.async = true;
    
    // Add timeout for network issues
    const timeout = setTimeout(() => {
      reject(new Error("PayPal SDK loading timed out. Please check your internet connection."));
    }, 30000); // 30 second timeout
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log("PayPal SDK loaded successfully");
      resolve();
    };
    
    script.onerror = (error) => {
      clearTimeout(timeout);
      console.error("PayPal SDK failed to load:", error);
      console.error("Script URL:", script.src);
      console.error("Client ID used:", clientId);
      reject(new Error(`Failed to load PayPal SDK. Please check your internet connection and PayPal Client ID configuration.`));
    };
    
    document.body.appendChild(script);
  });
}

function CheckoutContent() {
  const router = useRouter();
  const search = useSearchParams();
  const itemId = search.get("id");

  // State declarations first
  const [checkoutItem, setCheckoutItem] = useState<any>(null);
  const [item, setItem] = useState<any>(null);
  const [itemLoading, setItemLoading] = useState<boolean>(true);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const paypalButtonsRef = useRef<HTMLDivElement | null>(null);
  
  // Get item data from session storage (more secure than URL params)
  useEffect(() => {
    const storedData = sessionStorage.getItem('checkout-item');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        // Check if data is not too old (expire after 1 hour for security)
        const isExpired = Date.now() - data.timestamp > 60 * 60 * 1000;
        if (!isExpired && data.id === itemId) {
          setCheckoutItem(data);
        } else {
          // Clear expired or mismatched data
          sessionStorage.removeItem('checkout-item');
        }
      } catch (error) {
        console.error('Error parsing checkout data:', error);
        sessionStorage.removeItem('checkout-item');
      }
    }
  }, [itemId]);

  const min = useMemo(() => {
    // Use amount from session storage or fallback to API data
    const amount = checkoutItem?.amount || item?.amount || 0;
    // If amount is 0, item is free - don't force minimum
    if (amount === 0) return 0;
    // For paid items, ensure minimum of 0.01
    return Number.isFinite(amount) && amount > 0 ? Math.max(0.01, Math.round(amount * 100) / 100) : 0.01;
  }, [checkoutItem, item]);
  
  // Update amount when min changes (from session storage or API)
  useEffect(() => {
    setAmount(min.toFixed(2));
  }, [min]);

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

  const itemName = checkoutItem?.title || item?.title || "Digital Resource";
  const itemType = checkoutItem?.fileType || item?.fileType || "document";

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
            // Clear session storage after successful payment
            sessionStorage.removeItem('checkout-item');
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
      if (min === 0) {
        setError("Invalid amount for free item");
      } else {
        setError(`Amount must be at least $${min.toFixed(2)}`);
      }
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

  // File type icon helper
  function FileTypeIcon({ type }: { type?: string }) {
    const t = (type || "").toLowerCase();
    if (t.includes("pdf") || t.includes("doc") || t.includes("text")) {
      return <FileText className="h-5 w-5" />;
    }
    if (t.includes("audio") || t.includes("mp3") || t.includes("wav")) {
      return <Headphones className="h-5 w-5" />;
    }
    if (t.includes("video") || t.includes("mp4") || t.includes("mov")) {
      return <Video className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <p className="text-slate-600 mt-1">Complete your purchase securely with PayPal</p>
          </div>
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-xl">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">SSL Secured</span>
          </div>
        </div>

        {!clientId && (
          <div className="mb-6 p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="font-medium text-lg">PayPal Configuration Required</span>
            </div>
            <div className="space-y-3 text-sm">
              <p className="font-medium">To enable PayPal payments, please follow these steps:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Go to <a href="https://developer.paypal.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://developer.paypal.com/</a></li>
                <li>Create a PayPal Developer account or log in</li>
                <li>Create a new app to get your Client ID</li>
                <li>Copy <code className="bg-red-100 px-1 rounded">.env.example</code> to <code className="bg-red-100 px-1 rounded">.env.local</code></li>
                <li>Set <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-actual-client-id</code></li>
                <li>Restart your development server</li>
              </ol>
              <div className="mt-4 p-3 bg-red-100 rounded-xl">
                <p className="font-medium">⚠️ Current Status:</p>
                <p>NEXT_PUBLIC_PAYPAL_CLIENT_ID is not configured</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Item Details Card */}
          <Card className="lg:col-span-2 overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
            {/* Enhanced gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl p-[1px]">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl h-full w-full" />
            </div>
            
            <div className="relative z-10">
              <CardHeader className="p-0">
                {(checkoutItem?.thumbnail || item?.thumbnail) ? (
                  <div 
                    className="relative h-64 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden"
                    style={{
                      backgroundImage: `url(${convertByteDataToImageUrl(checkoutItem?.thumbnail || item?.thumbnail, getFallbackImage('library'))})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  >
                    {/* Modern gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                    
                    {/* Floating badges */}
                    <div className="absolute top-6 left-6">
                      {checkoutItem?.category && (
                        <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-2 text-sm font-medium">
                          {checkoutItem.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute top-6 right-6">
                      <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="text-primary">
                          <FileTypeIcon type={itemType} />
                        </div>
                      </div>
                    </div>
                    
                    {/* Price badge */}
                    <div className="absolute bottom-6 right-6">
                      <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/40">
                        <span className="text-lg font-bold text-slate-900">${min.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="h-64 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"
                    style={{
                      backgroundImage: `url(${getFallbackImage('library')})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  >
                    <div className="text-slate-400">
                      <FileTypeIcon type={itemType} />
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Title and rating */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-2">{itemName}</h2>
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="capitalize text-sm font-medium">{itemType}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {(checkoutItem?.description || item?.description) && (
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                      <p className="text-slate-700 leading-relaxed">
                        {checkoutItem?.description || item?.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Features/Benefits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Instant Download</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Secure Payment</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Payment Card */}
          <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl sticky top-6">
            {/* Enhanced gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-3xl p-[1px]">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl h-full w-full" />
            </div>
            
            <div className="relative z-10">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Payment Details</h3>
                    <p className="text-sm text-slate-600">Secure checkout with PayPal</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Order Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Item Price</span>
                      <span className="font-semibold text-slate-900">${min.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Processing Fee</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">Total</span>
                        <span className="text-2xl font-bold text-primary">${Number(amount || min).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 bg-white/50 backdrop-blur-sm"
                  />
                  <p className="text-xs text-slate-500">Receipt will be sent to this email</p>
                </div>
                
                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Amount (USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">$</span>
                    <Input
                      id="amount"
                      type="number"
                      min={min}
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 pl-8 rounded-xl border-slate-200 focus:border-accent focus:ring-accent/20 bg-white/50 backdrop-blur-sm font-semibold"
                      disabled={min === 0}
                    />
                  </div>
                  <div className={`rounded-xl p-3 ${min === 0 ? 'bg-green-50' : 'bg-blue-50'}`}>
                    <p className={`text-xs font-medium ${min === 0 ? 'text-green-700' : 'text-blue-700'}`}>
                      {min === 0 ? (
                        <>🎉 This item is FREE! You can still pay to support our work.</>
                      ) : (
                        <>💡 Minimum: ${min.toFixed(2)} — You can pay more to support our work!</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="font-medium text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Update Button */}
                <Button 
                  disabled={loading} 
                  onClick={handlePayClick}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? "Updating..." : "Update Payment"}
                </Button>

                {/* PayPal Buttons Container */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-500 font-medium px-3">PAY WITH</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  
                  <div ref={paypalButtonsRef} className="[&>div]:rounded-xl [&_iframe]:rounded-xl" />
                </div>
                
                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                  <Lock className="w-3 h-3" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg">
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">SSL Encrypted</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex items-center gap-2 text-slate-600">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">PayPal Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    </div>}>
      <CheckoutContent />
    </Suspense>
  );
}
