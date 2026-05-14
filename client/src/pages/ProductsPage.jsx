import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addCartItem, getProducts } from '../api/apiClient';
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

function ProductsPage() {
  const { isAuthenticated, token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [cartStatusByProductId, setCartStatusByProductId] = useState({});
  const [cartMessageByProductId, setCartMessageByProductId] = useState({});

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const productData = await getProducts();

        if (isMounted) {
          setProducts(productData);
          setStatus('success');
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message);
          setStatus('error');
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAddToCart(product) {
    setCartStatusByProductId((currentStatuses) => ({
      ...currentStatuses,
      [product.id]: 'submitting'
    }));

    setCartMessageByProductId((currentMessages) => ({
      ...currentMessages,
      [product.id]: ''
    }));

    try {
      const response = await addCartItem(user.id, token, product.id, 1);

      setCartStatusByProductId((currentStatuses) => ({
        ...currentStatuses,
        [product.id]: 'success'
      }));

      setCartMessageByProductId((currentMessages) => ({
        ...currentMessages,
        [product.id]: response.message || 'Added to cart.'
      }));
    } catch (err) {
      setCartStatusByProductId((currentStatuses) => ({
        ...currentStatuses,
        [product.id]: 'error'
      }));

      setCartMessageByProductId((currentMessages) => ({
        ...currentMessages,
        [product.id]: err.message
      }));
    }
  }

  return (
    <main>
      <section className="products-section" aria-labelledby="products-heading">
        <div className="section-header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1 id="products-heading">Products</h1>
          </div>
          <p className="product-count">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {status === 'loading' && (
          <p className="status-message">Loading products...</p>
        )}

        {status === 'error' && (
          <p className="status-message error-message">
            Unable to load products: {errorMessage}
          </p>
        )}

        {status === 'success' && products.length === 0 && (
          <p className="status-message">No products are available yet.</p>
        )}

        {status === 'success' && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => {
              const inventoryCount = getInventoryCount(product);
              const isOutOfStock = inventoryCount <= 0;
              const cartStatus = cartStatusByProductId[product.id];
              const cartMessage = cartMessageByProductId[product.id];
              const isAdding = cartStatus === 'submitting';

              return (
                <article className="product-card" key={product.id}>
                  <div>
                    <h2>{product.name}</h2>
                    <p>{product.description || 'No description available.'}</p>
                  </div>

                  <div className="product-meta">
                    <span>{formatPrice(product.price)}</span>
                    <span>Stock: {inventoryCount}</span>
                  </div>

                  <div className="product-actions">
                    <Link className="secondary-link" to={`/products/${product.id}`}>
                      View Details
                    </Link>

                    {isAuthenticated ? (
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdding || isOutOfStock}
                      >
                        {isAdding ? 'Adding...' : 'Add to Cart'}
                      </button>
                    ) : (
                      <Link className="secondary-link" to="/login">
                        Login to Add
                      </Link>
                    )}
                  </div>

                  {cartMessage && (
                    <p className={`inline-message ${cartStatus === 'error' ? 'error-message' : 'success-message'}`}>
                      {cartMessage}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default ProductsPage;