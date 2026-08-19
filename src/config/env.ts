/**
 * Execution parameters, kept out of tests and page objects.
 * Playwright loads `.env` automatically, so a checkout can be pointed at any
 * deployment with `SN_BASE_URL` or a named preset via `SN_ENV`.
 */
const PRESETS: Record<string, string> = {
  staging: 'https://wl.stg.simplenight.com',
};

const envName = process.env.SN_ENV ?? 'staging';
const baseUrl = process.env.SN_BASE_URL ?? PRESETS[envName];

if (!baseUrl) {
  throw new Error(
    `Unknown SN_ENV "${envName}". Set SN_ENV to a known preset or provide SN_BASE_URL.`,
  );
}

export const envConfig = {
  name: envName,
  baseUrl,
} as const;
