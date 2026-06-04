# Sport Live - Frontend

A modern, responsive single-page application (SPA) with Server-Side Rendering (SSR) for real-time sports match tracking and live commentary.

## 🚀 Features

- ✨ **Modern UI/UX** with shadcn/ui components
- 🌓 **Dark/Light Mode** support with system preference detection
- 📱 **Fully Responsive** design for all devices
- ⚡ **Real-time Updates** via WebSocket connections
- 🎯 **Live Match Commentary** with detailed event tracking
- 🔄 **SSR with Next.js 14+** App Router
- 🎨 **Tailwind CSS v4** for styling
- 📊 **Match Filtering** by status (All, Live, Scheduled, Finished)

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Theme**: next-themes
- **Real-time**: WebSocket API

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   ├── page.tsx            # Home page (match list)
│   │   └── match/[id]/         # Dynamic match detail page
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── header.tsx          # App header with navigation
│   │   ├── match-card.tsx      # Match display card
│   │   ├── match-list.tsx      # Match list with filtering
│   │   ├── commentary-item.tsx # Commentary display
│   │   ├── theme-provider.tsx  # Theme context provider
│   │   └── theme-toggle.tsx    # Dark/light mode toggle
│   ├── hooks/                  # Custom React hooks
│   │   └── useWebSocket.ts     # WebSocket connection hook
│   ├── services/               # API service layers
│   │   ├── matches.ts          # Match API service
│   │   └── commentary.ts       # Commentary API service
│   ├── lib/                    # Utilities
│   │   ├── api-client.ts       # HTTP client wrapper
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
│       └── api.ts              # API type definitions
├── .env.local                  # Environment variables
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create `.env.local` file (already created):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Features Walkthrough

### Home Page (/)

- Displays all matches in a responsive grid
- Filter matches by status (All, Live, Scheduled, Finished)
- Real-time updates for new matches
- Click any match to view details

### Match Detail Page (/match/[id])

- Live match score display
- Real-time commentary feed
- Match status and timing information
- Live update indicator
- Event-specific icons (goals, cards, substitutions, etc.)

### Theme Support

- System preference detection
- Manual toggle between dark/light modes
- Persistent theme selection
- Smooth transitions

### Real-time Features

- WebSocket connection with auto-reconnect
- Live match creation notifications
- Real-time commentary updates
- Connection status indicator

## 🔌 API Integration

The frontend connects to the backend API with the following endpoints:

- `GET /api/matches` - List all matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches` - Create new match
- `PATCH /api/matches/:id/score` - Update match score
- `GET /api/matches/:id/commentary` - Get match commentary
- `POST /api/matches/:id/commentary` - Add commentary
- `WS /ws` - WebSocket for real-time updates

## 🎨 Customization

### Theme Colors

Edit `src/app/style/globals.css` to customize theme colors:

```css
:root {
  --primary: 0 0% 9%;
  --secondary: 0 0% 96.1%;
  /* Add more custom colors */
}
```

### Components

All UI components are in `src/components/ui/` and can be customized using Tailwind CSS classes.

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🐛 Troubleshooting

### API Connection Issues

1. Ensure backend is running on `http://localhost:8000`
2. Check `.env.local` configuration
3. Verify CORS settings on backend

### WebSocket Not Connecting

1. Confirm backend WebSocket server is running
2. Check `NEXT_PUBLIC_WS_URL` in `.env.local`
3. Look for errors in browser console

## 📄 License

Created by ThunderSorena (Pouya Ahmadi)

## 🤝 Contributing

This is a tutorial project. Feel free to use and modify as needed!
