const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const userModel = require('../models/userModel');

const router = express.Router();

function getClientOrigin() {
  return process.env.CLIENT_ORIGIN || 'http://localhost:5173';
}

function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret || !callbackUrl) {
    return null;
  }

  return {
    clientId: clientId,
    clientSecret: clientSecret,
    callbackUrl: callbackUrl
  };
}

function createGoogleOAuthClient(config) {
  return new OAuth2Client(
    config.clientId,
    config.clientSecret,
    config.callbackUrl
  );
}

function createOAuthState() {
  return jwt.sign(
    {
      provider: 'google',
      nonce: crypto.randomBytes(16).toString('hex')
    },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
}

function verifyOAuthState(state) {
  const decodedState = jwt.verify(state, process.env.JWT_SECRET);

  if (decodedState.provider !== 'google') {
    throw new Error('Invalid OAuth provider state');
  }

  return decodedState;
}

function createAppToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function buildOAuthUsername(profile) {
  return `google_${profile.sub}`;
}

async function findOrCreateGoogleUser(profile) {
  const existingUser = await userModel.findUserByEmail(profile.email);

  if (existingUser) {
    return existingUser;
  }

  const passwordHash = await bcrypt.hash(
    crypto.randomBytes(32).toString('hex'),
    10
  );

  const username = buildOAuthUsername(profile);

  return userModel.createUser({
    username: username,
    email: profile.email,
    passwordHash: passwordHash
  });
}

function redirectWithError(res, message) {
  const clientOrigin = getClientOrigin();
  const encodedMessage = encodeURIComponent(message);

  return res.redirect(`${clientOrigin}/oauth/callback#error=${encodedMessage}`);
}

router.get('/google', (req, res) => {
  const config = getGoogleOAuthConfig();

  if (!config) {
    return res.status(503).json({
      message: 'Google OAuth is not configured'
    });
  }

  const oauthClient = createGoogleOAuthClient(config);
  const state = createOAuthState();

  const authorizationUrl = oauthClient.generateAuthUrl({
    access_type: 'online',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
    state: state
  });

  res.redirect(authorizationUrl);
});

router.get('/google/callback', async (req, res) => {
  const config = getGoogleOAuthConfig();

  if (!config) {
    return res.status(503).json({
      message: 'Google OAuth is not configured'
    });
  }

  const { code, error, state } = req.query || {};

  if (error) {
    return redirectWithError(res, 'Google authentication was cancelled or denied');
  }

  if (!code || !state) {
    return res.status(400).json({
      message: 'Google OAuth code and state are required'
    });
  }

  try {
    verifyOAuthState(state);

    const oauthClient = createGoogleOAuthClient(config);
    const tokenResponse = await oauthClient.getToken(code);

    if (!tokenResponse.tokens.id_token) {
      return redirectWithError(res, 'Google did not return an identity token');
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokenResponse.tokens.id_token,
      audience: config.clientId
    });

    const profile = ticket.getPayload();

    if (!profile.email) {
      return redirectWithError(res, 'Google profile did not include an email address');
    }

    if (profile.email_verified === false) {
      return redirectWithError(res, 'Google email address is not verified');
    }

    const user = await findOrCreateGoogleUser(profile);
    const appToken = createAppToken(user);

    res.redirect(`${getClientOrigin()}/oauth/callback#token=${encodeURIComponent(appToken)}`);
  } catch (err) {
    redirectWithError(res, 'Google authentication failed');
  }
});

module.exports = router;