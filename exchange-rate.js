/**
 * exchange-rate.js — Part 2
 *
 * Standalone Node.js script (not a Next.js page).
 * Run directly with: node exchange-rate.js
 *
 * Fetches the NGN → USD exchange rate from exchangerate.host and logs it.
 *
 * WHY a standalone script (not a Next.js API route):
 * The test asks for a file called exchange-rate.js at the project root.
 * This mimics a real-world utility script used in CI pipelines, cron jobs,
 * or server-side automation — separate from the web app's request lifecycle.
 *
 * The same fetch logic is also imported into the Next.js app via
 * lib/api/exchange.js so the rate can be displayed in the UI (Part 2 UI req).
 */

const ENDPOINT = "https://open.er-api.com/v6/latest/NGN";

/**
 * Fetches the NGN → USD exchange rate and logs the result.
 * Handles three failure modes explicitly:
 *   1. Network failure (no internet / endpoint unreachable)
 *   2. Non-OK HTTP status (4xx / 5xx from the API)
 *   3. Malformed response (missing expected fields in the JSON)
 */
async function fetchExchangeRate() {
  console.log("Fetching NGN → USD exchange rate...\n");

  // ── 1. Network request ───────────────────────────────────────────────────
  let response;
  try {
    response = await fetch(ENDPOINT);
  } catch (networkErr) {
    // fetch() itself throws only on network-level failures (DNS, timeout, etc.)
    console.error("❌ Network error — could not reach the exchange rate API.");
    console.error("   Details:", networkErr.message);
    process.exit(1);
  }

  // ── 2. HTTP status check ─────────────────────────────────────────────────
  if (!response.ok) {
    console.error(
      `❌ API responded with HTTP ${response.status} ${response.statusText}`,
    );
    process.exit(1);
  }

  // ── 3. Parse and validate JSON ───────────────────────────────────────────
  let data;
  try {
    data = await response.json();
  } catch {
    console.error("❌ Failed to parse API response as JSON.");
    process.exit(1);
  }

  // ── 4. Validate expected shape ───────────────────────────────────────────
  // exchangerate.host returns: { success: bool, base: string, rates: { USD: number } }
  if (data?.result !== "success") {
    console.error("❌ API returned result:", data?.result);
    console.error("   Full response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const rate = data?.rates?.USD;

  if (typeof rate !== "number") {
    console.error("❌ USD rate missing or not a number in API response.");
    console.error("   Received rates:", JSON.stringify(data?.rates));
    process.exit(1);
  }

  // ── 5. Success output ────────────────────────────────────────────────────
  const date = data.date ?? new Date().toISOString().split("T")[0];

  console.log("✅ Exchange rate fetched successfully");
  console.log("─".repeat(36));
  console.log(`   Base currency : NGN (Nigerian Naira)`);
  console.log(`   Target        : USD (US Dollar)`);
  console.log(`   Rate          : 1 NGN = ${rate.toFixed(8)} USD`);
  console.log(`   Inverse       : 1 USD = ${(1 / rate).toFixed(2)} NGN`);
  console.log(`   Rate date     : ${date}`);
  console.log("─".repeat(36));
}

fetchExchangeRate();
