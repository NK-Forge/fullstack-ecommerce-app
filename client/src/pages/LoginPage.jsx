import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getGoogleOAuthUrl } from '../api/apiClient';
import { useAuth } from '../auth/useAuth';

const initialFormState = {
  email: '',
  password: ''
};

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isSubmitting = status === 'submitting';
  const redirectTo = location.state?.from?.pathname || '/products';

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setStatus('submitting');
    setMessage('');

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password
      });

      setStatus('success');
      setFormData(initialFormState);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  function handleGoogleLogin() {
    window.location.assign(getGoogleOAuthUrl());
  }

  if (isAuthenticated) {
    return <Navigate to="/products" replace />;
  }

  return (
    <main>
      <section className="panel form-panel">
        <div className="form-copy">
          <p className="eyebrow">Account</p>
          <h1>Login</h1>
          <p>
            Sign in to access cart features, checkout, protected resources, and order history.
          </p>
        </div>

        <div className="form-card">
          <button className="oauth-button" type="button" onClick={handleGoogleLogin}>
            Continue with Google
          </button>

          <div className="form-divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label htmlFor="email">
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </label>

              <label htmlFor="password">
                Password
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  autoComplete="current-password"
                />
              </label>
            </div>

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging In...' : 'Login'}
            </button>
          </form>

          {message && (
            <p className={`form-message ${status === 'error' ? 'error-message' : 'success-message'}`}>
              {message}
            </p>
          )}

          <p className="form-helper">
            Need an account? <Link to="/register">Create one here</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;