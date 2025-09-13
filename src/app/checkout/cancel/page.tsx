export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-secondary/10 to-accent/10">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Payment canceled</h1>
        <p className="text-muted-foreground">You canceled the PayPal payment. You can return and try again anytime.</p>
      </div>
    </div>
  );
}
