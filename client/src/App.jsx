import { NavLink, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/">
          Full-Stack E-Commerce
        </NavLink>

        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Products</NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/cart">Cart</NavLink>
              <NavLink to="/orders">Orders</NavLink>
            </>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>

        {isAuthenticated && (
          <div className="auth-actions">
            <p className="auth-status">
              Signed in as <span>{user?.email || user?.username}</span>
            </p>

            <button className="logout-button" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailsPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route
          path="/cart"
          element={(
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/checkout"
          element={(
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/checkout/success"
          element={(
            <ProtectedRoute>
              <CheckoutSuccessPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/orders"
          element={(
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          )}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;