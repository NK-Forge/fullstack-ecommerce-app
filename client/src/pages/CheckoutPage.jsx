import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/apiClient';
import { useAuth } from '../auth/useAuth';

function CheckoutPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const isSubmitting = status === 'submitting';

  async function handleCheckout() {
    setStatus('submitting');
    setMessage('');

    try {
      const response = await createOrder(user.id, token);
      const orderId = response.order?.id ?? response.orderId ?? response.id;

      setStatus('success');
      setMessage(response.message || 'Order created successfully.');

      if (orderId) {
        navigate('/orders', {
          replace: true,
          state: {
            message: `Order #${orderId} created successfully.`
          }
        });
        return;
      }

      navigate('/orders', {
        replace: true,
        state: {
          message: 'Order created successfully.'
        }
      });
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
          <h1>Review and Place Order</h1>
          <p>
            This checkout step uses the existing backend order endpoint to create an order
            from your current cart. Payment processing will be added in a later step.
          </p>
        </div>

        <div className="checkout-card">
          <p className="eyebrow">Order Action</p>
          <h2>Create Order</h2>
          <p>
            When you place the order, the API will convert the cart into an order record.
          </p>

          <button
            className="primary-button"
            type="button"
            onClick={handleCheckout}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
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