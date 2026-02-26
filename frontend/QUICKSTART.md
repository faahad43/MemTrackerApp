# MemTracker - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Step 1: Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Clerk credentials (get from https://dashboard.clerk.com):
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_...
   CLERK_SECRET_KEY=Your_secret_ey...
   CLERK_WEBHOOK_SECRET=your_secret_...
   ```

3. Add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/memtracker
   # OR for MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/memtracker
   ```

### Step 2: Install & Run

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

## 🔐 Create First Admin User

1. Go to http://localhost:3000/login
2. You'll need to create users via Clerk Dashboard first
3. In Clerk Dashboard:
   - Go to Users
   - Create a new user
   - Set public metadata:
     ```json
     {
       "role": "admin"
     }
     ```

## 📍 Application Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | Sign in page | Public |
| `/dashboard` | Upload Video/RTSP | Authenticated |
| `/dashboard/chatbot` | AI Chatbot | Authenticated |
| `/dashboard/logging-history` | Activity Logs | Authenticated |
| `/dashboard/calendar` | Calendar View | Authenticated |
| `/dashboard/activities` | Activities Overview | Authenticated |
| `/dashboard/users` | User Management | Admin Only |

## 🎯 Key Features to Explore

1. **Upload Page** (`/dashboard`)
   - Try uploading a video file
   - Enter an RTSP URL (format: rtsp://username:password@ip:port/stream)

2. **Chatbot** (`/dashboard/chatbot`)
   - Ask questions about activities
   - View dummy previous chats in sidebar

3. **Logging History** (`/dashboard/logging-history`)
   - Use filters to find specific activities
   - Export logs to CSV
   - Scroll horizontally to see all columns

4. **Calendar** (`/dashboard/calendar`)
   - Click dates with green underline
   - Filter activities by time ranges
   - View activity counts

5. **User Management** (`/dashboard/users` - Admin only)
   - Add/edit/delete users
   - Switch between grid and list view

## 🛠️ Troubleshooting

### Clerk Authentication Issues
- Ensure webhook is set up in Clerk Dashboard
- Webhook endpoint: `http://your-domain/api/webhooks`
- Subscribe to: `user.created`, `user.updated`, `user.deleted`

### MongoDB Connection
- For local: Make sure MongoDB is running
- For Atlas: Check IP whitelist and credentials

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## 📝 Next Steps

1. **Connect Backend**: Update `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
2. **Replace Dummy Data**: Connect real APIs in each page
3. **Add ML Models**: Integrate computer vision models
4. **Deploy**: Deploy to Vercel or your preferred platform

## 💡 Tips

- All data is currently dummy/mock data
- Backend integration is pending
- Use Chrome DevTools to debug
- Check Network tab for API calls
- View console for any errors

## 🎨 Customization

- Colors defined in `src/app/globals.css`
- Layout components in `src/components/`
- Utility functions in `src/utils/`

## 📧 Support

Need help? Contact: fahadshah1060@gmail.com
