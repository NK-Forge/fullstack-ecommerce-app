import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addCartItem, getProduct } from '../api/apiClient';
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

function getInventoryCount(product) {
  return product.inventory_quantity ?? product.inventoryQuantity ?? 0;
}

function ProductDetailsPage() {
  const { productId } = useParams();
  const { isAuthenticated, token, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [cartStatus, setCartStatus] = useState('idle');
  const [cartMessage, setCartMessage] = useState('');

  const inventoryCount = product ? getInventoryCount(product) : 0;
  const isOutOfStock = inventoryCount <= 0;
  const isAdding = cartStatus === 'submitting';

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      try {
        const productData = await getProduct(productId);

        if (isMounted) {
          setProduct(productData);
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

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  async function handleAddToCart() {
    setCartStatus('submitting');
    setCartMessage('');

    try {
      const response = await addCartItem(user.id, token, product.id, 1);

      setCartStatus('success');
      setCartMessage(response.message || 'Added to cart.');
    } catch (err) {
      setCartStatus('error');
      setCartMessage(err.message);
    }
  }

  return (
    <main>
      <section className="panel">
        {status === 'loading' && (
          <p className="status-message">Loading product...</p>
        )}

        {status === 'error' && (
          <p className="status-message error-message">
            Unable to load product: {errorMessage}
          </p>
        )}

        {status === 'success' && product && (
          <div className="product-detail-layout">
            <div className="product-detail-copy">
              <p className="eyebrow">Product Details</p>
              <h1>{product.name}</h1>
              <p>{product.description || 'No description available.'}</p>

              <div className="product-detail-meta">
                <span>{formatPrice(product.price)}</span>
                <span>Stock: {inventoryCount}</span>
              </div>

              <div className="product-detail-actions">
                {isAuthenticated ? (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding || isOutOfStock}
                  >
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </button>
                ) : (
                  <Link className="button-link" to="/login">
                    Login to Add to Cart
                  </Link>
                )}

                <Link className="secondary-link" to="/products">
                  Back to Products
                </Link>
              </div>

              {cartMessage && (
                <p className={`form-message ${cartStatus === 'error' ? 'error-message' : 'success-message'}`}>
                  {cartMessage}
                </p>
              )}
            </div>

            <aside className="product-detail-card">
              <p className="eyebrow">Catalog Info</p>
              <h2>Product #{product.id}</h2>
              <p>Status: {isOutOfStock ? 'Out of stock' : 'Available'}</p>
              <p>Inventory: {inventoryCount}</p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default ProductDetailsPage;