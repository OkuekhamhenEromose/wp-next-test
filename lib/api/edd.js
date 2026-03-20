const BASE_URL = process.env.NEXT_PUBLIC_WP_REST_URL;

export async function fetchEddSettings() {
  if (!BASE_URL) {
    return { data: null, error: 'NEXT_PUBLIC_WP_REST_URL is not set in .env.local' };
  }

  try {
    // Uses our custom public endpoint (EDD v3 native REST requires auth)
    const response = await fetch(`${BASE_URL}/custom/v1/edd-currency`);

    if (!response.ok) {
      return { data: null, error: `Could not fetch EDD settings: HTTP ${response.status}` };
    }

    const data = await response.json();

    if (!data?.currency) {
      return { data: null, error: 'EDD currency setting not found.' };
    }

    return { data, error: null };
  } catch (err) {
    console.error('[fetchEddSettings]', err?.message ?? err);
    return { data: null, error: 'Could not reach WordPress. Make sure Local is running.' };
  }
}