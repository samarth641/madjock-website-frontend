# MadJock Website

A modern Next.js website with JustDial-inspired UI for the MadJock business directory platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The website will be available at **http://localhost:3000**

## 🔌 Backend Connection

### Option 1: Use Mock Data (No Backend Required)
The website automatically uses mock data when the backend is unavailable. You'll see warnings in the console like:
```
⚠️ Backend unavailable, using mock data for businesses
```

This allows you to see the website working with 6 sample businesses immediately!

### Option 2: Connect to Real Backend
To connect to your MadJock backend API:

1. **Start the backend server** (in a separate terminal):
   ```bash
   cd ../backend/backend
   node server.js
   ```
   The backend should start on port 5000.

2. **Verify backend is running**:
   Open http://localhost:5000 in your browser. You should see:
   ```
   ✅ MJ-SALES Backend Running
   ```

3. **Refresh the website**:
   The website will automatically connect to the backend and fetch real data!

### Environment Variables
The API base URL is configured in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Change this if your backend runs on a different port or URL.

## 📁 Project Structure

```
Website/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx           # Home page
│   │   ├── businesses/        # Business listing & details
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   └── mockData.ts       # Sample data
│   ├── types/                # TypeScript types
│   └── styles/               # Global styles
├── package.json
└── .env.local                # Environment variables
```

## 🎨 Features

- ✅ Modern, premium UI with glassmorphism effects
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Search & filter businesses
- ✅ Category browsing
- ✅ Business detail pages
- ✅ Automatic mock data fallback
- ✅ SEO optimized

## 🛠️ Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📝 Notes

- The website uses **mock data** by default when the backend is unavailable
- Mock data includes 6 sample businesses with images from Unsplash
- All API errors are handled gracefully - the website never crashes
- Console warnings help you understand when mock data is being used

## 🎯 Next Steps

1. Start your backend server to see real data
2. Customize the mock data in `src/lib/mockData.ts`
3. Add more features like authentication, reviews, etc.
4. Deploy to Vercel or your preferred hosting platform

Enjoy your new MadJock website! 🎉
