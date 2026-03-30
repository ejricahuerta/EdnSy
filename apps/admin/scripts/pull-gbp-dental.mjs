/**
 * Pull GBP (Google Business Profile) data for dental businesses in Toronto/GTA.
 * - Uses same Supabase and .env as admin (run from apps/admin or set env).
 * - Searches dental in Toronto and GTA, filters: no website, fewer reviews.
 * - Random top 5 saved as prospects with provider 'gbp'.
 * - Max 25 new GBP prospects per day (UTC).
 *
 * Required .env (in apps/admin): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY), GBP_SCRIPT_USER_ID.
 *
 * Run: from apps/admin → pnpm run pull-gbp-dental
 *      from repo root  → node apps/admin/scripts/pull-gbp-dental.mjs (ensure .env is loaded from admin)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from admin app root (parent of scripts/)
const envPath = resolve(__dirname, '..', '.env');
config({ path: envPath });

const PLACES_BASE = 'https://places.googleapis.com/v1';
const DAILY_CAP = 25;
const MAX_REVIEWS = 50; // "fewer reviews" = keep only places with fewer than this
const TARGET_COUNT = 5;
const GTA_RECT = {
  rectangle: {
    low: { latitude: 43.4, longitude: -79.8 },
    high: { latitude: 44.0, longitude: -78.7 }
  }
};

function normalizePlaceId(p) {
  if (p.id && p.id.length > 0) return p.id;
  if (typeof p.name === 'string' && p.name.startsWith('places/')) return p.name.slice(7);
  return p.name ?? '';
}

function getApiKey() {
  return (process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY ?? '').trim();
}

function getUserId() {
  return (process.env.GBP_SCRIPT_USER_ID ?? process.env.LEAD_ROSETTA_GBP_USER_ID ?? '').trim();
}

/** Text Search (New) – dental in Toronto/GTA. */
async function searchDentalPlaces(apiKey, pageToken) {
  const url = `${PLACES_BASE}/places:searchText`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.name,places.displayName,places.formattedAddress'
    },
    body: JSON.stringify({
      textQuery: 'dentist dental clinic',
      locationRestriction: GTA_RECT,
      regionCode: 'CA',
      pageSize: 20,
      ...(pageToken ? { pageToken } : {})
    }),
    signal: AbortSignal.timeout(20000)
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Places searchText ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const places = (json.places ?? []).map((p) => ({
    id: normalizePlaceId(p),
    displayName: p.displayName?.text ?? '',
    formattedAddress: p.formattedAddress ?? ''
  }));
  return { places: places.filter((p) => p.id.length > 0), nextPageToken: json.nextPageToken };
}

/** Place Details (New) – full details by place id. */
async function getPlaceDetails(apiKey, placeId) {
  const url = `${PLACES_BASE}/places/${encodeURIComponent(placeId)}`;
  const fieldMask = [
    'displayName',
    'formattedAddress',
    'nationalPhoneNumber',
    'internationalPhoneNumber',
    'websiteUri',
    'rating',
    'userRatingCount',
    'regularOpeningHours',
    'businessStatus'
  ].join(',');
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask
    },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) return null;
  const json = await res.json();
  return {
    displayName: json.displayName?.text ?? '',
    formattedAddress: json.formattedAddress ?? '',
    nationalPhoneNumber: json.nationalPhoneNumber ?? '',
    internationalPhoneNumber: json.internationalPhoneNumber ?? '',
    websiteUri: (json.websiteUri ?? '').trim(),
    rating: json.rating ?? null,
    userRatingCount: json.userRatingCount ?? 0
  };
}

/** Fisher–Yates shuffle. */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Start of today UTC (YYYY-MM-DD 00:00:00.000Z). */
function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Try to increment Places API usage for this month (same RPC as app). */
async function tryIncrementPlacesUsage(supabase) {
  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const limit = Math.min(
    Math.max(1, parseInt(process.env.PLACES_API_MONTHLY_LIMIT || '10000', 10) || 10000),
    100_000
  );
  const { data, error } = await supabase.rpc('increment_places_usage_if_under_limit', {
    p_month_key: monthKey,
    p_limit: limit
  });
  if (error) {
    const { data: row } = await supabase
      .from('places_api_usage')
      .select('lookups_count')
      .eq('month_key', monthKey)
      .single();
    const current = row?.lookups_count ?? 0;
    if (current >= limit) return false;
    await supabase.from('places_api_usage').upsert(
      { month_key: monthKey, lookups_count: current + 1 },
      { onConflict: 'month_key' }
    );
    return true;
  }
  return data != null && data >= 1;
}

async function main() {
  const apiKey = getApiKey();
  const userId = getUserId();
  const supabaseUrl = (process.env.SUPABASE_URL ?? '').trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!apiKey) {
    console.error('Missing GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY. Use .env from apps/admin.');
    process.exit(1);
  }
  if (!userId) {
    console.error('Missing GBP_SCRIPT_USER_ID (or LEAD_ROSETTA_GBP_USER_ID). Set in apps/admin/.env.');
    process.exit(1);
  }
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Use .env from apps/admin.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  // Daily cap: max 25 new GBP prospects per day (UTC)
  const todayStart = startOfTodayUtc();
  const { count: todayCount, error: countError } = await supabase
    .from('prospects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('provider', 'gbp')
    .gte('created_at', todayStart);

  if (countError) {
    console.error('Failed to count today’s GBP prospects:', countError.message);
    process.exit(1);
  }
  if ((todayCount ?? 0) >= DAILY_CAP) {
    console.log(`Daily cap reached (${todayCount}/${DAILY_CAP}). No new prospects added.`);
    process.exit(0);
  }

  const remaining = DAILY_CAP - (todayCount ?? 0);
  const toAdd = Math.min(TARGET_COUNT, remaining);

  // Consume one Places slot for the text search
  const allowedSearch = await tryIncrementPlacesUsage(supabase);
  if (!allowedSearch) {
    console.error('Places API monthly limit reached. No search performed.');
    process.exit(1);
  }

  const { data: existing } = await supabase
    .from('prospects')
    .select('provider_row_id')
    .eq('user_id', userId)
    .eq('provider', 'gbp');
  const existingIds = new Set((existing ?? []).map((r) => r.provider_row_id).filter(Boolean));

  const candidates = [];
  let totalSearched = 0;
  let nextPageToken;

  do {
    if (nextPageToken) {
      const allowed = await tryIncrementPlacesUsage(supabase);
      if (!allowed) break;
    }
    let searchResult;
    try {
      searchResult = await searchDentalPlaces(apiKey, nextPageToken);
    } catch (e) {
      console.error('Places search failed:', e.message);
      process.exit(1);
    }
    const places = searchResult.places;
    totalSearched += places.length;
    nextPageToken = searchResult.nextPageToken;

    for (const place of places) {
      if (existingIds.has(place.id)) continue;
      const allowed = await tryIncrementPlacesUsage(supabase);
      if (!allowed) break;
      const details = await getPlaceDetails(apiKey, place.id);
      if (!details) continue;
      if ((details.userRatingCount ?? 0) >= MAX_REVIEWS) continue;
      candidates.push({
        placeId: place.id,
        name: details.displayName || place.displayName || 'Dental',
        address: details.formattedAddress || place.formattedAddress || '',
        phone: details.nationalPhoneNumber || details.internationalPhoneNumber || '',
        website: details.websiteUri || null
      });
      existingIds.add(place.id);
    }
    if (candidates.length >= toAdd || !nextPageToken) break;
    if (candidates.length > 0) break;
  } while (nextPageToken);

  if (totalSearched === 0) {
    console.log('No dental places found in Toronto/GTA. Check API key and Places API (New) is enabled.');
    process.exit(0);
  }

  const picked = shuffle(candidates).slice(0, toAdd);
  if (picked.length === 0) {
    console.log(`Searched ${totalSearched} place(s); none had fewer than ${MAX_REVIEWS} reviews. Try again later.`);
    process.exit(0);
  }

  let inserted = 0;
  for (const c of picked) {
    const row = {
      user_id: userId,
      provider: 'gbp',
      provider_row_id: c.placeId,
      company_name: (c.name || 'Dental').slice(0, 500),
      email: '',
      website: (c.website || '').slice(0, 500) || null,
      phone: (c.phone || '').slice(0, 100) || null,
      address: (c.address || '').slice(0, 500) || null,
      industry: 'Dental',
      status: 'New',
      updated_at: new Date().toISOString(),
      flagged: false,
      flagged_reason: null
    };
    const { error: upsertErr } = await supabase
      .from('prospects')
      .upsert(row, { onConflict: 'user_id,provider,provider_row_id' });
    if (upsertErr) {
      console.error('Upsert failed for', c.placeId, upsertErr.message);
      continue;
    }
    inserted++;
    console.log('Added:', c.name, '|', c.address || '(no address)');
  }

  console.log(`Done. Added ${inserted} dental prospect(s). Today’s total GBP: ${(todayCount ?? 0) + inserted}/${DAILY_CAP}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
