import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main>
      <section className="panel">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <Link className="button-link" to="/">
          Return Home
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;