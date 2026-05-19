import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getGoogleOAuthUrl, registerUser } from '../api/apiClient';

const initialFormState = {
  email: '',
  password: '',
  verifyPassword: ''
};

function RegisterPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const isSubmitting = status === 'submitting';

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');

    if (formData.password !== formData.verifyPassword) {
      setStatus('error');
      setMessage('Passwords must match.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await registerUser({
        email: formData.email.trim(),
        password: formData.password
      });

      setStatus('success');
      setMessage(response.message || 'Account created successfully.');
      setFormData(initialFormState);
      navigate('/login', { replace: true });
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  function handleGoogleLogin() {
    window.location.assign(getGoogleOAuthUrl());
  }

  return (
    <main className="auth-page auth-page-centered">
      <section className="auth-card auth-card-centered" aria-labelledby="register-heading">
        <div className="auth-card-header">
          <p className="eyebrow">Account Access</p>
          <h1 id="register-heading">Create Account</h1>
          <p>
            Register a new account to prepare for cart access, checkout, and order history.
          </p>
        </div>

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
                autoComplete="new-password"
              />
            </label>

            <label htmlFor="verifyPassword">
              Verify Password
              <input
                id="verifyPassword"
                name="verifyPassword"
                type="password"
                value={formData.verifyPassword}
                onChange={handleChange}
                required
                minLength="6"
                autoComplete="new-password"
              />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {message && (
          <p className={`form-message ${status === 'error' ? 'error-message' : 'success-message'}`}>
            {message}
          </p>
        )}

        {status === 'success' && (
          <p className="form-helper">
            Account created. <Link to="/login">Go to login</Link>
          </p>
        )}

        <p className="form-helper">
          Already have an account? <Link to="/login">Log in here</Link>.
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;