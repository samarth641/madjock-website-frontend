# Debugging Featured Businesses

## Issue
Popular Businesses section is not showing featured ads from the backend.

## Current Setup

### API Endpoint
- **Endpoint**: `GET /api/admin/featured/all`
- **Location**: `src/lib/api.ts` → `getFeaturedBusinesses()`

### Home Page
- **Location**: `src/app/page.tsx`
- Calls `getFeaturedBusinesses()` on line 10

## Debugging Steps

### 1. Check if Backend is Running

Open a terminal and run:
```bash
cd f:\Project-Madjock\backend\backend
node server.js
```

Verify it shows:
```
🚀 Server running on port 5000
```

### 2. Test the Featured Endpoint Directly

Open your browser or Postman and test:
```
GET http://localhost:5000/api/admin/featured/all
```

**Expected Response:**
```json
{
  "businesses": [
    { "_id": "...", "businessName": "...", ... }
  ]
}
```

OR

```json
[
  { "_id": "...", "businessName": "...", ... }
]
```

### 3. Check Browser Console

1. Open http://localhost:3000
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for:
   - ✅ No warnings = Backend connected
   - ⚠️ "Backend unavailable" = Backend not running
   - Network errors = Check endpoint

### 4. Check Network Tab

1. In DevTools, go to Network tab
2. Refresh the page
3. Look for request to `featured/all`
4. Check:
   - Status: Should be 200
   - Response: Should contain businesses

## Common Issues & Solutions

### Issue: "Backend unavailable" warning
**Solution**: Start the backend server (see step 1)

### Issue: Empty array returned
**Solution**: Add featured businesses to your database
```bash
# Use Postman or MongoDB to add businesses with featured flag
```

### Issue: 404 Not Found
**Solution**: The `/api/admin/featured/all` endpoint might not exist in your backend
- Check `backend/backend/routes/featured.routes.js`
- Verify the route is mounted in `server.js`

### Issue: CORS error
**Solution**: Backend needs CORS enabled (should already be in server.js)

## Quick Test with Mock Data

If you want to see if the component works, the API automatically falls back to mock data when backend is unavailable. You should see 3 sample businesses.

## Verify API Client

Check `src/lib/api.ts` line 39-60:
```typescript
export const getFeaturedBusinesses = async (): Promise<Business[]> => {
    try {
        const response = await apiClient.get('/api/admin/featured/all');
        // ... handles response
    } catch (error) {
        console.warn('⚠️ Backend unavailable, using mock data');
        return mockBusinesses.slice(0, 3);
    }
};
```

## Next Steps

1. **Start backend** if not running
2. **Check browser console** for errors
3. **Verify endpoint** returns data
4. **Check database** has featured businesses

If the endpoint doesn't exist in your backend, we may need to:
- Use a different endpoint
- Create the featured endpoint
- Use filtered businesses instead
