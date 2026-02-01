-- Create multi-tenant tables
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    license_type VARCHAR(50),
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES schools(id),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255),
    profile JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- Initial seed data
INSERT INTO schools (name, subdomain, license_type) 
VALUES ('Zarife Admin', 'admin', 'platform') 
ON CONFLICT (subdomain) DO NOTHING;
