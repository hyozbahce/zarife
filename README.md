# Zarife - Animated Picture Book Platform

Zarife is a multi-tenant educational platform for K-12 schools, delivering AI-generated animated picture books with interactive reading experiences, narration, and analytics.

## Architecture

```
zarife/
├── api/src/                  # .NET 9 Backend
│   ├── Zarife.API/           # ASP.NET Core Web API (JWT auth, controllers)
│   ├── Zarife.Core/          # Domain entities, DTOs, interfaces
│   ├── Zarife.Infrastructure/# EF Core, Identity, MinIO storage, multi-tenancy
│   ├── Zarife.AI/            # Azure OpenAI story generation, TTS services
│   └── Zarife.Tests/         # xUnit tests with Moq
├── apps/
│   ├── web/                  # Vite + React + shadcn/ui + Tailwind v4
│   └── mobile/               # React Native + Expo Router
├── content/                  # Sample book JSON content
├── .github/workflows/        # CI/CD pipeline
└── docker-compose.yml        # PostgreSQL, Redis, MinIO (ports 13000+)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | .NET 9, ASP.NET Core, Entity Framework Core |
| Database | PostgreSQL with multi-tenant query filters |
| Auth | ASP.NET Identity + JWT Bearer tokens |
| Storage | MinIO (S3-compatible) for media assets |
| AI | Azure OpenAI (story generation, translation) |
| TTS | Azure Cognitive Services Speech (Neural TTS) |
| Web Frontend | Vite, React 19, Tailwind CSS v4, shadcn/ui |
| Mobile | React Native, Expo Router, Expo SecureStore |
| Animations | Rive (@rive-app/react-canvas) |
| Audio | Howler.js (web), expo-av (mobile) |

## Features

### Content Lab (Admin/School Admin)
- **AI Story Generator** - Generate stories with configurable topic, age range, language, and educational goals
- **Translation** - AI-powered story translation between Turkish and English
- **Text-to-Speech** - Neural TTS with word-level timing for narration sync
- **Story Builder** - Manual book creation with page management
- **Media Library** - Upload and manage Rive animations, images, and audio

### Book Reader
- Interactive animated picture books with Rive integration
- Synchronized narration audio with word highlighting
- Page navigation with keyboard, touch, and on-screen controls
- Fullscreen reading mode
- Reading progress tracking per user

### School Management
- Multi-tenant architecture (each school is a tenant)
- Class management with grade levels
- Student enrollment and profiles
- Book assignments to classes or individual students
- Teacher dashboard with class overview and student progress

### Analytics
- Reading progress tracking (pages read, time spent, completion)
- Per-student analytics for teachers
- Class-level and school-level dashboards

### Platform Administration
- School (tenant) creation and management
- User management with role-based access
- Role hierarchy: PlatformAdmin > SchoolAdmin > Teacher > Parent > Student

## Getting Started

### Prerequisites
- .NET 9 SDK
- Node.js 20+
- Docker & Docker Compose

### Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL (port 13000), Redis (port 13001), and MinIO (port 13002/13003).

### Run Backend

```bash
cd api/src
dotnet run --project Zarife.API
```

The API runs at `http://localhost:5104` with Swagger UI available at `/swagger`.

### Run Web Frontend

```bash
cd apps/web
npm install
npm run dev
```

The web app runs at `http://localhost:5173`.

### Run Mobile App

```bash
cd apps/mobile
npm install
npx expo start
```

### Run Tests

```bash
cd api/src
dotnet test
```

## API Endpoints

| Endpoint | Description |
|----------|-----------|
| `POST /api/Account/register` | Register a new user |
| `POST /api/Account/login` | Login and get JWT token |
| `GET /api/Books` | List books (with filtering) |
| `POST /api/Books` | Create a book |
| `GET /api/Books/{id}` | Get book detail with pages |
| `POST /api/AI/generate-story` | AI story generation |
| `POST /api/AI/translate` | AI translation |
| `POST /api/AI/tts` | Text-to-speech synthesis |
| `GET /api/Classes` | List classes |
| `GET /api/Students` | List students |
| `GET /api/Progress/analytics` | Reading analytics |
| `POST /api/Content/upload` | Upload media to MinIO |
| `GET /api/Assignments` | List book assignments |

## Environment Configuration

### Backend (`api/src/Zarife.API/appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=13000;Database=zarife;Username=zarife;Password=zarife"
  },
  "Jwt": {
    "Secret": "your-secret-key-min-32-chars",
    "Issuer": "Zarife",
    "Audience": "Zarife"
  },
  "Storage": {
    "Endpoint": "localhost:13002",
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin"
  },
  "AI": {
    "AzureOpenAI": {
      "Endpoint": "https://your-resource.openai.azure.com/",
      "ApiKey": "your-api-key",
      "DeploymentName": "gpt-4o"
    },
    "AzureSpeech": {
      "Key": "your-speech-key",
      "Region": "westeurope"
    }
  }
}
```

### Frontend (`apps/web/.env`)

```
VITE_API_URL=http://localhost:5104
```

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR to main:
- Backend: restore, build, test (.NET 9)
- Frontend: install, type-check, build (Node 20)
