# Zarife - Implementation Plan

> Animated Picture Book Platform for K-12 Education with AI-Assisted Learning

---

## 📋 Project Overview

| Attribute | Details |
|-----------|---------|
| **Product** | Interactive animated picture books for children |
| **Target Market** | Turkey (primary), B2B (schools) + B2C |
| **Timeline** | 6-7 months (2026) |
| **Team** | 2 people (Developer + Designer/Illustrator) |
| **Differentiator** | AI-assisted content + original illustrations + Turkish market focus |

---

## 🛠 Tech Stack (Approved)

| Layer | Technology | Notes |
|-------|------------|-------|
| **Web** | Vite + React + shadcn/ui + Tailwind | SPA, TypeScript |
| **Mobile/Tablet** | React Native (Expo) | EAS builds, Expo Router |
| **Backend** | .NET 9 (ASP.NET Core) | Clean Architecture |
| **Database** | PostgreSQL | Users, schools, progress |
| **Content DB** | MongoDB or PostgreSQL JSONB | Flexible book structure |
| **Storage (Local)** | MinIO | S3-compatible, development |
| **Storage (Prod)** | Azure Blob / MinIO self-hosted | Based on scale/budget |
| **CDN** | Azure CDN / Cloudflare | Content delivery |
| **Cache** | Redis | Sessions, hot data |
| **Auth** | ASP.NET Identity + JWT | Multi-tenant with tenant claims |
| **Auth (Future)** | Keycloak | Enterprise SSO, LDAP, SAML |
| **AI Services** | Azure OpenAI, Azure TTS | Story generation, narration |
| **Animation** | Rive (rive.app) | State Machine + animations |

---

## 🐳 Local Development Environment

> **Kritik**: Tüm uygulama docker-compose ile tamamen local'de çalışabilir olmalıdır.

### docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: zarife-db
    environment:
      POSTGRES_USER: zarife
      POSTGRES_PASSWORD: zarife_dev_123
      POSTGRES_DB: zarife
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zarife"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: zarife-cache
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # MinIO (S3-Compatible Storage)
  minio:
    image: minio/minio:latest
    container_name: zarife-storage
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: zarife_minio
      MINIO_ROOT_PASSWORD: zarife_minio_secret
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console UI
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # MinIO Client (bucket initialization)
  minio-init:
    image: minio/mc:latest
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
      mc alias set zarife http://minio:9000 zarife_minio zarife_minio_secret;
      mc mb zarife/books --ignore-existing;
      mc mb zarife/animations --ignore-existing;
      mc mb zarife/audio --ignore-existing;
      mc mb zarife/avatars --ignore-existing;
      mc anonymous set download zarife/books;
      mc anonymous set download zarife/animations;
      mc anonymous set download zarife/audio;
      echo 'Buckets created successfully';
      "

  # .NET Core API
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: zarife-api
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=zarife;Username=zarife;Password=zarife_dev_123"
      ConnectionStrings__Redis: "redis:6379"
      Storage__Endpoint: "http://minio:9000"
      Storage__AccessKey: zarife_minio
      Storage__SecretKey: zarife_minio_secret
      Storage__UseSSL: "false"
    ports:
      - "5000:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_healthy
    volumes:
      - ./api:/app
      - /app/bin
      - /app/obj

  # Vite + React Web App (development mode)
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.dev
    container_name: zarife-web
    environment:
      VITE_API_URL: http://localhost:5000
      VITE_STORAGE_URL: http://localhost:9000
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Environment Configuration

| Environment | Database | Storage | Auth | Notes |
|-------------|----------|---------|------|-------|
| **Local** | Docker PostgreSQL | MinIO (Docker) | ASP.NET Identity | `docker-compose up` |
| **CI/CD** | Docker PostgreSQL | MinIO (Docker) | ASP.NET Identity | GitHub Actions |
| **Staging** | Azure PostgreSQL | MinIO (self-hosted) | ASP.NET Identity | Test environment |
| **Production** | Azure PostgreSQL | Azure Blob OR MinIO | ASP.NET Identity + Keycloak | Live |

### Storage Cost Comparison

| Option | Monthly Cost (100GB) | Pros | Cons |
|--------|---------------------|------|------|
| **MinIO (self-hosted)** | ~$20-40 (VPS) | Full control, no egress fees | Ops overhead |
| **Azure Blob** | ~$2 storage + egress | Managed, integrated | Egress costs |
| **Cloudflare R2** | ~$1.50 (no egress) | Cheap, no egress | Less .NET SDK support |

> **Öneri**: Development ve MVP için MinIO kullanın. Scale ettiğinizde Azure Blob veya R2'ye geçebilirsiniz.

### Quick Start Commands

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Sadece altyapıyı başlat (Postgres, Redis, MinIO)
docker-compose up -d postgres redis minio minio-init

# API'yi local olarak çalıştır (hot-reload ile)
cd api && dotnet watch run

# Web'i local olarak çalıştır
cd apps/web && npm run dev

# MinIO Console'a eriş
open http://localhost:9001
# Login: zarife_minio / zarife_minio_secret

# PostgreSQL'e bağlan
psql -h localhost -U zarife -d zarife
```

### .env.example

```bash
# Database
DATABASE_URL=postgresql://zarife:zarife_dev_123@localhost:5432/zarife

# Redis
REDIS_URL=redis://localhost:6379

# Storage (MinIO)
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=zarife_minio
STORAGE_SECRET_KEY=zarife_minio_secret
STORAGE_BUCKET_BOOKS=books
STORAGE_BUCKET_ANIMATIONS=animations
STORAGE_BUCKET_AUDIO=audio

# API
API_URL=http://localhost:5000

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_ISSUER=zarife-api
JWT_AUDIENCE=zarife-clients
```

---

## 🏢 Multi-Tenant Architecture

### Tenant Model

```
┌─────────────────────────────────────────────────────────────┐
│                   MULTI-TENANT STRUCTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Platform Admin (Super Admin)                               │
│  └── Can manage all tenants                                 │
│                                                              │
│  Tenant (School)                                            │
│  ├── School Admin                                           │
│  │   └── Manages school settings, teachers, classes        │
│  ├── Teachers                                               │
│  │   └── Manages classes, assigns content, views progress  │
│  ├── Parents                                                │
│  │   └── Views child progress, manages home access         │
│  └── Students                                               │
│      └── Consumes content, earns achievements              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Database Multi-Tenancy Strategy

**Approach: Shared Database, Shared Schema with Tenant ID**

```sql
-- All tenant-scoped tables include tenant_id
CREATE TABLE schools (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,  -- okul.zarife.com
    license_type VARCHAR(50),
    settings JSONB,
    created_at TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES schools(id),  -- NULL for platform admins
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- student, teacher, parent, school_admin
    profile JSONB,
    UNIQUE(tenant_id, email)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES schools(id) NOT NULL,
    name VARCHAR(255),
    grade_level INT,
    teacher_id UUID REFERENCES users(id)
);

-- Row-Level Security (RLS) for automatic tenant filtering
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

### JWT Token Structure

```json
{
  "sub": "user-uuid-123",
  "email": "ogretmen@okul.edu.tr",
  "tenant_id": "school-uuid-456",
  "tenant_name": "Atatürk İlköğretim Okulu",
  "role": "teacher",
  "permissions": ["read:students", "write:assignments", "read:progress"],
  "iat": 1706788800,
  "exp": 1706792400
}
```

### Tenant-Aware Middleware (.NET Core)

```csharp
public class TenantMiddleware
{
    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        // Extract tenant from JWT or subdomain
        var tenantId = context.User.FindFirst("tenant_id")?.Value
                    ?? ExtractFromSubdomain(context.Request.Host);
        
        if (tenantId != null)
        {
            var tenant = await tenantService.GetTenantAsync(tenantId);
            context.Items["Tenant"] = tenant;
            
            // Set for PostgreSQL RLS
            await SetTenantContext(tenantId);
        }
        
        await _next(context);
    }
}
```

### Tenant Access Patterns

| Pattern | Implementation |
|---------|----------------|
| **Subdomain** | `ataokulu.zarife.com` → tenant_id lookup |
| **School Code** | Students enter code at login |
| **JWT Claim** | All API requests include tenant_id |
| **RLS** | PostgreSQL enforces at DB level |

---

## � Authentication Phases

### Phase 1: MVP Authentication (ASP.NET Identity)

```
┌─────────────────────────────────────────────────────────────┐
│                   MVP AUTH SYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ASP.NET Identity                                           │
│  ├── Email/Password registration                            │
│  ├── JWT + Refresh tokens                                   │
│  ├── Role-based authorization                               │
│  ├── Tenant claim in JWT                                    │
│  └── Password reset via email                               │
│                                                              │
│  Login Flows:                                                │
│  1. School Admin → Email/pass → Full access                 │
│  2. Teacher → Email/pass → Class access                     │
│  3. Parent → Email/pass → Child's data only                 │
│  4. Student → School code + username → Simplified login     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Keycloak Migration (Enterprise)

**Trigger Conditions:**
- 50+ schools onboarded
- Enterprise customer requires SSO
- Google Classroom / Microsoft Teams integration needed
- MEB (Ministry of Education) authentication required

**Migration Steps:**

```
┌─────────────────────────────────────────────────────────────┐
│                KEYCLOAK MIGRATION PATH                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Deploy Keycloak                                    │
│  └── Docker/Kubernetes deployment                           │
│  └── PostgreSQL as Keycloak DB                              │
│                                                              │
│  Step 2: Create Realm Structure                             │
│  └── Master Realm (platform admins)                         │
│  └── Per-School Realms OR single realm with groups          │
│                                                              │
│  Step 3: Migrate Users                                      │
│  └── Export from ASP.NET Identity                           │
│  └── Import to Keycloak (password hash migration)           │
│                                                              │
│  Step 4: Update API                                         │
│  └── Replace Identity middleware with OIDC validation       │
│  └── Keep tenant_id claim structure                         │
│                                                              │
│  Step 5: Add SSO Providers                                  │
│  └── Google Workspace (for Google Classroom schools)        │
│  └── Microsoft Azure AD (for MS Teams schools)              │
│  └── LDAP (for universities)                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Keycloak Multi-Tenant Options

| Approach | Pros | Cons | When to Use |
|----------|------|------|-------------|
| **Realm-per-School** | Full isolation, per-school SSO | Realm management overhead | Enterprise schools with own IdP |
| **Single Realm + Groups** | Simpler management | Less isolation | Standard schools |
| **Hybrid** | Flexibility | Complexity | Mix of both types |

### Keycloak Configuration (Future)

```yaml
# docker-compose.keycloak.yml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://db:5432/keycloak
      KC_HOSTNAME: auth.zarife.com
    command: start
    ports:
      - "8080:8080"
```

```json
// Keycloak Realm Export (example)
{
  "realm": "zarife-schools",
  "enabled": true,
  "sslRequired": "external",
  "roles": {
    "realm": [
      { "name": "student" },
      { "name": "teacher" },
      { "name": "parent" },
      { "name": "school_admin" }
    ]
  },
  "groups": [
    {
      "name": "school-uuid-123",
      "attributes": {
        "tenant_id": ["school-uuid-123"],
        "school_name": ["Atatürk İlköğretim"]
      }
    }
  ],
  "identityProviders": [
    {
      "alias": "google",
      "providerId": "google",
      "enabled": true
    }
  ]
}
```

---

## �📁 Project Structure

```
zarife/
├── apps/
│   ├── web/                      # Vite + React + shadcn
│   │   ├── app/
│   │   │   ├── (marketing)/      # Landing, pricing
│   │   │   ├── (auth)/           # Login, register
│   │   │   ├── (portal)/         # Teacher/parent portal
│   │   │   ├── (reader)/         # Book reader
│   │   │   └── (admin)/          # Content management
│   │   ├── components/
│   │   │   └── ui/               # shadcn components
│   │   └── lib/
│   │
│   └── mobile/                   # React Native (Expo)
│       ├── app/                  # Expo Router
│       ├── components/
│       ├── features/
│       │   ├── auth/
│       │   ├── library/
│       │   └── reader/
│       └── services/
│
├── api/                          # .NET Core Solution
│   ├── src/
│   │   ├── Zarife.API/           # Web API (Controllers)
│   │   ├── Zarife.Core/          # Domain & Application logic
│   │   ├── Zarife.Infrastructure/# Data access, external services
│   │   └── Zarife.AI/            # AI service integrations
│   ├── tests/
│   └── Zarife.sln
│
├── content/                      # Book content (development)
│   ├── books/
│   ├── animations/
│   └── audio/
│
├── docs/                         # Documentation
│   ├── api/
│   ├── content-spec/
│   └── deployment/
│
├── .github/                      # CI/CD workflows
├── docker-compose.yml
└── README.md
```

---

## 🎯 Phase 1: Foundation (Weeks 1-8)

### 1.1 Project Setup (Week 1-2)

| Task | Details | Owner |
|------|---------|-------|
| Repository setup | Git, branching strategy, PR templates | Dev |
| **docker-compose.yml** | Postgres, Redis, MinIO, API, Web | Dev |
| .NET Core solution | Clean Architecture scaffold | Dev |
| Vite + React web app | shadcn/ui, Tailwind, React Router | Dev |
| Database design | PostgreSQL schema, migrations | Dev |
| Storage abstraction | S3-compatible interface (MinIO/Azure) | Dev |
| CI/CD pipeline | GitHub Actions for build/test | Dev |

### 1.2 Authentication & Multi-Tenancy (Week 3-4)

| Task | Details | Priority |
|------|---------|----------|
| Tenant (School) model | schools table with settings | 🔴 High |
| User registration/login | Email + password with tenant context | 🔴 High |
| Role system | Student, Teacher, Parent, SchoolAdmin, PlatformAdmin | 🔴 High |
| JWT with tenant claims | tenant_id, role, permissions | 🔴 High |
| Refresh tokens | Secure rotation | 🔴 High |
| Student simplified login | School code + username | 🔴 High |
| Tenant middleware | Extract & validate tenant context | 🔴 High |
| PostgreSQL RLS | Row-level security policies | 🟡 Medium |
| Password reset | Email flow | 🟡 Medium |
| Social login | Google (optional, prep for Keycloak) | 🟢 Low |

### 1.3 Core API (Week 5-6)

| Endpoint Group | Key Endpoints |
|----------------|---------------|
| `/api/auth` | Login, register, refresh, logout |
| `/api/users` | Profile, preferences |
| `/api/schools` | CRUD, class management |
| `/api/students` | Student profiles, progress |
| `/api/books` | List, details, search |
| `/api/content` | Media upload, management |

### 1.4 Admin Portal (Week 7-8)

| Feature | Description |
|---------|-------------|
| Content upload | Add new books, pages, media |
| Book editor | Define pages, layers, interactions |
| Media library | Manage Lottie files, audio, images |
| User management | View/edit users, schools |

---

## 📚 Phase 2: Book Player MVP (Weeks 9-14)

### 2.1 Book Content Format

```json
{
  "bookId": "uuid",
  "metadata": {
    "title": "Kırmızı Balık",
    "author": "Zarife Team",
    "illustrator": "Partner Name",
    "language": "tr",
    "targetAge": { "min": 3, "max": 6 },
    "duration": 5,
    "categories": ["story", "shapes", "colors"]
  },
  "pages": [
    {
      "pageNumber": 1,
      "riveFile": "page1.riv",
      "stateMachine": "PageController",
      "artboard": "Page1",
      "inputs": [
        {
          "name": "isNarrating",
          "type": "boolean",
          "default": false
        }
      ],
      "triggers": [
        {
          "name": "fishTapped",
          "type": "trigger"
        },
        {
          "name": "pageComplete",
          "type": "trigger"
        }
      ],
      "narration": {
        "audioUrl": "page1.mp3",
        "text": "Bir varmış bir yokmuş...",
        "wordTimings": [
          { "word": "Bir", "start": 0.0, "end": 0.3 }
        ],
        "onStart": { "input": "isNarrating", "value": true },
        "onEnd": { "trigger": "pageComplete" }
      }
    }
  ]
}
```

### 2.2 Web Reader (Week 9-11)

| Component | Tech | Notes |
|-----------|------|-------|
| Page renderer | `@rive-app/react-canvas` | WebGL/Canvas |
| Rive player | Rive Runtime | State Machine control |
| Audio player | Howler.js or native | Narration sync |
| State sync | Rive inputs/triggers | Connect audio → animation |
| Touch/click | Rive built-in | Interactions defined in .riv |
| Navigation | Swipe / buttons | Page turning |

### 2.3 Content Pipeline (Week 12)

| Step | Tool | Output |
|------|------|--------|
| Illustration | Illustrator / Procreate / Figma | PNG/SVG layers |
| Import to Rive | Rive Editor | Bones, constraints |
| Animation | Rive Editor | Timeline animations |
| State Machine | Rive Editor | Interactivity logic |
| Audio | Recording / Azure TTS | MP3 files |
| Upload | Admin portal | CDN distribution |

> **Not:** Eşiniz Rive Editor'da hem animasyonu hem de State Machine'i (interaksiyon kurallarını) tanımlar. Developer sadece .riv dosyasını embed eder ve audio sync yapar.

### 2.4 Content Management API (Week 13-14)

| Feature | Description |
|---------|-------------|
| Book CRUD | Create, read, update, delete books |
| Page management | Add/edit pages within books |
| Media upload | Chunked upload for large files |
| Version control | Track book revisions |
| Publishing | Draft → Review → Published workflow |

---

## 📱 Phase 3: Mobile App (Weeks 15-20)

### 3.1 Expo Setup (Week 15)

| Task | Details |
|------|---------|
| Expo project init | Bare or managed workflow |
| Expo Router | File-based routing |
| UI library | React Native Paper or Tamagui |
| Rive integration | `rive-react-native` |
| API client | Shared with web if possible |

### 3.2 Core Screens (Week 16-18)

| Screen | Features |
|--------|----------|
| Login/Register | Auth flow, school code entry |
| Library | Book grid, categories, search |
| Book Detail | Cover, description, start reading |
| Reader | Full-screen book player |
| Profile | Child profile, avatar, progress |
| Parent Area | PIN protected, settings |

### 3.3 Offline Mode (Week 19-20)

| Feature | Implementation |
|---------|----------------|
| Book download | Download to device storage |
| Progress sync | Queue and sync when online |
| Storage management | Clear cache, manage downloads |
| Offline indicator | Show downloaded vs streaming |

---

## 🏫 Phase 4: School Features (Weeks 21-24)

### 4.1 School Management

| Feature | Description |
|---------|-------------|
| School registration | Admin creates school account |
| License management | Subscription tiers, student limits |
| Class creation | Teachers create classes |
| Student import | CSV/Excel bulk import |
| Teacher roles | Class assignment, permissions |

### 4.2 Teacher Dashboard

| Feature | Description |
|---------|-------------|
| Class overview | See all students, quick stats |
| Assign books | Push books to class/students |
| Curriculum builder | Create reading sequences |
| Progress reports | Reading time, completion, streaks |
| Parent reports | Shareable progress summaries |

### 4.3 Analytics

| Metric | Value |
|--------|-------|
| Books read | Per student, class, school |
| Reading time | Daily, weekly, monthly |
| Completion rate | Books finished vs started |
| Popular books | Most read titles |
| Engagement | Interaction counts per book |

---

## 🤖 Phase 5: AI Integration (Weeks 25-28)

### 5.1 Text-to-Speech Narration

| Service | Use Case |
|---------|----------|
| Azure Neural TTS | High-quality Turkish voices |
| ElevenLabs | Custom voice cloning (future) |

**Workflow:**
1. Author writes story text
2. Admin triggers TTS generation
3. Audio stored in CDN
4. Word timings auto-generated

### 5.2 Story Generation (Admin Tool)

| Feature | Description |
|---------|-------------|
| Story prompts | "Create a story about sharing for ages 4-6" |
| Educational alignment | "Include counting 1-10" |
| Style matching | Match tone/vocabulary to age |
| Human review | AI draft → human edit → publish |

### 5.3 Translation

| Feature | Description |
|---------|-------------|
| Auto-translate | Turkish ↔ English ↔ Arabic |
| Localization | Cultural adaptation, not just words |
| Voice regeneration | TTS in target language |

---

## 🚀 Phase 6: Launch Prep (Weeks 29-30)

### 6.1 Testing

| Type | Scope |
|------|-------|
| Unit tests | .NET services, React components |
| Integration tests | API endpoints |
| E2E tests | Critical user flows |
| Performance | Load testing, CDN caching |
| Accessibility | Screen readers, contrast |

### 6.2 Pilot School

| Activity | Details |
|----------|---------|
| Partner selection | 1-2 schools in Istanbul |
| Training | Teacher onboarding session |
| Feedback collection | Weekly surveys, interviews |
| Bug fixing | Priority fixes based on feedback |
| Content validation | Age-appropriateness review |

### 6.3 App Store Submission

| Platform | Checklist |
|----------|-----------|
| iOS | Apple Developer account, App Store Connect |
| Android | Google Play Console, content rating |
| Privacy policy | KVKK compliant |
| Screenshots | Localized for Turkish market |

---

## 📊 Success Metrics

| Milestone | Target Date | Criteria |
|-----------|-------------|----------|
| MVP ready | Month 4 | Web reader + 5 sample books |
| Mobile app beta | Month 5 | iOS TestFlight + Android beta |
| Pilot school | Month 6 | 1 school, 50+ students |
| Public launch | Month 7 | App stores + marketing site |

---

## 🔜 Immediate Next Steps

1. [ ] **Project setup**: Initialize Git repo, create folder structure
2. [ ] **Database design**: Finalize schema, create ERD
3. [ ] **.NET solution**: Scaffold Clean Architecture
4. [ ] **Vite + React app**: Init with shadcn, basic layout
5. [ ] **First book spec**: Define JSON format in detail
6. [ ] **Sample content**: Create 1 prototype book for testing

---

*Plan created: 2026-02-01*
*Last updated: 2026-02-01*
