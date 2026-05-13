import { Link, useLocation } from 'react-router-dom';

function OrdersPage() {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <main>
      <section className="panel">
        <p className="eyebrow">Orders</p>
        <h1>Order History</h1>

        {message && (
          <p className="form-message success-message">
            {message}
          </p>
        )}

        <p>
          Order history will connect to the existing orders endpoint in the next step.
        </p>

        <Link className="button-link" to="/products">
          Continue Shopping
        </Link>
      </section>
    </main>
  );
}

export default OrdersPage;