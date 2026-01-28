# Limo Booking MVP

Production-ready Next.js 14+ application with TypeScript, TailwindCSS, Prisma, and Zod.

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Prisma** (PostgreSQL)
- **Zod** (Environment variable validation)
- **NextAuth.js** (Auth.js) with Keycloak OIDC
- **ESLint** + **Prettier**

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Keycloak instance (or access to one)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
- Your database connection string
- Keycloak OIDC configuration (see Keycloak Setup below)
- NextAuth configuration

3. Set up the database:
```bash
npm run prisma:migrate
```

This will create the initial migration and apply it to your database.

4. Seed the database with demo data:
```bash
npm run prisma:seed
```

This creates:
- Demo company "Demo Limo Texas" (timezone: America/Chicago)
- Admin user with CompanyUser membership
- 3 vehicles (Sedan, SUV, Van) with current rates
- Historical rate example

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with demo data
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:push` - Push schema changes to database

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Shared utilities and configurations
│   ├── env.client.ts
│   └── env.server.ts
└── server/          # Server-side code
    ├── db/          # Prisma client
    └── auth/        # Authentication configuration
```

## Environment Variables

Server-side variables (validated in `src/lib/env.server.ts`):
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/test/production)
- `KEYCLOAK_ISSUER` - Keycloak realm issuer URL (e.g., `http://localhost:8080/realms/your-realm`)
- `KEYCLOAK_CLIENT_ID` - Keycloak client ID
- `KEYCLOAK_CLIENT_SECRET` - Keycloak client secret
- `NEXTAUTH_URL` - Your application URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET` - Random secret (min 32 characters) - generate with: `openssl rand -base64 32`

Client-side variables (validated in `src/lib/env.client.ts`):
- `NEXT_PUBLIC_APP_URL` - Application URL (optional)

## Keycloak Setup

### 1. Create a Client in Keycloak

1. Log into Keycloak Admin Console
2. Select your realm (or create a new one)
3. Go to **Clients** → **Create client**
4. Configure:
   - **Client ID**: Choose a unique ID (e.g., `limo-booking-app`)
   - **Client authentication**: `On` (confidential client)
   - **Authorization**: `Off` (unless you need it)
   - **Authentication flow**: `Standard flow` enabled
   - **Direct access grants**: Optional (for testing)

### 2. Configure Client Settings

After creating the client, configure:

**Settings tab:**
- **Access Type**: `confidential`
- **Standard Flow Enabled**: `On`
- **Direct Access Grants Enabled**: Optional
- **Valid Redirect URIs**: 
  - `http://localhost:3000/api/auth/callback/keycloak` (development)
  - `https://yourdomain.com/api/auth/callback/keycloak` (production)
- **Web Origins**: 
  - `http://localhost:3000` (development)
  - `https://yourdomain.com` (production)
- **Base URL**: Your application URL

**Credentials tab:**
- Copy the **Client Secret** to your `.env` file as `KEYCLOAK_CLIENT_SECRET`

### 3. Configure Roles (Optional but Recommended)

1. Go to **Realm roles** or **Client roles**
2. Create roles like:
   - `admin` - For admin dashboard access
   - `driver` - For driver dashboard access
   - `user` - Default user role
3. Assign roles to users in the **Users** → **Role Mappings** section

### 4. Configure Token Mapper (for roles)

1. Go to **Clients** → Your client → **Client scopes**
2. Click on `dedicated` scope or create a new one
3. Go to **Mappers** tab → **Add mapper** → **By configuration**
4. Select **User Realm Role** mapper
5. Configure:
   - **Name**: `realm roles`
   - **Token Claim Name**: `realm_access.roles`
   - **Add to ID token**: `On`
   - **Add to access token**: `On`
   - **Add to userinfo**: `On`

This ensures roles are included in the token as `realm_access.roles` array.

### 5. Test Configuration

1. Start your Next.js app: `npm run dev`
2. Click "Sign In" in the navbar
3. You should be redirected to Keycloak login
4. After successful login, you'll be redirected back with a session

**Note**: The app automatically creates/updates User records in the database on first sign-in and assigns them to the seeded "Demo Limo Texas" company.

## Database Schema

The Prisma schema includes:

- **Multi-tenant architecture**: Company and CompanyUser tables for tenant isolation
- **User management**: Keycloak integration via `idpSubject` (no password tables)
- **Vehicles**: Company-scoped vehicles with rate history
- **Bookings**: Full booking lifecycle with stops, quotes, and price snapshots
- **Pricing**: Snapshot-based pricing to lock rates at checkout
- **Payments**: Payment tracking with multiple providers
- **Trip assignments**: Driver assignment tracking

All business data is scoped to `companyId` for multi-tenant isolation.

## Authentication & Authorization

The app uses **NextAuth.js** with **Keycloak OIDC** for authentication.

### Route Protection

- **`/admin`** - Requires `admin` role
- **`/driver`** - Requires `driver` role  
- **`/account`** - Requires authenticated user (any role)

### Server-Side Guards

Use the guard functions in `src/server/auth/guards.ts`:

```typescript
import { requireAuth, requireRole, requireAnyRole } from '@/server/auth/guards'

// Require any authenticated user
const session = await requireAuth()

// Require specific role
const session = await requireRole('admin')

// Require any of multiple roles
const session = await requireAnyRole(['admin', 'manager'])
```

### Session Data

The session includes:
- `user.idpSubject` - Keycloak subject ID (unique identifier)
- `user.email` - User email
- `user.name` - User full name
- `user.roles` - Array of roles from Keycloak

### Auto User Creation

On first sign-in, the app:
1. Creates/updates User record with `idpSubject` from Keycloak
2. Automatically assigns user to "Demo Limo Texas" company with ACTIVE status

## License

MIT
