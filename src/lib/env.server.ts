import { z } from 'zod'

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  // Keycloak OIDC
  KEYCLOAK_ISSUER: z.string().url(),
  KEYCLOAK_CLIENT_ID: z.string().min(1),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1),
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  // Tenant
  DEFAULT_COMPANY_ID: z.string().min(1),
  // Maps
  GOOGLE_MAPS_API_KEY: z.string().min(1),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:')
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2))
    throw new Error('Invalid server environment variables')
  }

  return parsed.data
}

export const env = getServerEnv()
