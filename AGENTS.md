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
| **Web** | Vite + React + shadcn/ui + Tailwind |
| **Mobile/Tablet** | React Native (Expo) |
| **Backend** | .NET 9 (ASP.NET Core) |
| **Database** | PostgreSQL |
| **Animation** | Rive (rive.app) with State Machines |
| **Storage** | Azure Blob Storage |
| **AI** | Azure OpenAI, Azure TTS |

---

## Project Structure

```
zarife/
├── apps/
│   ├── web/          # Vite + React + shadcn
│   └── mobile/       # React Native (Expo)
├── api/              # .NET Core Solution
├── content/          # Book content (dev)
├── docs/             # Documentation
└── plan.md           # Implementation plan
```

---

## Key Documents

- [plan.md](plan.md) - Detailed implementation plan with phases
- [RULES.md](RULES.md) - Agent rules and session notes

## Project-Specific Rules

- Always generate EF Core migrations to `api/src/Zarife.Infrastructure/Data/Migrations` using:
```
dotnet ef migrations add Initial \
  --project api/src/Zarife.Infrastructure \
  --startup-project api/src/Zarife.API \
  -o Data/Migrations
```

---

## Team

| Role | Expertise |
|------|-----------|
| **Developer** | 15+ years software engineering, .NET, React |
| **Designer** | 10+ years graphic design, PhD in art education |

---

*Last updated: 2026-02-01*
