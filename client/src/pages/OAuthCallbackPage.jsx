import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

function readOAuthResultFromHash() {
  const hashValue = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  const params = new URLSearchParams(hashValue);

  return {
    token: params.get('token'),
    error: params.get('error')
  };
}

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();
  const [oauthResult] = useState(() => readOAuthResultFromHash());
  const [status, setStatus] = useState(oauthResult.error ? 'error' : 'processing');
  const [message, setMessage] = useState(
    oauthResult.error || 'Completing Google sign in...'
  );

  useEffect(() => {
    let isMounted = true;

    async function completeLogin() {
      if (oauthResult.error) {
        return;
      }

      if (!oauthResult.token) {
        setStatus('error');
        setMessage('OAuth callback did not include a token.');
        return;
      }

      try {
        await completeOAuthLogin(oauthResult.token);

        if (isMounted) {
          setStatus('success');
          setMessage('Google sign in completed.');
          navigate('/products', { replace: true });
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message);
        }
      }
    }

    completeLogin();

    return () => {
      isMounted = false;
    };
  }, [completeOAuthLogin, navigate, oauthResult]);

  return (
    <main className="utility-page">
      <section className="utility-card" aria-labelledby="oauth-heading">
        <p className="eyebrow">Google OAuth</p>
        <h1 id="oauth-heading">Signing You In</h1>

        <p className={`form-message ${status === 'error' ? 'error-message' : 'success-message'}`}>
          {message}
        </p>

        {status === 'error' && (
          <div className="utility-actions">
            <Link className="button-link" to="/login">
              Back to Login
            </Link>

            <Link className="secondary-link" to="/register">
              Create Account
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default OAuthCallbackPage;