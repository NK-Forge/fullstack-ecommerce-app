import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserOrders } from '../api/apiClient';
import { useAuth } from '../auth/useAuth';

function formatPrice(price) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return '$0.00';
  }

  return numericPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}

function formatDate(value) {
  if (!value) {
    return 'Unknown date';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function OrdersPage() {
  const { token, user } = useAuth();
  const location = useLocation();
  const checkoutMessage = location.state?.message;

  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        const orderData = await getUserOrders(user.id, token);

        if (isMounted) {
          setOrders(orderData);
          setStatus('success');
          setErrorMessage('');
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message);
          setStatus('error');
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [token, user.id]);

  return (
    <main>
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Orders</p>
            <h1>Order History</h1>
          </div>

          <p className="product-count">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        {checkoutMessage && (
          <p className="form-message success-message">
            {checkoutMessage}
          </p>
        )}

        {status === 'loading' && (
          <p className="status-message">Loading order history...</p>
        )}

        {status === 'error' && (
          <p className="status-message error-message">
            Unable to load orders: {errorMessage}
          </p>
        )}

        {status === 'success' && orders.length === 0 && (
          <div className="empty-state">
            <p className="status-message">
              You do not have any orders yet.
            </p>

            <Link className="button-link" to="/products">
              Browse Products
            </Link>
          </div>
        )}

        {status === 'success' && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order.id}>
                <div>
                  <p className="eyebrow">Order #{order.id}</p>
                  <h2>{formatPrice(order.total)}</h2>
                  <p>
                    Placed on {formatDate(order.created_at ?? order.createdAt)}
                  </p>
                </div>

                <div className="order-meta">
                  <span className="status-pill">
                    {order.status}
                  </span>
                  <span>
                    User #{order.user_id ?? order.userId}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default OrdersPage;