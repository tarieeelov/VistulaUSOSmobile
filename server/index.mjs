import crypto from 'node:crypto';
import http from 'node:http';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import OAuth from 'oauth-1.0a';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be configured.`);
  return value;
};

const USOS_BASE_URL = process.env.USOS_BASE_URL ?? 'https://usosapps.vistula.edu.pl/';
const CONSUMER_KEY = required('USOS_CONSUMER_KEY');
const CONSUMER_SECRET = required('USOS_CONSUMER_SECRET');
const DEFAULT_CALLBACK_URL = process.env.USOS_CALLBACK_URL ?? 'vistulausos://oauth-callback';
const SCOPES = process.env.USOS_SCOPES ?? 'studies|grades|offline_access|personal';
const PORT = Number(process.env.PORT ?? 3000);

const encryptionKey = Buffer.from(required('SESSION_ENCRYPTION_KEY'), 'base64');
if (encryptionKey.length !== 32) {
  throw new Error('SESSION_ENCRYPTION_KEY must be a base64-encoded 32-byte key.');
}

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

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders,
  });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 16_384) reject(new Error('Request body is too large.'));
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });
    request.on('error', reject);
  });
}

function bearerToken(request) {
  const value = request.headers.authorization;
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

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      response.writeHead(204, corsHeaders);
      return response.end();
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return sendJson(response, 200, { ok: true });
    }
    if (request.method === 'POST' && url.pathname === '/oauth/start') {
      const body = await readJson(request).catch(() => ({}));
      return sendJson(response, 200, await startLogin(body?.callback_url));
    }
    if (request.method === 'POST' && url.pathname === '/oauth/complete') {
      return sendJson(response, 200, await completeLogin(await readJson(request)));
    }

    const sessionToken = bearerToken(request);
    if (!sessionToken) return sendJson(response, 401, { error: 'Missing session token.' });
    const session = unseal(sessionToken, 'usos-session');
    const token = { key: session.oauth_token, secret: session.oauth_token_secret };

    if (request.method === 'POST' && url.pathname === '/oauth/logout') {
      const revokeUrl = new URL('services/oauth/revoke_token', USOS_BASE_URL).toString();
      const authorization = oauth.toHeader(
        oauth.authorize({ url: revokeUrl, method: 'POST', data: {} }, token)
      );
      const usosResponse = await fetch(revokeUrl, { method: 'POST', headers: authorization });
      if (!usosResponse.ok) throw new Error(`USOS returned ${usosResponse.status} while logging out.`);
      return sendJson(response, 200, { ok: true });
    }

    if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
      const endpoint = url.pathname.slice('/api/'.length);
      if (!allowedEndpoints.has(endpoint)) {
        return sendJson(response, 403, { error: 'Endpoint is not allowed.' });
      }
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
      response.writeHead(usosResponse.status, {
        'Content-Type': usosResponse.headers.get('content-type') ?? 'application/json',
        ...corsHeaders,
      });
      return response.end(data);
    }

    return sendJson(response, 404, { error: 'Not found.' });
  } catch (error) {
    const isSessionError = error instanceof Error && /session/i.test(error.message);
    return sendJson(response, isSessionError ? 401 : 502, {
      error: isSessionError ? 'Invalid or expired session.' : 'USOS proxy request failed.',
    });
  }
});

server.listen(PORT, () => {
  console.log(`USOS OAuth proxy listening on port ${PORT}`);
});
