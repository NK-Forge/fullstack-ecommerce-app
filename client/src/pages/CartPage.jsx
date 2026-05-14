import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem
} from '../api/apiClient';
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

function getProductId(item) {
  return item.product_id ?? item.productId;
}

function getInventoryCount(item) {
  return item.inventory_quantity ?? item.inventoryQuantity ?? 0;
}

function CartPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [actionStatus, setActionStatus] = useState('idle');
  const [actionMessage, setActionMessage] = useState('');

  const userId = user?.id;
  const isWorking = actionStatus === 'submitting';

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);
  }, [items]);

  const loadCartItems = useCallback(async () => {
    if (!userId || !token) {
      throw new Error('No active user session was found.');
    }

    const cartData = await getCart(userId, token);

    return cartData.items || [];
  }, [token, userId]);

  const refreshCart = useCallback(async () => {
    const nextItems = await loadCartItems();

    setItems(nextItems);
    setStatus('success');
    setErrorMessage('');

    return nextItems;
  }, [loadCartItems]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialCart() {
      try {
        const nextItems = await loadCartItems();

        if (isMounted) {
          setItems(nextItems);
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

    loadInitialCart();

    return () => {
      isMounted = false;
    };
  }, [loadCartItems]);

  async function handleQuantityChange(item, nextQuantity) {
    if (nextQuantity <= 0) {
      return;
    }

    const productId = getProductId(item);

    setActionStatus('submitting');
    setActionMessage('');

    try {
      await updateCartItem(userId, token, productId, nextQuantity);
      await refreshCart();

      setActionStatus('success');
      setActionMessage('Cart updated successfully.');
    } catch (err) {
      setActionStatus('error');
      setActionMessage(err.message);
    }
  }

  async function handleRemoveItem(item) {
    const productId = getProductId(item);

    setActionStatus('submitting');
    setActionMessage('');

    try {
      await removeCartItem(userId, token, productId);
      await refreshCart();

      setActionStatus('success');
      setActionMessage('Item removed from cart.');
    } catch (err) {
      setActionStatus('error');
      setActionMessage(err.message);
    }
  }

  async function handleClearCart() {
    setActionStatus('submitting');
    setActionMessage('');

    try {
      await clearCart(userId, token);
      await refreshCart();

      setActionStatus('success');
      setActionMessage('Cart cleared successfully.');
    } catch (err) {
      setActionStatus('error');
      setActionMessage(err.message);
    }
  }

  return (
    <main>
      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Shopping Cart</p>
            <h1>Your Cart</h1>
          </div>

          <p className="product-count">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {actionMessage && (
          <p className={`form-message ${actionStatus === 'error' ? 'error-message' : 'success-message'}`}>
            {actionMessage}
          </p>
        )}

        {status === 'loading' && (
          <p className="status-message">Loading cart...</p>
        )}

        {status === 'error' && (
          <p className="status-message error-message">
            Unable to load cart: {errorMessage}
          </p>
        )}

        {status === 'success' && items.length === 0 && (
          <p className="status-message">
            Your cart is empty. Visit the products page to add something.
          </p>
        )}

        {status === 'success' && items.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => {
                const inventoryCount = getInventoryCount(item);
                const productId = getProductId(item);
                const quantity = Number(item.quantity);
                const itemTotal = Number(item.price) * quantity;

                return (
                  <article className="cart-item" key={item.id ?? productId}>
                    <div className="cart-item-header">
                      <div>
                        <h2>{item.name}</h2>
                        <p>{item.description || 'No description available.'}</p>
                      </div>

                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => handleRemoveItem(item)}
                        disabled={isWorking}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="cart-item-meta">
                      <span>{formatPrice(item.price)} each</span>
                      <span>Stock: {inventoryCount}</span>
                      <span>Item total: {formatPrice(itemTotal)}</span>
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-controls" aria-label={`Quantity controls for ${item.name}`}>
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => handleQuantityChange(item, quantity - 1)}
                          disabled={isWorking || quantity <= 1}
                        >
                          -
                        </button>

                        <span>Qty: {quantity}</span>

                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => handleQuantityChange(item, quantity + 1)}
                          disabled={isWorking || quantity >= inventoryCount}
                        >
                          +
                        </button>
                      </div>

                      <p className="cart-product-id">Product #{productId}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary" aria-label="Cart summary">
              <p className="eyebrow">Summary</p>
              <h2>Total</h2>
              <p className="cart-total">{formatPrice(total)}</p>

              <div className="cart-summary-actions">
                <Link className="button-link full-width-button" to="/checkout">
                Continue to Checkout
                </Link>

                <button
                  className="danger-button full-width-button"
                  type="button"
                  onClick={handleClearCart}
                  disabled={isWorking}
                >
                  Clear Cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default CartPage;