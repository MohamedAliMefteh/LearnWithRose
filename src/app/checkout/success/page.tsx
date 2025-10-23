"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, Mail, CreditCard, Calendar, User, Send, Clock } from "lucide-react";

function CheckoutSuccessContent() {
  const search = useSearchParams();
  const router = useRouter();
  const orderId = search.get("orderId");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsAnimated(true), 100);
    
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
    
    return () => clearTimeout(timer);
  }, [orderId]);

  const handleBackToHome = () => {
    router.push('/');
  };


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Success Header with Animation */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
          <div className="relative bg-white rounded-full p-3 sm:p-4 shadow-lg">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">Payment Successful!</h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-600">Thank you for your purchase</p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-4 sm:mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Order ID */}
      {!orderId && (
        <Card className="mb-4 sm:mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-yellow-800 font-medium">Missing order ID. Please contact support if you completed a payment.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {orderId && !data && !error && (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="text-slate-600">Loading your receipt...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Content */}
      {data && (
        <div className="space-y-4 sm:space-y-6">
          {/* Order Summary Card */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Order Receipt</h2>
                  <p className="text-green-100 text-sm sm:text-base">Your purchase has been confirmed</p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                  {data?.status || 'COMPLETED'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Order Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    Order Information
                  </h3>
                  
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-100 gap-1">
                      <span className="text-slate-600">Order ID:</span>
                      <span className="font-mono text-slate-900 break-all">{orderId}</span>
                    </div>
                    
                    {data?.purchase_units?.[0]?.payments?.captures?.[0]?.id && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-100 gap-1">
                        <span className="text-slate-600">Transaction ID:</span>
                        <span className="font-mono text-slate-900 text-[10px] sm:text-xs break-all">
                          {data.purchase_units[0].payments.captures[0].id}
                        </span>
                      </div>
                    )}
                    
                    {data?.create_time && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-100 gap-1">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          Date:
                        </span>
                        <span className="text-slate-900 text-xs sm:text-sm">{formatDate(data.create_time)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    Payment Information
                  </h3>
                  
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    {data?.payer?.email_address && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-100 gap-1">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                          Email:
                        </span>
                        <span className="text-slate-900 break-all">{data.payer.email_address}</span>
                      </div>
                    )}
                    
                    {data?.purchase_units?.[0]?.amount?.value && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
                        <span className="text-slate-600">Amount Paid:</span>
                        <span className="text-xl sm:text-2xl font-bold text-green-600">
                          ${data.purchase_units[0].amount.value} {data.purchase_units[0].amount.currency_code || "USD"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 mt-4 sm:mt-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Payment Confirmed</h4>
                    <p className="text-green-700 text-xs sm:text-sm leading-relaxed mb-3">
                      Your payment has been successfully processed! A confirmation email has been sent to your registered email address.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resource Delivery Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                      Resource Delivery
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    </h4>
                    <p className="text-blue-700 text-xs sm:text-sm leading-relaxed mb-2">
                      Your purchased digital resource will be sent directly to the email address you provided during checkout !
                    </p>
                    <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                      <strong>Delivery Time:</strong> You should receive your resource within the next 5 minutes. Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button 
              onClick={handleBackToHome}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Additional Support Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 text-center">
            <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Need Help?</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              If you don't receive your resource within 24 hours or have any questions about your purchase, 
              please contact our support team. We're here to help!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <CheckoutSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
