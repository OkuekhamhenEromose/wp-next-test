const BASE_URL = process.env.NEXT_PUBLIC_WP_REST_URL;

export async function submitName(name) {
  if (!BASE_URL) return { data: null, error: 'NEXT_PUBLIC_WP_REST_URL is not set.' };
  if (!name || name.trim().length === 0) return { data: null, error: 'Name cannot be empty.' };
  try {
    const response = await fetch(`${BASE_URL}/custom/v1/submit-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!response.ok) return { data: null, error: `Failed to submit name: HTTP ${response.status}` };
    const data = await response.json();
    if (!data?.reversed) return { data: null, error: 'Unexpected response from submit-name endpoint.' };
    return { data, error: null };
  } catch (err) {
    console.error('[submitName]', err?.message ?? err);
    return { data: null, error: 'POST failed. Make sure WordPress is running.' };
  }
}

export async function getReversedName() {
  if (!BASE_URL) return { data: null, error: 'NEXT_PUBLIC_WP_REST_URL is not set.' };
  try {
    const response = await fetch(`${BASE_URL}/custom/v1/get-name`);
    if (!response.ok) return { data: null, error: `Failed to fetch name: HTTP ${response.status}` };
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.error('[getReversedName]', err?.message ?? err);
    return { data: null, error: 'GET failed. Make sure WordPress is running.' };
  }
}