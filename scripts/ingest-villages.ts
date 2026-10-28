import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 1. Load environment variables from .env.local first, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// 2. Pre-flight Credential Validation
function validateCredentials() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ [CONFIG ERROR] Missing Supabase environment variables!');
    console.error('Please verify that your .env.local contains:');
    console.error('  NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co');
    console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>\n');
    process.exit(1);
  }

  if (
    SUPABASE_URL.includes('your-project') ||
    SUPABASE_URL.includes('xyzcompany') ||
    SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role-key')
  ) {
    console.error('\n⚠️ [CONFIG ERROR] Placeholder credentials detected in .env.local!');
    console.error(`Current URL: ${SUPABASE_URL}`);
    console.error('Please update .env.local with your real Supabase project URL and secret service_role key.\n');
    process.exit(1);
  }

  try {
    new URL(SUPABASE_URL);
  } catch {
    console.error(`\n❌ [CONFIG ERROR] Invalid Supabase URL format: "${SUPABASE_URL}"`);
    process.exit(1);
  }
}

validateCredentials();

// 3. Initialize Supabase Client with keep-alive & custom fetch timeout
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    // 30-second timeout per HTTP request to prevent hung sockets
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));
    },
  },
});

// Helper: SEO-friendly canonical slug
function makeSlug(text: string): string {
  if (!text) return 'unspecified';
  return slugify(text.trim(), {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

function cleanStr(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().replace(/\s+/g, ' ');
}

function cleanNum(val: any, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(String(val).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? fallback : num;
}

// Extract rich diagnostic info from error objects (especially TypeError: fetch failed)
function formatDiagnosticError(err: any): string {
  const parts: string[] = [];

  if (err?.message) {
    parts.push(`Message: ${err.message}`);
  }

  // Node.js native fetch wraps the root network cause in err.cause
  if (err?.cause) {
    const cause = err.cause;
    if (typeof cause === 'object') {
      const code = cause.code || cause.errno || '';
      const msg = cause.message || JSON.stringify(cause);
      parts.push(`Cause: ${code ? `[${code}] ` : ''}${msg}`);
      if (cause.hostname) parts.push(`Target Host: ${cause.hostname}`);
    } else {
      parts.push(`Cause: ${String(cause)}`);
    }
  }

  if (err?.code) parts.push(`Code: ${err.code}`);
  if (err?.status) parts.push(`HTTP Status: ${err.status}`);
  if (err?.details) parts.push(`Details: ${err.details}`);
  if (err?.hint) parts.push(`Hint: ${err.hint}`);

  return parts.length > 0 ? parts.join(' | ') : String(err);
}

export interface RawVillageRow {
  name: string;
  taluka: string;
  district: string;
  state?: string;
  lgd_code?: string;
  population?: number | string;
  literacy_rate?: number | string;
  sex_ratio?: number | string;
  households?: number | string;
  working_pop?: number | string;
  pincode?: string;
  assembly?: string;
  panchayat?: string;
}

// 4. Robust Ingestion Runner with 50-Record Batch Size
async function batchIngest(villages: RawVillageRow[], batchSize = 50) {
  const startTime = Date.now();
  console.log(`\n======================================================`);
  console.log(`🚀 GramPulse High-Reliability Data Ingestion Engine`);
  console.log(`======================================================`);
  console.log(`📊 Total Records   : ${villages.length.toLocaleString()}`);
  console.log(`📦 Batch Size      : ${batchSize} records/batch`);
  console.log(`🎯 Supabase Host   : ${new URL(SUPABASE_URL!).hostname}`);
  console.log(`======================================================\n`);

  // Transform raw data into strictly validated rows
  const prepared = villages.map((row) => {
    const vName = cleanStr(row.name);
    const taluka = cleanStr(row.taluka);
    const district = cleanStr(row.district);
    const state = cleanStr(row.state || 'Maharashtra');

    return {
      name: vName,
      slug: makeSlug(vName),
      taluka: taluka,
      taluka_slug: makeSlug(taluka),
      district: district,
      district_slug: makeSlug(district),
      state: state,
      state_slug: makeSlug(state),
      lgd_code: cleanStr(row.lgd_code) || null,
      population: cleanNum(row.population, 0),
      literacy_rate: cleanNum(row.literacy_rate, 0.0),
      sex_ratio: cleanNum(row.sex_ratio, 0),
      households: cleanNum(row.households, 0),
      working_pop: cleanNum(row.working_pop, 0),
      pincode: cleanStr(row.pincode) || null,
      assembly: cleanStr(row.assembly) || null,
      panchayat: cleanStr(row.panchayat) || null,
    };
  });

  const totalBatches = Math.ceil(prepared.length / batchSize);
  let totalSuccessful = 0;
  let totalFailed = 0;

  for (let i = 0; i < prepared.length; i += batchSize) {
    const batchIndex = Math.floor(i / batchSize) + 1;
    const batch = prepared.slice(i, i + batchSize);
    const pct = ((batchIndex / totalBatches) * 100).toFixed(1);

    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    // Retry loop with backoff: 2s -> 4s -> 8s
    while (attempt <= maxRetries && !success) {
      attempt++;
      try {
        const { error } = await supabase
          .from('villages')
          .upsert(batch, {
            onConflict: 'lgd_code',
            ignoreDuplicates: false,
          });

        if (error) throw error;

        success = true;
        totalSuccessful += batch.length;

        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(0);
        const speed = (totalSuccessful / Math.max(1, Number(elapsedSec))).toFixed(0);

        console.log(
          `✅ [${batchIndex}/${totalBatches}] (${pct}%) | +${batch.length} inserted | Total: ${totalSuccessful.toLocaleString()} | Speed: ${speed}/s | ${elapsedSec}s`
        );
      } catch (err: any) {
        const diagnostic = formatDiagnosticError(err);

        if (attempt <= maxRetries) {
          const delaySec = Math.pow(2, attempt); // 2s, 4s, 8s
          console.warn(
            `⚠️  [Batch ${batchIndex}/${totalBatches}] Attempt ${attempt} failed. Retrying in ${delaySec}s...`
          );
          console.warn(`   ↳ Details: ${diagnostic}`);
          await new Promise((resolve) => setTimeout(resolve, delaySec * 1000));
        } else {
          console.error(
            `❌ [Batch ${batchIndex}/${totalBatches}] FAILED permanently after ${maxRetries} attempts.`
          );
          console.error(`   ↳ Root Cause: ${diagnostic}`);
          totalFailed += batch.length;
        }
      }
    }

    // Small 60ms throttle between batches to avoid connection pool congestion
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n======================================================`);
  console.log(`🏁 Ingestion Finished in ${durationSec}s`);
  console.log(`   - Successful Records : ${totalSuccessful.toLocaleString()}`);
  console.log(`   - Failed Records     : ${totalFailed.toLocaleString()}`);
  console.log(`======================================================\n`);
}

// 5. Entry Point
async function main() {
  const jsonPath = path.join(process.cwd(), 'data', 'villages.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Data file not found at: ${jsonPath}`);
    console.error('Run "node scripts/convert-lgd-to-json.js" first to generate the dataset.');
    process.exit(1);
  }

  console.log(`📖 Loading dataset from ${jsonPath}...`);
  const rawContent = fs.readFileSync(jsonPath, 'utf-8');
  const dataset = JSON.parse(rawContent);

  // Default to 50 records per batch for rock-solid stability
  await batchIngest(dataset, 50);
}

main().catch((fatalError) => {
  console.error('\n💥 FATAL UNCAUGHT ERROR:');
  console.error(formatDiagnosticError(fatalError));
  process.exit(1);
});
