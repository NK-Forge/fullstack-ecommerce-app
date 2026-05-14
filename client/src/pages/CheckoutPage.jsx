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
    <main>
      <section className="panel checkout-panel">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Secure Checkout</h1>
          <p>
            This step creates a Stripe Checkout Session from the current server-side cart,
            then redirects you to Stripe to complete payment.
          </p>
          <p>
            Order fulfillment will be finalized by a backend Stripe webhook in a follow-up step.
          </p>
        </div>

        <div className="checkout-card">
          <p className="eyebrow">Payment</p>
          <h2>Pay with Stripe</h2>
          <p>
            Stripe will handle the hosted payment page. Product names, quantities, and prices
            come from the API cart, not from client-submitted checkout data.
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
        </div>
      </section>
    </main>
  );
}

export default CheckoutPage;