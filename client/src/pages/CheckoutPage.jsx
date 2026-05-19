import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createCheckoutSession } from '../api/apiClient';
import { useAuth } from '../auth/useAuth';

function CheckoutPage() {
  const { token, user } = useAuth();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const isSubmitting = status === 'submitting';

  async function handleStripeCheckout() {
    setStatus('submitting');
    setMessage('');

    try {
      const response = await createCheckoutSession(user.id, token);

      if (!response.url) {
        throw new Error('Stripe checkout URL was not returned.');
      }

      window.location.assign(response.url);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  return (
    <main className="checkout-page">
      <section className="checkout-page-shell" aria-labelledby="checkout-heading">
        <div className="checkout-page-header">
          <h1 id="checkout-heading">Checkout</h1>
          <p>
            Review the secure payment handoff before continuing to Stripe.
          </p>
        </div>

        <div className="checkout-layout">
          <div className="checkout-brief">
            <h2>Secure Stripe Handoff</h2>
            <p>
              The cart is verified by the server before Stripe receives the checkout request.
              Product names, quantities, and prices come from the API cart.
            </p>

            <div className="checkout-points" aria-label="Checkout safeguards">
              <span>Server verified cart</span>
              <span>Hosted Stripe payment</span>
              <span>Webhook ready flow</span>
            </div>
          </div>

          <aside className="checkout-card" aria-label="Payment action">
            <h2>Payment</h2>
            <p>
              Continue to Stripe to complete the demo checkout flow.
              Use the card number:
            </p>
            <pre className="card-number">4242 4242 4242 4242</pre>
            <p>
              with any future expiration date and CVC for this demo.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={handleStripeCheckout}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Redirecting to Stripe...' : 'Continue to Stripe'}
            </button>

            {message && (
              <p className={`form-message ${status === 'error' ? 'error-message' : 'success-message'}`}>
                {message}
              </p>
            )}

            <p className="form-helper">
              Need to make changes? <Link to="/cart">Return to cart</Link>.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default CheckoutPage;