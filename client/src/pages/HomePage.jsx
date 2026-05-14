import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Full-Stack E-Commerce</p>
          <h1>Shop products powered by a real API.</h1>
          <p className="hero-copy">
            This application connects a React client to a Node, Express, and Postgres backend.
            Users will be able to register, log in, browse products, manage a cart, check out,
            and view order history.
          </p>

          <div className="hero-actions">
            <Link className="button-link" to="/products">
              Browse Products
            </Link>
            <Link className="secondary-link" to="/register">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;