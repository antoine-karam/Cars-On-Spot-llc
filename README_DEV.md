# Local Development Setup

This guide walks you through setting up the local development environment with Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Node.js 18+ and npm
- Git

## Step-by-Step Setup

### 1. Start Docker Services

Start PostgreSQL and Keycloak using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL 16 on port `5432`
- Start Keycloak on port `8080`
- Import the `limo` realm automatically with pre-configured users

**Wait for services to be healthy** (about 30-60 seconds):
```bash
docker-compose ps
```

Both services should show `healthy` status.

### 2. Verify Keycloak

Open your browser and navigate to:
- **Keycloak Admin Console**: http://localhost:8080
- **Login**: `admin` / `admin`

You should see the `limo` realm with:
- Client: `nextjs-app` (confidential)
- Realm roles: `admin`, `driver`, `client`
- 3 test users (see below)

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env.example` is already configured for local development. If you need to generate a new `NEXTAUTH_SECRET`:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Update `.env` with the generated secret.

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Database

Run Prisma migrations:

```bash
npm run prisma:migrate
```

Seed the database with demo data:

```bash
npm run prisma:seed
```

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Test Users

The Keycloak realm includes 3 pre-configured users:

| Username | Password | Role | Email |
|----------|----------|------|-------|
| `admin1` | `admin123` | `admin` | admin1@limo.local |
| `driver1` | `driver123` | `driver` | driver1@limo.local |
| `client1` | `client123` | `client` | client1@limo.local |

**Note**: All passwords are temporary. You'll be prompted to change them on first login.

## Testing Authentication

1. Navigate to http://localhost:3000
2. Click "Sign In" in the navbar
3. You'll be redirected to Keycloak login
4. Log in with one of the test users above
5. After successful login, you'll be redirected back to the app

### Test Role-Based Access

- **Admin Dashboard**: http://localhost:3000/admin (requires `admin` role)
- **Driver Dashboard**: http://localhost:3000/driver (requires `driver` role)
- **Account Page**: http://localhost:3000/account (requires any authenticated user)

## Keycloak Configuration

The realm is automatically imported from `infra/keycloak/realm-export.json` and includes:

- **Realm**: `limo`
- **Client**: `nextjs-app` (confidential)
- **Redirect URIs**: `http://localhost:3000/api/auth/callback/keycloak`
- **Web Origins**: `http://localhost:3000`
- **Realm Roles**: `admin`, `driver`, `client`
- **Protocol Mapper**: Maps realm roles to `realm_access.roles` in tokens

## Troubleshooting

### Keycloak Not Starting

If Keycloak fails to start:

1. Check logs: `docker-compose logs keycloak`
2. Ensure PostgreSQL is healthy: `docker-compose ps`
3. Wait longer (Keycloak can take 30-60 seconds to fully start)
4. Restart services: `docker-compose restart keycloak`

### Database Connection Issues

If you see database connection errors:

1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check connection string in `.env` matches docker-compose.yml:
   - User: `limo_user`
   - Password: `limo_password`
   - Database: `limo_booking`
   - Port: `5432`

### Keycloak Realm Not Imported

If the realm doesn't appear:

1. Check the realm export file exists: `infra/keycloak/realm-export.json`
2. Check Keycloak logs: `docker-compose logs keycloak | grep -i import`
3. Manually import via Admin Console:
   - Go to http://localhost:8080
   - Login as `admin` / `admin`
   - Click "Create Realm" → "Import" → Select `infra/keycloak/realm-export.json`

### Port Conflicts

If ports 5432 or 8080 are already in use:

1. Stop conflicting services
2. Or modify `docker-compose.yml` to use different ports
3. Update `.env` accordingly

## Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop and remove volumes (⚠️ deletes all data):

```bash
docker-compose down -v
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f keycloak
docker-compose logs -f postgres

# Restart a service
docker-compose restart keycloak

# Check service status
docker-compose ps

# Access PostgreSQL CLI
docker-compose exec postgres psql -U limo_user -d limo_booking

# Access Keycloak container
docker-compose exec keycloak /bin/bash
```

## Next Steps

Once everything is running:

1. ✅ Test authentication with different user roles
2. ✅ Verify protected routes work correctly
3. ✅ Check that users are auto-created in the database on first sign-in
4. ✅ Verify company membership is assigned automatically

## Production Notes

⚠️ **Never use these credentials in production!**

- Keycloak admin password: `admin`
- Client secret: `nextjs-app-secret-change-in-production`
- Database credentials are weak
- All test user passwords are temporary

For production, use:
- Strong, randomly generated secrets
- Proper Keycloak realm configuration
- Secure database credentials
- Environment-specific configuration
