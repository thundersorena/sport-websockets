# Sport Live - Architecture & Technology Stack

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (SPA)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js 14 + React + TypeScript               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │   Pages    │  │ Components │  │   Hooks    │     │  │
│  │  │  (SSR/CSR) │  │  (shadcn)  │  │ (WebSocket)│     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  │                                                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │  Services  │  │    Theme   │  │   Types    │     │  │
│  │  │ (API Calls)│  │  Provider  │  │(TypeScript)│     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS + WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND (API)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Express.js + Node.js Server                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │   Routes   │  │ Middleware │  │ WebSocket  │     │  │
│  │  │ (REST API) │  │(CORS/Auth) │  │   Server   │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  │                                                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │ Validation │  │  Database  │  │  Swagger   │     │  │
│  │  │   (Zod)    │  │  (Drizzle) │  │    Docs    │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         DATABASE                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             PostgreSQL (Neon Cloud)                   │  │
│  │  ┌────────────┐                  ┌────────────┐     │  │
│  │  │  Matches   │                  │ Commentary │     │  │
│  │  │   Table    │──────────────────│   Table    │     │  │
│  │  └────────────┘                  └────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Technology Stack

### Frontend Technologies

#### Core Framework

- **Next.js 14+** (App Router)
  - Server-Side Rendering (SSR)
  - Static Site Generation (SSG)
  - Client-Side Rendering (CSR)
  - File-based routing
  - API routes support

#### Language & Type Safety

- **TypeScript 5+**
  - Full type safety
  - IntelliSense support
  - Compile-time error checking
  - Interface definitions

#### Styling & UI

- **Tailwind CSS v4**
  - Utility-first CSS
  - Custom design system
  - Responsive breakpoints
  - Dark mode support

- **shadcn/ui**
  - Radix UI primitives
  - Accessible components
  - Customizable
  - Copy-paste components

#### UI Libraries

- **Radix UI**
  - Accessible primitives
  - Unstyled components
  - Keyboard navigation
  - ARIA compliant

- **Lucide React**
  - Modern icon library
  - Tree-shakeable
  - Consistent design
  - 1000+ icons

#### State & Theme

- **next-themes**
  - Dark/Light mode
  - System preference
  - Persistent storage
  - No flash on load

- **React Hooks**
  - useState, useEffect
  - Custom useWebSocket
  - useRouter, useParams

#### Utilities

- **class-variance-authority**
  - Component variants
  - Type-safe props
  - Style composition

- **clsx + tailwind-merge**
  - Conditional classes
  - Merge Tailwind classes
  - Conflict resolution

---

### Backend Technologies

#### Core Framework

- **Node.js 20+**
  - Modern JavaScript
  - ES modules
  - Async/await
  - Event-driven

- **Express.js 5**
  - Fast, unopinionated
  - Middleware support
  - Routing
  - HTTP utilities

#### Database

- **PostgreSQL** (Neon Cloud)
  - Relational database
  - ACID compliance
  - JSON support
  - Full-text search

- **Drizzle ORM**
  - Type-safe queries
  - SQL-like syntax
  - Migration support
  - Schema definition

#### Real-time Communication

- **WebSocket (ws)**
  - Bidirectional communication
  - Low latency
  - Event-based
  - Auto-reconnect (client)

#### Validation

- **Zod**
  - TypeScript-first
  - Runtime validation
  - Type inference
  - Error messages

#### Documentation

- **Swagger/OpenAPI**
  - Interactive API docs
  - Request testing
  - Schema definitions
  - Auto-generated

#### Security

- **Arcjet**
  - Rate limiting
  - Bot protection
  - Security rules
  - DDoS protection

- **CORS**
  - Cross-origin requests
  - Credential support
  - Origin whitelisting

#### Development

- **dotenv**
  - Environment variables
  - Configuration management
  - Secrets protection

- **Node --watch**
  - Hot reload
  - Auto-restart
  - Development mode

---

## 📊 Data Flow

### 1. Match List Page (SSR)

```
User visits /
    ↓
Next.js renders page (SSR)
    ↓
Client component mounts
    ↓
useEffect calls matchesService.getMatches()
    ↓
API client sends GET /api/matches
    ↓
Backend validates & queries database
    ↓
Returns matches array
    ↓
Component updates state
    ↓
UI re-renders with match cards
```

### 2. Real-time Updates (WebSocket)

```
Component mounts
    ↓
useWebSocket hook connects to ws://localhost:8000/ws
    ↓
Connection established
    ↓
Backend broadcasts new match/commentary
    ↓
Client receives message
    ↓
Hook updates lastMessage state
    ↓
useEffect detects change
    ↓
Component updates matches array
    ↓
UI re-renders with new data
```

### 3. Match Detail Page (Dynamic Route)

```
User clicks match card
    ↓
Router navigates to /match/[id]
    ↓
Page component extracts id from params
    ↓
Parallel API calls:
  - matchesService.getMatch(id)
  - commentaryService.getCommentary(id)
    ↓
Backend fetches from database
    ↓
Returns match + commentary data
    ↓
Component updates state
    ↓
UI renders match details + commentary list
```

---

## 🔐 Security Features

### Frontend Security

- **Environment Variables**: Secrets not in code
- **HTTPS Ready**: Production SSL support
- **XSS Protection**: React escapes by default
- **Type Safety**: TypeScript prevents errors

### Backend Security

- **CORS**: Origin whitelisting
- **Rate Limiting**: Arcjet protection
- **Input Validation**: Zod schemas
- **SQL Injection**: Drizzle ORM parameterized queries
- **Environment Variables**: dotenv for secrets

---

## 🚀 Performance Optimizations

### Frontend

- **SSR**: Faster initial page load
- **Code Splitting**: Automatic by Next.js
- **Image Optimization**: Next.js Image component
- **CSS Optimization**: Tailwind purges unused
- **Lazy Loading**: Dynamic imports
- **WebSocket**: Efficient real-time updates

### Backend

- **Connection Pooling**: Database connections
- **JSON Parsing**: Only when needed
- **Middleware Order**: Optimized for performance
- **Query Optimization**: Indexed database columns
- **Caching Ready**: Can add Redis

---

## 📱 Responsive Design Strategy

### Breakpoints

```css
Mobile:  < 640px   (sm)
Tablet:  640-1024px (md, lg)
Desktop: > 1024px   (xl, 2xl)
```

### Approach

1. **Mobile-First**: Base styles for mobile
2. **Progressive Enhancement**: Add features for larger screens
3. **Flexible Grid**: CSS Grid & Flexbox
4. **Fluid Typography**: Responsive font sizes
5. **Touch-Friendly**: Large tap targets

---

## 🎨 Design System

### Colors

- **Primary**: Action buttons, links
- **Secondary**: Supporting elements
- **Accent**: Highlights
- **Muted**: Background, subtle text
- **Destructive**: Errors, warnings
- **Success/Warning/Info**: Status badges

### Typography

- **Headings**: Bold, clear hierarchy
- **Body**: Readable, optimal line height
- **Mono**: Code, technical data

### Components

- **Cards**: Match displays, commentary
- **Buttons**: Actions, navigation
- **Badges**: Status indicators
- **Tabs**: Content filtering

---

## 🔄 State Management

### Client State

- **React useState**: Component-level state
- **React useEffect**: Side effects
- **Custom Hooks**: Reusable logic (useWebSocket)

### Server State

- **API Services**: Fetch data from backend
- **WebSocket**: Real-time updates
- **No Redux**: Simple enough without it

---

## 🧪 Testing Strategy (Future)

### Frontend

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Playwright/Cypress
- **Type Checking**: TypeScript compiler
- **Linting**: ESLint

### Backend

- **Unit Tests**: Jest/Mocha
- **Integration Tests**: Supertest
- **API Tests**: Swagger/Postman
- **Database Tests**: Test database

---

## 📈 Scalability Considerations

### Current Setup (Good for 1000s of users)

- Single server deployment
- Direct database connection
- WebSocket per connection

### Future Scaling (10,000+ users)

- **Load Balancer**: Nginx/HAProxy
- **Horizontal Scaling**: Multiple backend instances
- **Redis**: Caching + WebSocket pub/sub
- **CDN**: Static asset delivery
- **Database**: Read replicas, connection pooling
- **Monitoring**: Logging, metrics, alerts

---

## 🛠️ Development Workflow

### Local Development

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Edit code (hot reload enabled)
4. Test in browser
5. Check API docs: `http://localhost:8000/api-docs`

### Production Deployment

1. Build frontend: `npm run build`
2. Set environment variables
3. Deploy backend to Node hosting (Heroku, Railway, Render)
4. Deploy frontend to Vercel/Netlify
5. Configure environment URLs
6. Test live deployment

---

## 📚 File Organization Principles

### Frontend

- **Co-location**: Related files together
- **Feature-based**: Group by feature
- **Reusability**: Shared components in ui/
- **Type Safety**: Types in types/
- **Separation**: Logic in services/, UI in components/

### Backend

- **Layered Architecture**: Routes → Validation → Database
- **Single Responsibility**: Each file has one purpose
- **Modularity**: Easy to add new features
- **Configuration**: Environment-based settings

---

## 🎯 Key Features Implementation

### Server-Side Rendering (SSR)

- Next.js App Router with React Server Components
- Fast initial page load
- SEO friendly
- Progressive enhancement

### Dark/Light Mode

- next-themes for theme management
- CSS variables for colors
- System preference detection
- Smooth transitions

### Real-time Updates

- WebSocket connection
- Auto-reconnect on disconnect
- Event-based messaging
- Optimistic UI updates

### Responsive Design

- Tailwind breakpoints
- Mobile-first approach
- Flexible layouts
- Touch-optimized

---

## 🏆 Best Practices Followed

1. **Type Safety**: TypeScript everywhere possible
2. **Component Composition**: Reusable, composable components
3. **Error Handling**: Try-catch blocks, user feedback
4. **Loading States**: Skeleton screens, spinners
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Performance**: Code splitting, lazy loading
7. **Security**: Input validation, CORS, environment variables
8. **Documentation**: Code comments, README files
9. **Consistency**: Naming conventions, file structure
10. **Scalability**: Modular design, easy to extend

---

**This architecture provides a solid foundation for a modern, scalable, and maintainable sports tracking application!** 🚀
