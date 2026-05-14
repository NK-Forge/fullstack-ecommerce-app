import { Link, useSearchParams } from 'react-router-dom';

function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <main>
      <section className="panel checkout-success-panel">
        <p className="eyebrow">Checkout</p>
        <h1>Payment Completed</h1>

        <p>
          Stripe returned a successful checkout session. The backend webhook is configured
          to verify completed checkout events and fulfill the order server-side.
        </p>

        {sessionId && (
          <p className="status-message">
            Stripe session: {sessionId}
          </p>
        )}

        <div className="hero-actions">
          <Link className="button-link" to="/orders">
            View Orders
          </Link>

          <Link className="secondary-link" to="/products">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export default CheckoutSuccessPage;