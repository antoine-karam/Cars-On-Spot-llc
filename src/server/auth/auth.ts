import { NextAuthOptions } from 'next-auth'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { db } from '@/server/db'
import { env } from '@/lib/env.server'
import { CompanyUserStatus } from '@prisma/client'
import { getCurrentCompany } from '@/server/tenant/getCurrentCompany'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      idpSubject: string
      email: string
      name?: string | null
      roles: string[]
    }
  }

  interface User {
    id?: string
    idpSubject?: string
    roles?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idpSubject: string
    roles: string[]
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      issuer: env.KEYCLOAK_ISSUER,
      // Request only 'openid' - with fullScopeAllowed: true, Keycloak will include profile/email automatically
      authorization: {
        params: {
          scope: 'openid',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Extract idpSubject from token sub
        token.idpSubject = account.providerAccountId || (profile.sub as string)
        
        // Extract roles from realm_access.roles
        const realmAccess = (profile as any).realm_access
        token.roles = realmAccess?.roles || []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.idpSubject = token.idpSubject
        session.user.roles = token.roles
        session.user.id = token.sub || ''
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (!account || !profile) {
        console.error('Missing account or profile:', { account: !!account, profile: !!profile })
        return false
      }

      // Log what we're receiving for debugging
      console.log('Keycloak profile data:', {
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        providerAccountId: account.providerAccountId,
        userEmail: user.email,
        userName: user.name,
      })

      const idpSubject = account.providerAccountId || (profile.sub as string) || account.sub
      const email = profile.email || user.email || (profile as any).preferred_username
      const name = profile.name || user.name || `${(profile as any).given_name || ''} ${(profile as any).family_name || ''}`.trim()

      if (!idpSubject || !email) {
        console.error('Missing idpSubject or email from Keycloak', {
          idpSubject,
          email,
          profileKeys: Object.keys(profile),
          accountKeys: Object.keys(account),
        })
        return false
      }

      try {
        // Upsert User by idpSubject
        const dbUser = await db.user.upsert({
          where: { idpSubject },
          update: {
            email,
            fullName: name || null,
            updatedAt: new Date(),
          },
          create: {
            idpSubject,
            email,
            fullName: name || null,
          },
        })

        // Get the current company (MVP: uses DEFAULT_COMPANY_ID)
        const companyId = getCurrentCompany()
        const company = await db.company.findUnique({
          where: { id: companyId },
        })

        if (company) {
          // Upsert CompanyUser membership if it doesn't exist
          await db.companyUser.upsert({
            where: {
              companyId_userId: {
                companyId: company.id,
                userId: dbUser.id,
              },
            },
            update: {
              // Only update if status is INACTIVE, otherwise keep existing status
              status: CompanyUserStatus.ACTIVE,
            },
            create: {
              companyId: company.id,
              userId: dbUser.id,
              status: CompanyUserStatus.ACTIVE,
            },
          })
        }

        return true
      } catch (error) {
        console.error('Error during sign-in callback:', error)
        return false
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

// Export authOptions for NextAuth v4
