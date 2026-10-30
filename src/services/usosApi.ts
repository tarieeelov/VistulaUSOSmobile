import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';

import { cacheSet, cacheGet, makeCacheKey } from './cache';
import { CachedResponse } from '../types/usos';

WebBrowser.maybeCompleteAuthSession();

/** Public proxy URL; OAuth signing and secrets live securely on the server. */
const PROXY_URL = process.env.EXPO_PUBLIC_USOS_PROXY_URL?.replace(/\/$/, '');
const SESSION_STORAGE_KEY = 'usos_proxy_session';

interface StoredSession {
  session_token: string;
}

interface AuthStartResponse {
  login_session: string;
  authorization_url: string;
}

function getProxyUrl(): string {
  if (PROXY_URL) return PROXY_URL;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname || 'localhost'}:3000`;
  }
  return 'http://localhost:3000';
}

function getCallbackUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/login`;
  }
  return 'vistulausos://oauth-callback';
}

async function saveSession(session: StoredSession): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  } else {
    await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
}

async function loadSession(): Promise<StoredSession | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web') {
      raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_STORAGE_KEY) : null;
    } else {
      raw = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
    }
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'session_token' in parsed &&
      typeof (parsed as { session_token: string }).session_token === 'string'
    ) {
      return parsed as StoredSession;
    }
  } catch (error) {
    console.warn('[usosApi] Failed to load proxy session:', error);
  }
  return null;
}

async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } else {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `USOS proxy error (${response.status})`);
  }
  return (await response.json()) as T;
}

function parseCallback(url: string): { oauth_token: string; oauth_verifier: string } {
  const parsed = Linking.parse(url);
  const oauth_token = parsed.queryParams?.oauth_token;
  const oauth_verifier = parsed.queryParams?.oauth_verifier;

  if (typeof oauth_token !== 'string' || typeof oauth_verifier !== 'string') {
    throw new Error('The USOS callback did not contain a valid OAuth verifier.');
  }

  return { oauth_token, oauth_verifier };
}

/** Start OAuth in the proxy, then finish it in the system browser. */
export async function login(): Promise<void> {
  const proxyUrl = getProxyUrl();
  const callbackUrl = getCallbackUrl();

  const startResponse = await fetch(`${proxyUrl}/oauth/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_url: callbackUrl }),
  });
  const start = await readJson<AuthStartResponse>(startResponse);

  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('pending_login_session', start.login_session);
  }

  const browserResult = await WebBrowser.openAuthSessionAsync(
    start.authorization_url,
    callbackUrl
  );

  if (browserResult.type !== 'success' || !browserResult.url) {
    throw new Error(`Authentication was cancelled or dismissed (${browserResult.type}).`);
  }

  const callback = parseCallback(browserResult.url);
  const completionResponse = await fetch(`${proxyUrl}/oauth/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login_session: start.login_session,
      oauth_token: callback.oauth_token,
      oauth_verifier: callback.oauth_verifier,
    }),
  });
  const completed = await readJson<StoredSession>(completionResponse);

  if (!completed.session_token) {
    throw new Error('USOS proxy did not return a session token.');
  }
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('pending_login_session');
  }
  await saveSession(completed);
}

/** Check if current Web page was opened as a redirect callback from USOS. */
export async function handleRedirectCallbackIfPresent(): Promise<boolean> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const url = window.location.href;
  if (!url.includes('oauth_verifier=') || !url.includes('oauth_token=')) return false;

  const pendingSession =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('pending_login_session')
      : null;
  if (!pendingSession) return false;

  try {
    const callback = parseCallback(url);
    const proxyUrl = getProxyUrl();
    const completionResponse = await fetch(`${proxyUrl}/oauth/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login_session: pendingSession,
        oauth_token: callback.oauth_token,
        oauth_verifier: callback.oauth_verifier,
      }),
    });
    const completed = await readJson<StoredSession>(completionResponse);
    if (completed.session_token) {
      await saveSession(completed);
      sessionStorage.removeItem('pending_login_session');
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
  } catch (err) {
    console.warn('[usosApi] Error handling redirect callback:', err);
  }
  return false;
}

/** Revoke the server-held USOS token when possible, then remove local access. */
export async function logout(): Promise<void> {
  const session = await loadSession();
  try {
    if (session) {
      await fetch(`${getProxyUrl()}/oauth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.session_token}` },
      });
    }
  } finally {
    await clearSession();
  }
}

/** The device holds an opaque proxy session, never raw USOS OAuth credentials. */
export async function getStoredTokens(): Promise<StoredSession | null> {
  return loadSession();
}

/**
 * Fetch a whitelisted USOS endpoint through the server-side OAuth proxy.
 * Only transport failures use offline cache; HTTP errors reach the UI.
 */
export async function usosFetch<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<CachedResponse<T>> {
  const cacheKey = makeCacheKey(endpoint, params);
  const session = await loadSession();

  if (!session) {
    const cached = await cacheGet<T>(cacheKey);
    if (cached) return { data: cached.data, fromCache: true, cachedAt: cached.cachedAt };
    throw new Error('Not authenticated. Please log in first.');
  }

  const requestUrl = new URL(`/api/${endpoint.replace(/^\/+/, '')}`, `${getProxyUrl()}/`);
  Object.entries(params ?? {}).forEach(([key, value]) => requestUrl.searchParams.set(key, value));

  let response: Response;
  try {
    response = await fetch(requestUrl.toString(), {
      headers: { Authorization: `Bearer ${session.session_token}` },
    });
  } catch (networkError) {
    const cached = await cacheGet<T>(cacheKey);
    if (cached) return { data: cached.data, fromCache: true, cachedAt: cached.cachedAt };
    throw networkError;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `USOS proxy error (${response.status})`);
  }

  const data = (await response.json()) as T;
  await cacheSet(cacheKey, data);
  return { data, fromCache: false, cachedAt: null };
}
