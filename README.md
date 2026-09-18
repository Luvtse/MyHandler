# WORIYA EXPRESS

A full-stack web application monorepo featuring a React frontend and Express.js API backend.

## Project Structure

```
woriya-express/
├── apps/
│   ├── api/              # Express.js backend with Prisma ORM
│   └── web/              # React frontend with Vite
├── packages/
│   ├── api-client/       # Shared API client library
│   └── contracts/        # Shared types and contracts
├── package.json          # Root package.json with workspace configuration
└── tsconfig.json         # Root TypeScript configuration
```

## Tech Stack

### Frontend (`apps/web`)
- **React 18** with TypeScript
- **Vite** for build tooling
- **Material-UI** & **Radix UI** for components
- **Tailwind CSS** for styling
- **React Router** for routing
- **TanStack Query** for data fetching
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **FullCalendar** for calendar functionality
- **Recharts** for data visualization

### Backend (`apps/api`)
- **Express.js** with TypeScript
- **Prisma ORM** for database management
- **Passport.js** for authentication (Google & GitHub OAuth)
- **JWT** for token-based authentication
- **bcryptjs** for password hashing
- **Nodemailer** for email functionality
- **Multer** for file uploads
- **Zod** for validation

### Shared Packages
- **api-client**: Type-safe API client for frontend-backend communication
- **contracts**: Shared types and interfaces

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- PostgreSQL (for the API)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up the database (for the API):

```bash
cd apps/api
npm run setup
```

This will run Prisma migrations and seed the database.

### Environment Variables

Create `.env` files in the respective app directories:

#### `apps/api/.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/woriya_express"
JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
```

#### `apps/web/.env`
```env
VITE_API_URL="http://localhost:3001"
```

### Development

Run both the frontend and backend in development mode:

```bash
# Terminal 1 - Start the API
npm run dev:api

# Terminal 2 - Start the Web App
npm run dev:web
```

The applications will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Build

Build both applications for production:

```bash
npm run build
```

### Linting

Run linting across the project:

```bash
npm run lint
```

## Available Scripts

### Root Level
| Script | Description |
|--------|-------------|
| `npm run dev:web` | Start frontend development server |
| `npm run dev:api` | Start backend development server |
| `npm run build` | Build both apps for production |
| `npm run lint` | Run ESLint on the web app |

### API (`apps/api`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start API in development mode |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed the database |
| `npm run setup` | Setup database (migrate + seed) |

### Web (`apps/web`)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |

## Database

The API uses PostgreSQL with Prisma as the ORM. To manage the database:

```bash
cd apps/api

# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# View data in Prisma Studio
npm run prisma:studio

# Seed the database
npm run prisma:seed
```

## Authentication

The application supports multiple authentication methods:
- Email/Password with JWT
- Google OAuth 2.0
- GitHub OAuth 2.0

## License

Private - All rights reserved
