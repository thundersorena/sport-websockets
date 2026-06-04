# Quick Debug Guide

## Current Status ✅
- Backend is running on port 8000
- Frontend is running on port 3000
- Match ID 11 was successfully created
- WebSocket connections are working

## To Test the Create Match Form

1. **Open Admin Page**: http://localhost:3000/admin
2. **Fill the form** (all fields are required):
   - Sport: `Basketball` (or any sport name)
   - Home Team: `Lakers`
   - Away Team: `Warriors`
   - Start Time: Click and select any future date/time
   - End Time: Click and select a time after start time
   - Home Score: `0` (optional)
   - Away Score: `0` (optional)

3. **Click "Create Match"**

## If You Get "Invalid data" Error

The error message will now show you **exactly what failed**. Check the browser console (F12) for:
```
Submitting match data: { ... }
API Error Details: { ... }
```

### Common Issues:

**1. Start time must be before end time**
   - Make sure End Time is after Start Time

**2. Empty team names**
   - Both Home Team and Away Team must have values

**3. Date format issues**
   - Use the datetime picker to select dates
   - Don't type dates manually

## Testing Real-Time Updates

Open 2 browser tabs side by side:
- Tab 1: http://localhost:3000 (home page)
- Tab 2: http://localhost:3000/admin (admin page)

1. In Tab 2, create a match
2. Watch Tab 1 - match appears instantly! ⚡

## Check Logs

**Frontend Console (F12):**
```
Submitting match data: { sport, homeTeam, awayTeam, startTime, endTime, ... }
```

**Backend Terminal:**
```
[ws:broadcast] Broadcasting match_created event for match: X
```

## The Form Now Shows Better Errors

Instead of generic "Invalid data", you'll see:
```
Validation Error: {
  "fieldErrors": {
    "startTime": ["startTime must be a valid ISO date string"],
    "endTime": ["endTime must be after startTime"]
  }
}
```

This tells you exactly what's wrong!

## Success Indicators

✅ Green message: "Match created successfully! Check the home page."
✅ Form fields reset
✅ New match appears in home page instantly
✅ Backend logs: `[ws:broadcast] Broadcasting match_created event for match: X`
