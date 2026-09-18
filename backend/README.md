# Maestro Musician Portfolio & Artist Management Backend API

A production-grade RESTful API backend built with **Node.js**, **Express**, and **TypeScript**, specifically architected to power classical concert artist portfolios, discography management, tour calendars, promoter booking inquiries, and AI program notes.

---

## 🛠 Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+ or v20+ recommended)
- **Framework:** [Express.js](https://expressjs.com/) (v4.21+)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (v5+) with strict mode and ESM resolution
- **Payload Validation:** [Zod](https://zod.dev/) for type-safe schema parsing & runtime sanitization
- **AI Engine:** Google Gemini API (`@google/genai` SDK) for intelligent concert program notes and biography refinement
- **CORS & Middleware:** `cors`, `dotenv`, Express JSON streaming middleware
- **Dev Runner:** `tsx` for high-performance TypeScript hot reload
- **Containerization:** Production multi-stage `Dockerfile`

---

## 📁 Project Folder Structure

```text
backend/
├── src/
│   ├── server.ts               # Main Express entry point & middleware setup
│   ├── routes/                 # REST API Route controllers
│   │   ├── health.ts           # Health check & system diagnostics
│   │   ├── tracks.ts           # Discography CRUD & audio management
│   │   ├── events.ts           # Concert dates & tour itinerary
│   │   ├── bookings.ts         # Performance booking requests & status workflow
│   │   ├── profile.ts          # Artist biography & press materials
│   │   ├── stats.ts            # Global stream counts & performance metrics
│   │   └── ai.ts               # Gemini AI notes generation & bio polish
│   ├── data/
│   │   ├── store.ts            # Data store layer & in-memory database abstraction
│   │   └── initialData.ts      # Curated artist catalog & itinerary seed data
│   └── types/
│       └── index.ts            # Shared TypeScript interfaces & types
├── .env.example                # Sample environment configuration
├── .gitignore                  # Git exclusions for node_modules, build artifacts
├── Dockerfile                  # Multi-stage production container build
├── package.json                # Dependencies, build scripts & metadata
├── tsconfig.json               # TypeScript compiler options
└── README.md                   # Complete documentation
```

---

## 🚀 Quickstart (Local Development)

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- npm, yarn, or pnpm

### 2. Installation
Navigate into the `backend/` directory:
```bash
cd backend
npm install
```

### 3. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
Edit `.env` as required:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=*
```

### 4. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

Build and run using the included production Dockerfile:

```bash
# Build the Docker image
docker build -t maestro-backend .

# Run the container on port 5000
docker run -p 5000:5000 -e GEMINI_API_KEY=your_key maestro-backend
```

---

## 📡 API Endpoints Reference

### 1. System & Diagnostic
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API service directory and overview |
| `GET` | `/api/health` | Service uptime, memory metrics, and runtime health |
| `GET` | `/api/stats` | Global stream count, upcoming shows count, and booking stats |

### 2. Discography (`/api/tracks`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tracks` | List all tracks. Query params: `?category=Solo+Piano` or `?search=Nocturne` |
| `GET` | `/api/tracks/:id` | Fetch details for a specific track |
| `POST` | `/api/tracks` | Add a new track release (Validated with Zod) |
| `PUT` | `/api/tracks/:id` | Update track metadata |
| `DELETE` | `/api/tracks/:id` | Remove a track |

### 3. Tour Dates & Events (`/api/events`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List all scheduled concerts & masterclasses |
| `GET` | `/api/events/:id` | Fetch specific event |
| `POST` | `/api/events` | Create new tour date |
| `PUT` | `/api/events/:id` | Update event information |
| `DELETE` | `/api/events/:id` | Cancel/remove an event |

### 4. Booking Proposals (`/api/bookings`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bookings` | List all booking proposals (Filter: `?status=Pending`) |
| `GET` | `/api/bookings/:id` | Fetch single booking proposal |
| `POST` | `/api/bookings` | Submit new inquiry (client name, venue, date, budget, message) |
| `PATCH` | `/api/bookings/:id/status` | Update proposal status (`Pending`, `Confirmed`, `Declined`) |
| `DELETE` | `/api/bookings/:id` | Delete booking record |

### 5. Artist Profile (`/api/profile`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile` | Retrieve artist biography, photos, quotes, and agency contacts |
| `PUT` | `/api/profile` | Update artist profile information |

### 6. AI Features (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/program-notes` | Generate playbill concert program notes for a piece |
| `POST` | `/api/ai/refine-bio` | Polish artist bio for festival submissions or press releases |

---

## 💻 How to Push to GitHub

### Option A: Push just the Backend repository to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial commit: Maestro Musician Portfolio Node.js Backend"
git branch -M main
git remote add origin https://github.com/<your-username>/maestro-backend.git
git push -u origin main
```

### Option B: Keep inside the Monorepo
You can also commit the entire project (with `frontend/` and `backend/`) together to GitHub in one repository.

---

## 📄 License
MIT License. Created for Maestro Classical Musician & Artist Portfolio.
