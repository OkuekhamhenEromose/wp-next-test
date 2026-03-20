/**
 * lib/api/exchange.js — Part 2 (UI integration)
 *
 * WHY a separate file from exchange-rate.js:
 * The root exchange-rate.js is a CLI script (process.exit, console.log output).
 * This module is the same logic adapted for the React UI — returns a structured
 * ApiResult instead of calling process.exit, so the component can render error
 * states gracefully without crashing the app.
 */
// open.er-api.com is free with no API key required
const ENDPOINT = 'https://open.er-api.com/v6/latest/NGN';

export async function fetchExchangeRate() {
  try {
    const response = await fetch(ENDPOINT);
    if (!response.ok) {
      return { data: null, error: `Exchange rate API error: HTTP ${response.status}` };
    }
    const data = await response.json();
    if (data?.result !== 'success' || typeof data?.rates?.USD !== 'number') {
      return { data: null, error: 'Exchange rate API returned an unexpected response.' };
    }
    const rate = data.rates.USD;
    return {
      data: {
        rate,
        inverse: 1 / rate,
        date: data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        base: 'NGN',
      },
      error: null,
    };
  } catch (err) {
    console.error('[fetchExchangeRate]', err?.message ?? err);
    return { data: null, error: 'Could not reach the exchange rate API.' };
  }
}