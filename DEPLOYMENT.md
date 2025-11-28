# Roomie Deployment Guide

This guide covers deploying Roomie with the recommended architecture: **Vercel (Frontend) + Render (Backend)**.

## Recommended Architecture: Vercel + Render

This is the **optimal deployment setup** for Roomie:
- **Vercel**: Serves the frontend (static files) with global CDN for fast loading
- **Render**: Runs the backend API server with database and webhook integration

### Why This Architecture?

✅ **Performance**: Vercel's global CDN delivers static assets instantly  
✅ **Scalability**: Both platforms auto-scale independently  
✅ **Reliability**: Separate concerns - frontend and backend can scale/fail independently  
✅ **Cost-effective**: Vercel free tier for frontend, Render free tier for backend  
✅ **Simple**: No serverless function complexity, just a standard Node.js server

---

## Step-by-Step Deployment

### Part 1: Deploy Backend to Render

Your backend is already deployed at: **https://roomie-zypc.onrender.com** ✅

If you need to redeploy or configure:

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Select your Roomie service**
3. **Add Environment Variables**:
   ```
   ROOMIE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   ROOMIE_API_KEY=your-optional-api-key
   DATABASE_URL=your-mysql-connection-string
   JWT_SECRET=your-random-secret-key
   NODE_ENV=production
   ```
4. **Verify the deployment**:
   - Visit: https://roomie-zypc.onrender.com/roomie.html
   - You should see the 3D scene with the stickman avatar

### Part 2: Deploy Frontend to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository** (V3L3B1T/roomie)
4. **Configure Build Settings**:
   - Framework Preset: **Other**
   - Build Command: `pnpm build`
   - Output Directory: `dist/public`
   - Install Command: `pnpm install`
5. **Add Environment Variables** (Optional):
   ```
   VITE_ROOMIE_API_URL=/api/roomie
   ```
   (This is already the default, so you can skip this)
6. **Deploy** - Click "Deploy"
7. **Wait for build to complete** (~2-3 minutes)

### Part 3: Test the Deployment

1. **Visit your Vercel URL**: `https://your-project.vercel.app/roomie.html`
2. **Test the 3D scene**: You should see the room and stickman
3. **Test movement**: Press WASD keys to move around
4. **Test AI commands**: Type "create a blue box" in the chat

If AI commands don't work yet, you need to configure the webhook URL in Render (Part 1, step 3).

---

## How It Works

```
User Browser
    ↓
Vercel (Frontend)
    ↓ /api/roomie
Render (Backend API)
    ↓
n8n Webhook (AI)
```

1. User loads the app from Vercel (fast CDN delivery)
2. User types a command in the chat
3. Frontend sends request to `/api/roomie`
4. Vercel proxies the request to Render backend
5. Render backend forwards to n8n webhook
6. n8n processes with AI and returns structured command
7. Frontend executes the command in the 3D scene

---

## Configuration Details

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist/public",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://roomie-zypc.onrender.com/api/:path*"
    }
  ]
}
```

This configuration:
- Builds the frontend with Vite
- Serves static files from `dist/public`
- Proxies all `/api/*` requests to Render backend

### Render Configuration

Render automatically detects the Node.js app and uses:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`
- **Port**: 3000 (auto-detected)

---

## Environment Variables Reference

### Render (Backend)

**Required:**
- `ROOMIE_WEBHOOK_URL` - Your n8n webhook URL for AI processing
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Random secret key for session cookies

**Optional:**
- `ROOMIE_API_KEY` - API key for webhook authentication (if needed)
- `NODE_ENV` - Set to `production`

### Vercel (Frontend)

**Optional:**
- `VITE_ROOMIE_API_URL` - Custom API endpoint (default: `/api/roomie`)

---

## Custom Domains

### Vercel (Frontend)
1. Go to Project Settings → Domains
2. Add your domain (e.g., `roomie.yourdomain.com`)
3. Update DNS records as instructed

### Render (Backend)
1. Go to Service Settings → Custom Domain
2. Add your API domain (e.g., `api.roomie.yourdomain.com`)
3. Update DNS records as instructed

### Update Configuration
After adding custom domains, update `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.roomie.yourdomain.com/api/:path*"
    }
  ]
}
```

---

## Troubleshooting

### Issue: Vercel build fails

**Check:**
1. Build logs in Vercel dashboard
2. Run `pnpm build` locally to test
3. Ensure all dependencies are in `package.json`

**Common fixes:**
- Clear Vercel build cache and redeploy
- Check Node.js version (requires 18+)

### Issue: API requests fail (CORS errors)

**Check:**
1. Render backend is running: https://roomie-zypc.onrender.com/roomie.html
2. Check Render logs for errors
3. Verify environment variables are set in Render

**Common fixes:**
- Render free tier may sleep after inactivity (first request takes ~30s)
- Check CORS configuration in Express server

### Issue: AI commands don't work

**Check:**
1. `ROOMIE_WEBHOOK_URL` is set in Render
2. n8n webhook is active and accessible
3. Test webhook directly with curl:
   ```bash
   curl -X POST https://your-webhook-url \
     -H "Content-Type: application/json" \
     -d '{"prompt":"test","sceneState":{}}'
   ```

**Common fixes:**
- Verify webhook URL is correct
- Check n8n workflow is active
- Review Render logs for webhook errors

### Issue: 3D scene doesn't load

**Check:**
1. Browser console for errors (F12)
2. Check if Three.js loaded correctly
3. Verify `roomie.html` exists in deployment

**Common fixes:**
- Clear browser cache
- Check build output includes `roomie.html`
- Verify Vite build configuration

---

## Performance Optimization

### Frontend (Vercel)
- ✅ Automatic compression (gzip/brotli)
- ✅ Global CDN caching
- ✅ HTTP/2 and HTTP/3 support
- ⚠️ Consider code splitting for large Three.js scenes

### Backend (Render)
- ⚠️ Free tier sleeps after 15min inactivity (upgrade to paid for always-on)
- ✅ Auto-scaling based on traffic
- ⚠️ Add Redis for session storage (optional)
- ⚠️ Add rate limiting for production

---

## Monitoring

### Vercel
- **Logs**: Dashboard → Deployments → [Your Deployment] → Logs
- **Analytics**: Dashboard → Analytics (shows page views, performance)
- **Errors**: Automatic error tracking in logs

### Render
- **Logs**: Dashboard → [Your Service] → Logs (real-time)
- **Metrics**: Dashboard → [Your Service] → Metrics (CPU, memory, requests)
- **Alerts**: Set up email alerts for service downtime

---

## Scaling

### Traffic Growth
- **Vercel**: Automatically scales globally (no configuration needed)
- **Render**: Upgrade to paid plan for:
  - Always-on service (no sleep)
  - More CPU/memory
  - Multiple instances

### Database Scaling
- Use connection pooling (already configured in Drizzle)
- Consider read replicas for high traffic
- Monitor slow queries and add indexes

---

## Cost Estimate

### Free Tier (Current Setup)
- **Vercel**: Free (100GB bandwidth, unlimited deployments)
- **Render**: Free (750 hours/month, sleeps after 15min inactivity)
- **Total**: $0/month

### Paid Tier (Production)
- **Vercel Pro**: $20/month (1TB bandwidth, analytics, custom domains)
- **Render Starter**: $7/month (always-on, 512MB RAM, 0.5 CPU)
- **Database**: $7-15/month (managed MySQL/PostgreSQL)
- **Total**: ~$34-42/month

---

## Security Checklist

- ✅ Webhook URL hidden from client (backend proxy)
- ✅ Environment variables not committed to Git
- ✅ CORS properly configured
- ✅ No `eval()` or code execution from webhook
- ✅ Input validation on API endpoints
- ⚠️ Add rate limiting for production (recommended)
- ⚠️ Add authentication for multi-user scenarios (optional)
- ⚠️ Use HTTPS for custom domains (automatic with Vercel/Render)

---

## Alternative Deployment Options

### Option 1: All-in-One Render
Deploy both frontend and backend to Render:
- Simpler setup (one service)
- No proxy configuration needed
- Slower frontend delivery (no global CDN)

### Option 2: Vercel Serverless Functions
Use Vercel serverless functions instead of Render:
- All-in-one Vercel deployment
- More complex configuration
- Cold start delays on API requests
- Limited to 10s execution time (free tier)

### Option 3: Self-Hosted
Deploy to your own server (VPS, Docker, etc.):
- Full control
- Requires DevOps knowledge
- Manual scaling and monitoring

---

## Next Steps After Deployment

1. ✅ **Set up your n8n webhook** and configure `ROOMIE_WEBHOOK_URL`
2. ⚠️ **Add custom domain** for professional branding
3. ⚠️ **Set up monitoring** (Sentry, LogRocket, etc.)
4. ⚠️ **Add database persistence** to save room states
5. ⚠️ **Implement user authentication** for multi-user rooms
6. ⚠️ **Add more object types** and AI commands
7. ⚠️ **Optimize Three.js bundle** with code splitting

---

## Support

For deployment issues:
1. Check this guide first
2. Review platform-specific documentation:
   - [Vercel Docs](https://vercel.com/docs)
   - [Render Docs](https://render.com/docs)
3. Check GitHub issues: https://github.com/V3L3B1T/roomie/issues
4. Open a new issue with deployment logs

---

## Quick Reference

**Render Backend**: https://roomie-zypc.onrender.com  
**GitHub Repo**: https://github.com/V3L3B1T/roomie  
**Vercel Deploy**: Connect GitHub → Set env vars → Deploy  

**Test URLs:**
- Render: https://roomie-zypc.onrender.com/roomie.html
- Vercel: https://your-project.vercel.app/roomie.html

**Key Files:**
- `vercel.json` - Vercel configuration
- `package.json` - Build scripts
- `vite.config.ts` - Frontend build config
- `server/routers/roomie.ts` - Backend API
