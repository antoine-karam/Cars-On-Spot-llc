#!/bin/bash
set -e

# Check if Keycloak database exists, create if it doesn't
DB_EXISTS=$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='keycloak'" || echo "0")

if [ "$DB_EXISTS" != "1" ]; then
    echo "Creating Keycloak database..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE DATABASE keycloak;
EOSQL
    echo "Keycloak database created successfully"
else
    echo "Keycloak database already exists"
fi
