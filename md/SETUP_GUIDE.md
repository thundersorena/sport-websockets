# Sport Live - Complete Setup Guide

## 🎯 Project Overview

A modern full-stack sports tracking application with real-time updates, featuring:
- **Backend**: Node.js + Express + PostgreSQL (Neon) + WebSocket
- **Frontend**: Next.js 14 + TypeScript + shadcn/ui + Tailwind CSS v4

---

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js 20+** installed
- **npm** or **yarn** package manager
- **Git** (optional, for version control)

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already done)
npm install

# Environment is already configured in .env file
# DATABASE_URL, PORT, HOST, FRONTEND_URL, ARCJET settings

# Run database migrations (if needed)
npm run db:migrate

# Start backend server
npm run dev
```

Backend will be running at: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/api-docs`
- WebSocket: `ws://localhost:8000/ws`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Dependencies are already installed
# If you need to reinstall: npm install

# Environment is already configured in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Start frontend development server
npm run dev
```

Frontend will be running at: `http://localhost:3000`

### 3. Access the Application

1. Open your browser to `http://localhost:3000`
2. You should see the Sport Live homepage with match listings
3. Toggle between light/dark mode using the theme button in the header

---

## 📁 Project Structure

```
sport/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── index.js           # Main server file with CORS
│   │   ├── routes/            # API route handlers
│   │   │   ├── matches.js     # Match endpoints
│   │   │   └── commentary.js  # Commentary endpoints
│   │   ├── db/                # Database configuration
│   │   │   ├── db.js          # Drizzle ORM setup
│   │   │   └── schema.js      # Database schema
│   │   ├── ws/                # WebSocket server
│   │   │   └── server.js      # Real-time connection handler
│   │   └── validation/        # Zod validation schemas
│   ├── .env                   # Environment variables
│   └── package.json
│
└── frontend/                   # Next.js React app
    ├── src/
    │   ├── app/               # Next.js App Router
    │   │   ├── layout.tsx     # Root layout with theme
    │   │   ├── page.tsx       # Home page
    │   │   └── match/[id]/    # Dynamic match detail page
    │   ├── components/        # React components
    │   │   ├── ui/            # shadcn/ui components
    │   │   ├── header.tsx     # App header
    │   │   ├── match-card.tsx # Match display card
    │   │   ├── match-list.tsx # Match list with filters
    │   │   └── commentary-item.tsx
    │   ├── hooks/             # Custom hooks
    │   │   └── useWebSocket.ts
    │   ├── services/          # API services
    │   │   ├── matches.ts
    │   │   └── commentary.ts
    │   ├── lib/               # Utilities
    │   │   ├── api-client.ts
    │   │   └── utils.ts
    │   └── types/             # TypeScript types
    │       └── api.ts
    ├── .env.local             # Environment variables
    └── package.json
```

---

## 🔧 Configuration Details

### Backend Configuration (.env)

```env
# Database (Neon PostgreSQL)
DATABASE_URL=your_neon_connection_string

# Server
PORT=8000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Security (Arcjet)
ARCJET_KEY=your_key
ARCJET_ENV=development
ARCJET_MODE=DRY_RUN
```

### Frontend Configuration (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## 🎨 Key Features

### 1. Match Management
- View all matches in a responsive grid
- Filter by status: All, Live, Scheduled, Finished
- Real-time match creation notifications
- Click any match to view details

### 2. Match Details
- Live score display
- Real-time commentary feed
- Match timing and status
- Event-specific icons (⚽ goals, 🟨 cards, etc.)

### 3. Theme System
- **Dark Mode**: Full dark theme support
- **Light Mode**: Clean light theme
- **System Mode**: Follows OS preference
- **Persistent**: Theme choice saved in localStorage

### 4. Real-time Updates
- WebSocket connection with auto-reconnect
- Live match creation broadcasts
- Real-time commentary updates
- Connection status indicator

### 5. Responsive Design
- **Mobile**: Optimized for phones (< 640px)
- **Tablet**: Adjusted layouts (640px - 1024px)
- **Desktop**: Full experience (> 1024px)

---

## 📡 API Endpoints

### Matches

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | List all matches |
| GET | `/api/matches/:id` | Get match by ID |
| POST | `/api/matches` | Create new match |
| PATCH | `/api/matches/:id/score` | Update score |

### Commentary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches/:id/commentary` | Get match commentary |
| POST | `/api/matches/:id/commentary` | Add commentary entry |

### WebSocket

- **URL**: `ws://localhost:8000/ws`
- **Events**:
  - `match-created`: New match created
  - `commentary`: New commentary added

---

## 🧪 Testing the Application

### 1. Create a Match

Use the Swagger UI at `http://localhost:8000/api-docs`:

```json
POST /api/matches
{
  "sport": "Football",
  "homeTeam": "Team A",
  "awayTeam": "Team B",
  "startTime": "2026-06-04T15:00:00Z",
  "endTime": "2026-06-04T17:00:00Z",
  "homeScore": 0,
  "awayScore": 0
}
```

### 2. Add Commentary

```json
POST /api/matches/1/commentary
{
  "minute": 15,
  "sequence": 1,
  "period": "1st Half",
  "eventType": "goal",
  "actor": "John Doe",
  "team": "Team A",
  "message": "Amazing goal from the center!",
  "tags": ["highlight", "goal"]
}
```

### 3. Watch Real-time Updates

Open multiple browser windows to see real-time updates across all clients.

---

## 🎨 Customization

### Change Theme Colors

Edit `frontend/src/app/style/globals.css`:

```css
:root {
  --primary: 0 0% 9%;           /* Primary color */
  --secondary: 0 0% 96.1%;      /* Secondary color */
  --accent: 0 0% 96.1%;         /* Accent color */
  /* Modify as needed */
}
```

### Add New Components

1. Create component in `frontend/src/components/`
2. Use shadcn/ui primitives from `components/ui/`
3. Style with Tailwind CSS classes

### Add New API Endpoints

1. Create route in `backend/src/routes/`
2. Add validation schema in `backend/src/validation/`
3. Register route in `backend/src/index.js`

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

**Issue**: API errors or "Failed to fetch"

**Solutions**:
1. Ensure backend is running: `cd backend && npm run dev`
2. Check backend URL in `frontend/.env.local`
3. Verify CORS is enabled in backend
4. Check browser console for errors

### WebSocket Not Connecting

**Issue**: No real-time updates

**Solutions**:
1. Confirm backend WebSocket server is running
2. Check `NEXT_PUBLIC_WS_URL` in `.env.local`
3. Look for WebSocket errors in browser console
4. Try refreshing the page

### Database Connection Errors

**Issue**: Backend fails to start

**Solutions**:
1. Verify `DATABASE_URL` in `backend/.env`
2. Check Neon database is active
3. Run migrations: `npm run db:migrate`

### Port Already in Use

**Issue**: "Port 3000/8000 already in use"

**Solutions**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in .env files
# Backend: PORT=8001
# Frontend: Run on different port
```

---

## 📦 Production Deployment

### Backend

```bash
# Build and start
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start src/index.js --name "sport-backend"
```

### Frontend

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
# vercel deploy
```

---

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Drizzle ORM**: https://orm.drizzle.team
- **Express.js**: https://expressjs.com

---

## 👨‍💻 Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Type Safety**: Frontend uses TypeScript for type checking
3. **Code Quality**: Use ESLint for code linting
4. **API Testing**: Use Swagger UI for API testing
5. **Debugging**: Use browser DevTools and VS Code debugger

---

## ✅ Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Database connected successfully
- [ ] WebSocket connection established
- [ ] Can view match list
- [ ] Can view match details
- [ ] Theme toggle works
- [ ] Real-time updates working

---

## 🎉 Success!

If all checks pass, your Sport Live application is fully functional! You can now:

1. **Create matches** via API or Swagger UI
2. **Add commentary** to matches
3. **View real-time updates** across all connected clients
4. **Toggle themes** for optimal viewing
5. **Access on any device** with responsive design

Enjoy your modern sports tracking application! 🏆

---

**Created by**: ThunderSorena (Pouya Ahmadi)  
**Date**: June 2026  
**License**: Free to use and modify
