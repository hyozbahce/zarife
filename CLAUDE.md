# Zarife Project

> **IMPORTANT**: Always read [RULES.md](RULES.md) at the start of each session for project-specific rules and session notes.

---

## Project Overview

**Zarife** is an interactive animated picture book platform for K-12 education, targeting the Turkish market (B2B for schools + B2C for parents).

### Product Vision
- Similar to [Piboco](https://www.piboco.com/en/) - animated picture books for children
- **AI-assisted learning** with generated content
- Interactive Rive animations with State Machines
- Both literary and educational content (shapes, colors, stories)
- Original illustrations by partner designer

### Target Users
| User Type | Description |
|-----------|-------------|
| **Students** | K-12, primarily 3-12 years old |
| **Teachers** | Curriculum management, progress tracking |
| **Parents** | Home access, progress monitoring |
| **Schools** | Multi-tenant B2B customers |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Web** | Vite + React + shadcn/ui + Tailwind v4 |
| **Mobile/Tablet** | React Native (Expo Router) |
| **Backend** | .NET 9 (ASP.NET Core, Clean Architecture) |
| **Database** | PostgreSQL (multi-tenant, shared schema with tenant_id) |
| **Auth** | ASP.NET Identity + JWT Bearer tokens |
| **Storage** | MinIO (S3-compatible, local dev) |
| **Cache** | Redis |
| **AI** | Azure OpenAI (story generation, translation) |
| **TTS** | Azure Cognitive Services Speech (Neural TTS) |
| **Animation** | Rive (rive.app) with State Machines |
| **CI/CD** | GitHub Actions |

---

## Project Structure

```
zarife/
├── apps/
│   ├── web/                        # Vite + React + shadcn/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/         # DashboardLayout, AppSidebar
│   │   │   │   ├── reader/         # BookReader (Rive + Howler.js)
│   │   │   │   └── ui/             # shadcn components
│   │   │   ├── contexts/           # AuthContext
│   │   │   ├── lib/                # api.ts (axios instance)
│   │   │   ├── pages/
│   │   │   │   ├── ai/             # AI Story Generator
│   │   │   │   ├── analytics/      # Analytics dashboard
│   │   │   │   ├── auth/           # Login, Register
│   │   │   │   ├── content/        # Book editor, Media library
│   │   │   │   ├── library/        # Book list, Book detail
│   │   │   │   ├── management/     # Schools, Users
│   │   │   │   ├── reader/         # Reader page
│   │   │   │   └── school/         # Classes, Students, Teacher hub, Curriculum
│   │   │   ├── types/              # TypeScript type definitions
│   │   │   └── App.tsx             # Routes
│   │   └── package.json
│   │
│   └── mobile/                     # React Native (Expo Router)
│       ├── app/
│       │   ├── (auth)/             # Login, Student login
│       │   ├── (tabs)/             # Library, Discover, Profile
│       │   ├── book/[id].tsx       # Book detail
│       │   └── reader/[id].tsx     # Reader
│       ├── contexts/               # AuthContext
│       └── services/               # API client, Auth service
│
├── api/src/                        # .NET 9 Solution
│   ├── Zarife.API/                 # ASP.NET Core Web API
│   │   ├── Controllers/
│   │   │   ├── AccountController.cs
│   │   │   ├── AIController.cs
│   │   │   ├── AssignmentsController.cs
│   │   │   ├── BooksController.cs
│   │   │   ├── ClassesController.cs
│   │   │   ├── ContentController.cs
│   │   │   ├── ManagementController.cs
│   │   │   ├── ProgressController.cs
│   │   │   ├── SchoolsController.cs
│   │   │   ├── StudentsController.cs
│   │   │   └── UsersController.cs
│   │   ├── Middleware/             # TenantMiddleware
│   │   └── Program.cs             # DI, Auth, CORS, Swagger
│   │
│   ├── Zarife.Core/                # Domain layer
│   │   ├── Entities/               # Book, BookPage, Class, ReadingProgress, etc.
│   │   ├── DTOs/                   # Request/Response DTOs
│   │   ├── Interfaces/             # ITenantService, ITokenService, etc.
│   │   └── Common/                 # Result pattern
│   │
│   ├── Zarife.Infrastructure/      # Data access layer
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── Migrations/         # EF Core migrations
│   │   ├── Identity/               # ApplicationUser
│   │   ├── Security/               # TokenService
│   │   └── Services/               # TenantService, AppInitializer
│   │
│   ├── Zarife.AI/                  # AI services
│   │   ├── Services/
│   │   │   ├── IStoryGenerationService.cs
│   │   │   ├── StoryGenerationService.cs  # Azure OpenAI
│   │   │   ├── ITtsService.cs
│   │   │   └── TtsService.cs              # Azure Speech
│   │   └── AiServiceExtensions.cs         # DI registration
│   │
│   ├── Zarife.Tests/               # xUnit + Moq
│   └── Zarife.sln
│
├── content/books/                  # Sample book JSON
├── .github/workflows/ci.yml       # CI pipeline
├── docker-compose.yml
├── .env                            # Environment config
├── PLAN.md                         # Implementation plan
├── RULES.md                        # Agent rules
├── CLAUDE.md                       # This file (agent context)
└── README.md                       # Project documentation
```

---

## Key Documents

- [PLAN.md](PLAN.md) - Detailed implementation plan with phases
- [RULES.md](RULES.md) - Agent rules and session notes
- [README.md](README.md) - Setup instructions and API docs

---

## Development Environment

### Docker Compose Services

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| PostgreSQL | zarife-db | 13001 | Database |
| Redis | zarife-cache | 13002 | Cache |
| MinIO API | zarife-storage | 13003 | Object storage |
| MinIO Console | zarife-storage | 13004 | Storage UI |
| .NET API | zarife-api | 13005 | Backend API |
| Vite Web | zarife-web | 13000 | Frontend |

### Quick Start

```bash
# Start all services
docker compose up -d

# Check logs
docker compose logs -f api

# Reset database (after migration changes)
docker compose down -v && docker compose up -d
```

### Running Locally (without Docker for API/Web)

```bash
# Backend
cd api/src && dotnet run --project Zarife.API

# Frontend
cd apps/web && npm run dev

# Mobile
cd apps/mobile && npx expo start

# Tests
cd api/src && dotnet test
```

---

## EF Core Migrations

**Always** generate migrations to `api/src/Zarife.Infrastructure/Data/Migrations`:

```bash
cd api/src

# Create migration
dotnet ef migrations add <MigrationName> \
  --project Zarife.Infrastructure \
  --startup-project Zarife.API \
  --output-dir Data/Migrations

# Apply migration
dotnet ef database update \
  --project Zarife.Infrastructure \
  --startup-project Zarife.API
```

After changing entities in `Zarife.Core/Entities/` or DbContext configuration, **always create a new migration** before testing.

If migrations get out of sync, delete the `Data/Migrations` folder and create a fresh `Initial` migration, then reset the database with `docker compose down -v && docker compose up -d`.

---

## Architecture Notes

### Multi-Tenancy
- Shared database, shared schema with `TenantId` column
- EF Core global query filters for automatic tenant isolation
- `TenantMiddleware` extracts tenant from JWT claims
- PlatformAdmin users have no tenant restriction

### Authentication
- ASP.NET Identity with JWT Bearer tokens
- Roles: `PlatformAdmin`, `SchoolAdmin`, `Teacher`, `Parent`, `Student`
- Student simplified login via school code + username
- Token stored in localStorage (web) / SecureStore (mobile)

### API Patterns
- Controllers return DTOs, never entities
- `[Authorize]` on all controllers, role-based with `[Authorize(Roles = "...")]`
- Swagger UI at `/swagger` in development
- CORS allows all origins in development

### Frontend Patterns
- `api.ts` axios instance with JWT interceptor and 401 redirect
- `AuthContext` provides user, token, login/logout
- Role-based route protection via `ProtectedRoute` and `DashboardRoute`
- Role-based sidebar filtering

### AI Services
- `IStoryGenerationService` - story generation and translation via Azure OpenAI
- `ITtsService` - text-to-speech via Azure Cognitive Services Speech
- Falls back gracefully when Azure credentials are not configured
- Registered via `builder.Services.AddZarifeAI()` in Program.cs

---

## Implementation Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1: Foundation | ✅ Complete | Project setup, auth, core API, admin portal |
| Phase 2: Book Player MVP | ✅ Complete | Rive reader, Howler.js audio, progress tracking |
| Phase 3: Mobile App | ✅ Complete | Expo Router, auth flows, library, reader |
| Phase 4: School Features | ✅ Complete | Teacher dashboard, curriculum, assignments |
| Phase 5: AI Integration | ✅ Complete | Story generation, translation, TTS |
| Phase 6: Launch Prep | ✅ Complete | Unit tests, CI/CD, documentation |

---

## Team

| Role | Expertise |
|------|-----------|
| **Developer** | 15+ years software engineering, .NET, React |
| **Designer** | 10+ years graphic design, PhD in art education |

---

*Last updated: 2026-02-01*
