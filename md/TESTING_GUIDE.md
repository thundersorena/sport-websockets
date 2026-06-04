# Testing Guide - Sport Live Application

## Servers Running ✅

- **Backend**: http://localhost:8000 (WebSocket: ws://localhost:8000/ws)
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/api-docs

## How to Test All Features

### 1. Test Real-Time Match Creation

1. Open http://localhost:3000 in your browser
2. You should see "Live updates enabled" with a green dot
3. Click **"Admin"** in the header
4. Go to **"Create Match"** tab
5. Fill in the form:
   - Sport: `Football`
   - Home Team: `Manchester United`
   - Away Team: `Liverpool`
   - Start Time: Select a future date/time
   - End Time: Select a time after start time
   - Scores: Leave as 0 or set custom scores
6. Click **"Create Match"**
7. **Open another browser tab** to http://localhost:3000
8. The new match should appear **instantly in both tabs** via WebSocket! ⚡

### 2. Test Real-Time Score Updates

1. In the Admin page, go to **"Update Score"** tab
2. Select a match from the dropdown
3. Change the scores (e.g., Home: 2, Away: 1)
4. Click **"Update Score"**
5. **In another tab**, open the match detail page
6. The score should update **instantly** without refreshing! ⚡

### 3. Test Real-Time Commentary

1. In the Admin page, go to **"Add Commentary"** tab
2. Select a match
3. Fill in the commentary fields:
   - Minute: `45`
   - Sequence: `0`
   - Period: `1st Half`
   - Event Type: `goal`
   - Actor: `Ronaldo`
   - Team: `Home`
   - Message: `GOAL! Amazing strike from outside the box!`
4. Click **"Add Commentary"**
5. **In another tab**, open the match detail page
6. The commentary should appear **instantly at the top** of the list! ⚡

### 4. Test Match Filtering

1. Go to home page (http://localhost:3000)
2. Create matches with different statuses (scheduled, live, finished)
3. Use the tabs to filter:
   - **All**: Shows all matches
   - **Live**: Only live matches
   - **Scheduled**: Only scheduled matches
   - **Finished**: Only finished matches

### 5. Test Dark/Light Mode

1. Click the theme toggle button (sun/moon icon) in the header
2. The entire app switches between light and dark themes instantly
3. Theme is saved in browser (persists on refresh)

### 6. Test Responsive Design

1. Resize your browser window or open dev tools (F12)
2. Test mobile view (< 768px width)
3. Test tablet view (768px - 1024px width)
4. Test desktop view (> 1024px width)
5. All components should adapt perfectly

## API Testing with Swagger

Open http://localhost:8000/api-docs to see all available endpoints:

### Available Endpoints:

**Matches:**
- `GET /api/matches` - List all matches
- `POST /api/matches` - Create a new match
- `GET /api/matches/{id}` - Get match by ID
- `PATCH /api/matches/{id}/score` - Update match score

**Commentary:**
- `GET /api/matches/{id}/commentary` - Get match commentary
- `POST /api/matches/{id}/commentary` - Add new commentary

## WebSocket Events

Your frontend automatically subscribes to these events:

1. **`match_created`**: New match created → appears in match list instantly
2. **`score_update`**: Score updated → updates match card and detail page instantly
3. **`commentary`**: New commentary → appears in match detail page instantly

## Troubleshooting

### WebSocket Not Connecting
- Check backend is running on port 8000
- Check console for WebSocket errors
- Backend logs show WebSocket connections

### "Invalid data" Error
- Ensure start time is before end time
- Ensure all required fields are filled
- Check browser console for detailed errors

### No Real-Time Updates
- Check green "Live updates enabled" indicator
- Try refreshing the page
- Check both frontend and backend terminals for errors

## Success Criteria ✅

All features working correctly when:
- ✅ Green "Live updates enabled" shows on home page
- ✅ New matches appear instantly in all open tabs
- ✅ Score updates appear instantly in match detail pages
- ✅ Commentary appears instantly in match detail pages
- ✅ No WebSocket errors in console (the empty {} error is harmless and fixed)
- ✅ All forms work without errors
- ✅ Dark/light mode switches smoothly
- ✅ Mobile, tablet, and desktop views look perfect

## Demo Workflow

**Perfect demo to showcase everything:**

1. Open 3 browser tabs:
   - Tab 1: Home page (http://localhost:3000)
   - Tab 2: Admin page (http://localhost:3000/admin)
   - Tab 3: Will open match detail page

2. **In Tab 2 (Admin)**, create a new match with status "live"

3. **Watch Tab 1 (Home)** - match appears instantly! 🎉

4. **In Tab 1**, click the new match to open detail page (this is Tab 3 now)

5. **In Tab 2 (Admin)**, go to "Update Score" tab:
   - Select your match
   - Change scores to 1-0
   - Submit

6. **Watch Tab 3 (Match Detail)** - score updates instantly! 🎉

7. **In Tab 2 (Admin)**, go to "Add Commentary" tab:
   - Select your match
   - Add commentary: "15 min - GOAL! Home team scores!"
   - Submit

8. **Watch Tab 3 (Match Detail)** - commentary appears at the top instantly! 🎉

9. **In Tab 1 (Home)**, notice the match card also shows updated score instantly! 🎉

**This proves all real-time features work perfectly!** ⚡🚀

## Architecture Highlights

- **Frontend**: Next.js 14 App Router with React 19, TypeScript, Tailwind CSS v4
- **Backend**: Node.js 20, Express 5, PostgreSQL (Neon), WebSocket (ws package)
- **Real-time**: WebSocket for instant updates across all connected clients
- **Security**: Arcjet for rate limiting and security
- **Validation**: Zod for type-safe validation
- **ORM**: Drizzle ORM with PostgreSQL
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS v4 with OKLCH colors and dark mode
- **Icons**: Lucide React

Enjoy your modern, real-time sports tracking application! 🏆⚽🎮
