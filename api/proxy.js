import crypto from 'node:crypto';
import OAuth from 'oauth-1.0a';

const USOS_BASE_URL = process.env.USOS_BASE_URL ?? 'https://usosapps.vistula.edu.pl/';
const CONSUMER_KEY = process.env.USOS_CONSUMER_KEY ?? 'mzNubZHMbQ2QyL7jW3jy';
const CONSUMER_SECRET = process.env.USOS_CONSUMER_SECRET ?? 'EGhPHRHTDMmvAVBx2KgCz8E49546GL9fvUK6362R';
const DEFAULT_CALLBACK_URL = process.env.USOS_CALLBACK_URL ?? 'vistulausos://oauth-callback';
const SCOPES = process.env.USOS_SCOPES ?? 'studies|grades|offline_access|personal';
const SESSION_ENCRYPTION_KEY = process.env.SESSION_ENCRYPTION_KEY ?? 'PZkAk3m+bqP8Hn8Ulg6LxO6B3PACeFzbuTUnPcgN6Mc=';

const encryptionKey = Buffer.from(SESSION_ENCRYPTION_KEY, 'base64');

const oauth = new OAuth({
  consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64');
  },
});

const allowedEndpoints = new Set([
  'services/tt/student',
  'services/grades/terms2',
  'services/courses/user',
  'services/users/user',
]);

const toBase64Url = (value) => Buffer.from(value).toString('base64url');

function seal(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);
  return [toBase64Url(iv), toBase64Url(encrypted), toBase64Url(cipher.getAuthTag())].join('.');
}

function unseal(token, expectedType) {
  const [ivValue, encryptedValue, authTagValue] = token.split('.');
  if (!ivValue || !encryptedValue || !authTagValue) throw new Error('Invalid session.');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    encryptionKey,
    Buffer.from(ivValue, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'));
  const decoded = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64url')),
    decipher.final(),
  ]);
  const payload = JSON.parse(decoded.toString('utf8'));
  if (payload.type !== expectedType || !payload.expires_at || payload.expires_at < Date.now()) {
    throw new Error('Expired session.');
  }
  return payload;
}

function parseForm(text) {
  return Object.fromEntries(new URLSearchParams(text));
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders,
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string') {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.resolve({});
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function bearerToken(req) {
  const value = req.headers.authorization;
  return value?.startsWith('Bearer ') ? value.slice(7) : null;
}

async function startLogin(requestedCallbackUrl) {
  const callbackUrl = requestedCallbackUrl || DEFAULT_CALLBACK_URL;
  const requestUrl = new URL('services/oauth/request_token', USOS_BASE_URL);
  requestUrl.searchParams.set('scopes', SCOPES);
  const callbackData = { oauth_callback: callbackUrl };
  const authorization = oauth.toHeader(
    oauth.authorize({ url: requestUrl.toString(), method: 'POST', data: callbackData })
  );
  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: { ...authorization, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(callbackData).toString(),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`USOS returned ${response.status} while starting login.`);
  const requestToken = parseForm(raw);
  if (!requestToken.oauth_token || !requestToken.oauth_token_secret) {
    throw new Error('USOS returned an invalid request token.');
  }

  const loginSession = seal({
    type: 'oauth-request',
    expires_at: Date.now() + 10 * 60 * 1000,
    oauth_token: requestToken.oauth_token,
    oauth_token_secret: requestToken.oauth_token_secret,
  });
  const authorizationUrl = new URL('services/oauth/authorize', USOS_BASE_URL);
  authorizationUrl.searchParams.set('oauth_token', requestToken.oauth_token);
  return { login_session: loginSession, authorization_url: authorizationUrl.toString() };
}

async function completeLogin(body) {
  const requestToken = unseal(body.login_session, 'oauth-request');
  if (body.oauth_token !== requestToken.oauth_token || typeof body.oauth_verifier !== 'string') {
    throw new Error('The OAuth callback did not match the login session.');
  }

  const accessUrl = new URL('services/oauth/access_token', USOS_BASE_URL).toString();
  const verifierData = { oauth_verifier: body.oauth_verifier };
  const authorization = oauth.toHeader(
    oauth.authorize(
      { url: accessUrl, method: 'POST', data: verifierData },
      { key: requestToken.oauth_token, secret: requestToken.oauth_token_secret }
    )
  );
  const response = await fetch(accessUrl, {
    method: 'POST',
    headers: { ...authorization, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(verifierData).toString(),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(`USOS returned ${response.status} while completing login.`);
  const accessToken = parseForm(raw);
  if (!accessToken.oauth_token || !accessToken.oauth_token_secret) {
    throw new Error('USOS returned an invalid access token.');
  }

  return {
    session_token: seal({
      type: 'usos-session',
      expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
      oauth_token: accessToken.oauth_token,
      oauth_token_secret: accessToken.oauth_token_secret,
    }),
  };
}

export default async function handler(req, res) {
  try {
    const proto = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const url = new URL(req.url, `${proto}://${host}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders);
      return res.end();
    }

    if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/api/health')) {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && (url.pathname === '/oauth/start' || url.pathname === '/api/oauth/start')) {
      const body = await readBody(req);
      return sendJson(res, 200, await startLogin(body?.callback_url));
    }

    if (req.method === 'POST' && (url.pathname === '/oauth/complete' || url.pathname === '/api/oauth/complete')) {
      const body = await readBody(req);
      return sendJson(res, 200, await completeLogin(body));
    }

    const sessionToken = bearerToken(req);
    if (!sessionToken) return sendJson(res, 401, { error: 'Missing session token.' });
    const session = unseal(sessionToken, 'usos-session');
    const token = { key: session.oauth_token, secret: session.oauth_token_secret };

    if (req.method === 'POST' && (url.pathname === '/oauth/logout' || url.pathname === '/api/oauth/logout')) {
      const revokeUrl = new URL('services/oauth/revoke_token', USOS_BASE_URL).toString();
      const authorization = oauth.toHeader(
        oauth.authorize({ url: revokeUrl, method: 'POST', data: {} }, token)
      );
      const usosResponse = await fetch(revokeUrl, { method: 'POST', headers: authorization });
      if (!usosResponse.ok) throw new Error(`USOS returned ${usosResponse.status} while logging out.`);
      return sendJson(res, 200, { ok: true });
    }

    const apiPrefix = url.pathname.startsWith('/api/') ? '/api/' : '/';
    let endpoint = url.pathname.slice(apiPrefix.length);
    if (endpoint.startsWith('proxy/')) endpoint = endpoint.slice('proxy/'.length);

    if (req.method === 'GET' && allowedEndpoints.has(endpoint)) {
      const params = Object.fromEntries(url.searchParams);
      const targetUrl = new URL(endpoint, USOS_BASE_URL).toString();
      const authorization = oauth.toHeader(
        oauth.authorize({ url: targetUrl, method: 'GET', data: params }, token)
      );
      const target = new URL(targetUrl);
      Object.entries(params).forEach(([key, value]) => target.searchParams.set(key, value));
      const usosResponse = await fetch(target, {
        headers: { ...authorization, Accept: 'application/json' },
      });
      const data = await usosResponse.text();
      res.writeHead(usosResponse.status, {
        'Content-Type': usosResponse.headers.get('content-type') ?? 'application/json',
        ...corsHeaders,
      });
      return res.end(data);
    }

    return sendJson(res, 404, { error: `Not found: ${url.pathname}` });
  } catch (error) {
    const isSessionError = error instanceof Error && /session/i.test(error.message);
    return sendJson(res, isSessionError ? 401 : 502, {
      error: isSessionError ? 'Invalid or expired session.' : error.message || 'USOS proxy error',
    });
  }
}
