const BASE_URL = process.env.NEXT_PUBLIC_WP_REST_URL;

export async function fetchEddSettings() {
  if (!BASE_URL) {
    return { data: null, error: 'NEXT_PUBLIC_WP_REST_URL is not set in .env.local' };
  }
  try {
    const response = await fetch(`${BASE_URL}/edd/v1/settings`);
    if (response.status === 401) {
      return { data: null, error: 'EDD settings endpoint requires authentication.' };
    }
    if (!response.ok) {
      return { data: null, error: `WordPress REST API error: HTTP ${response.status}` };
    }
    const data = await response.json();
    if (data?.code && data?.message) {
      return { data: null, error: `WordPress: ${data.message}` };
    }
    return { data, error: null };
  } catch (err) {
    console.error('[fetchEddSettings]', err?.message ?? err);
    return { data: null, error: 'Could not reach WordPress. Make sure Local is running.' };
  }
}