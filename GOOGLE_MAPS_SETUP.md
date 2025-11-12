# 🗺️ Google Maps API Key Setup Guide

This guide will walk you through getting a Google Maps API key to enable the map view in Lattelink.

## Step 1: Create a Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (or create one if you don't have one)
3. Click **"Get Started for Free"** or **"Try Free"**
4. You'll get $300 in free credits for 90 days (more than enough for development)

## Step 2: Create a New Project

1. In the Google Cloud Console, click the project dropdown at the top
2. Click **"New Project"**
3. Enter a project name (e.g., "Lattelink")
4. Click **"Create"**
5. Wait a few seconds for the project to be created, then select it

## Step 3: Enable the Maps JavaScript API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Maps JavaScript API"**
3. Click on **"Maps JavaScript API"**
4. Click **"Enable"**
5. Wait a moment for it to enable

## Step 4: Create an API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API key"**
4. A popup will show your new API key - **copy it now!** (You can also copy it later from the credentials page)
5. Click **"Close"**

## Step 5: Restrict Your API Key (Important for Security)

⚠️ **Important**: Restricting your API key prevents others from using it and protects your quota.

1. Click on your newly created API key in the credentials list
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check **"Maps JavaScript API"**
   - Click **"Save"**
3. Under **"Application restrictions"** (optional but recommended):
   - For development: Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     - `http://localhost:3000/*`
     - `http://localhost:3001/*`
     - `http://127.0.0.1:3000/*`
   - For production: Add your domain (e.g., `https://yourdomain.com/*`)
   - Click **"Save"**

## Step 6: Add API Key to Your Project

1. Open `frontend/.env.local` (create it if it doesn't exist)
2. Add your API key:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with the actual API key you copied

## Step 7: Restart Your Frontend Server

1. Stop your frontend server (Ctrl+C)
2. Restart it:
   ```bash
   cd frontend
   npm run dev
   ```
   Or if using the combined command:
   ```bash
   npm run dev
   ```

## Step 8: Test the Map View

1. Open `http://localhost:3000` in your browser
2. Click the **"Map"** button in the top right
3. You should see a map with café markers!

## 💰 Pricing Information

- **Free Tier**: $200 in free credits per month
- **Maps JavaScript API**: $7 per 1,000 map loads
- For development/testing, you'll likely stay within the free tier
- Monitor usage in Google Cloud Console → **"APIs & Services"** → **"Dashboard"**

## 🔒 Security Best Practices

1. **Always restrict your API key** to specific APIs and domains
2. **Never commit your API key** to git (it's already in `.gitignore`)
3. **Use different keys** for development and production
4. **Monitor usage** regularly in Google Cloud Console
5. **Set up billing alerts** to avoid unexpected charges

## 🐛 Troubleshooting

### "This page can't load Google Maps correctly"

- Check that your API key is correct in `.env.local`
- Verify the Maps JavaScript API is enabled
- Make sure you restarted the frontend server after adding the key
- Check browser console for specific error messages

### "RefererNotAllowedMapError"

- Your API key restrictions are blocking the request
- Go to Google Cloud Console → Credentials → Your API key
- Under "Application restrictions", add `http://localhost:3000/*`

### Map doesn't show markers

- Check that you have cafés in your database
- Verify the coordinates are in the correct format
- Check browser console for JavaScript errors

### API key quota exceeded

- Check your usage in Google Cloud Console
- You may need to enable billing (but you still get $200 free credits/month)
- Consider restricting the key further to prevent abuse

## 📚 Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

## ✅ Quick Checklist

- [ ] Created Google Cloud account
- [ ] Created new project
- [ ] Enabled Maps JavaScript API
- [ ] Created API key
- [ ] Restricted API key to Maps JavaScript API
- [ ] Added API key to `frontend/.env.local`
- [ ] Restarted frontend server
- [ ] Tested map view

---

**Note**: The API key is free to create and you get $200 in free credits per month, which is more than enough for development and testing!

