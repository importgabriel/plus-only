/**
 * Server-side Supabase admin client for API routes.
 *
 * Uses the service role key so it can bypass Row Level Security policies,
 * which is appropriate for trusted server-to-server operations.
 * Never expose this client to the browser.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client authenticated with the service role key.
 * Throws at runtime if required environment variables are missing.
 */
export function createAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"
    );
  }
  if (!serviceKey) {
    throw new Error(
      "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  adminClient = createClient(url, serviceKey, {
    auth: {
      // Service role clients should not persist sessions or auto-refresh tokens.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}
