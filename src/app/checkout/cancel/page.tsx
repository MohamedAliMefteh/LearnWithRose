"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw, ShoppingCart, HelpCircle, MessageCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  const router = useRouter();
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleRetryPayment = () => {
    router.back();
  };

  const handleBrowseProducts = () => {
    router.push('/#courses');
  };

  const handleContactSupport = () => {
    router.push('/#contact');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className={`transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Cancel Header with Animation */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse opacity-20"></div>
              <div className="relative bg-white rounded-full p-3 sm:p-4 shadow-lg">
                <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">Payment Canceled</h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600">No worries, you can try again anytime</p>
          </div>

          {/* Information Card */}
          <Card className="mb-6 sm:mb-8 border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 sm:p-6">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Payment Not Completed</h2>
                <p className="text-orange-100 text-sm sm:text-base">Your payment was canceled and no charges were made</p>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="space-y-4 sm:space-y-6">
                {/* What Happened Section */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">What happened?</h4>
                      <p className="text-orange-700 text-xs sm:text-sm leading-relaxed mb-3">
                        You canceled the PayPal payment process before it was completed. This is completely normal and no charges were made to your account.
                      </p>
                      <ul className="text-orange-700 text-xs sm:text-sm space-y-1">
                        <li>• No money was charged</li>
                        <li>• Your cart items are still available</li>
                        <li>• You can retry the payment anytime</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Next Steps Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">What can you do next?</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <div className="text-xs sm:text-sm">
                          <h5 className="font-medium text-blue-900 mb-1">Try Again</h5>
                          <p className="text-blue-700">Go back and complete your purchase with the same or different payment method.</p>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <h5 className="font-medium text-blue-900 mb-1">Browse More</h5>
                          <p className="text-blue-700">Explore our other courses and resources that might interest you.</p>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <h5 className="font-medium text-blue-900 mb-1">Need Help?</h5>
                          <p className="text-blue-700">Contact our support team if you experienced any technical issues.</p>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <h5 className="font-medium text-blue-900 mb-1">Save for Later</h5>
                          <p className="text-blue-700">Take your time to decide. Our content will be here when you're ready.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                onClick={handleRetryPayment}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Try Payment Again
              </Button>
              
              <Button 
                onClick={handleBrowseProducts}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-slate-300 hover:bg-slate-50 transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Browse More Courses
              </Button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Button 
                onClick={handleContactSupport}
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Contact Support
              </Button>
              
              <Button 
                onClick={handleBackToHome}
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-300"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          {/* Reassurance Message */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-slate-500">
              Questions about our payment process? We're here to help make your learning journey smooth and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
