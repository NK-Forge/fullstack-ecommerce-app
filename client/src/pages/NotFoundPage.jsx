import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="utility-page">
      <section className="utility-card" aria-labelledby="not-found-heading">
        <p className="eyebrow">404</p>
        <h1 id="not-found-heading">Page Not Found</h1>
        <p>
          The route you requested does not exist in Forge: Storefront.
        </p>

        <div className="utility-actions">
          <Link className="button-link" to="/">
            Return Home
          </Link>

          <Link className="secondary-link" to="/products">
            Browse Products
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;