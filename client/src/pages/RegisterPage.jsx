import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getGoogleOAuthUrl, registerUser } from '../api/apiClient';

const initialFormState = {
  username: '',
  email: '',
  password: ''
};

function RegisterPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

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

    setStatus('submitting');
    setMessage('');

    try {
      const response = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      setStatus('success');
      setMessage(response.message || 'Account created successfully.');
      setFormData(initialFormState);
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
    }
  }

  function handleGoogleLogin() {
    window.location.assign(getGoogleOAuthUrl());
  }

  return (
    <main>
      <section className="panel form-panel">
        <div className="form-copy">
          <p className="eyebrow">Account</p>
          <h1>Create Account</h1>
          <p>
            Register a new account to prepare for cart access, checkout, and order history.
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
              <label htmlFor="username">
                Username
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength="3"
                  autoComplete="username"
                />
              </label>

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
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;