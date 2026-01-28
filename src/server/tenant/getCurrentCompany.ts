import { env } from '@/lib/env.server'

/**
 * Get the current company ID for MVP
 * Returns the seeded company ID from DEFAULT_COMPANY_ID env var
 * 
 * TODO: Replace with real tenant selection logic
 */
export function getCurrentCompany(): string {
  if (!env.DEFAULT_COMPANY_ID) {
    throw new Error(
      'DEFAULT_COMPANY_ID is not set. This is required for MVP tenant selection.'
    )
  }
  return env.DEFAULT_COMPANY_ID
}
