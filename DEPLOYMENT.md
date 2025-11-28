# Roomie Deployment Guide

This guide covers deploying Roomie to various platforms. The application consists of a frontend (Three.js + Vite) and a backend API proxy.

## Vercel Deployment (Recommended for Quick Deploy)

Vercel provides the easiest deployment experience with built-in serverless functions.

### Prerequisites
- Vercel account (free tier works)
- GitHub repository with your Roomie code
- n8n webhook URL

### Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: **Other**
   - Build Command: `pnpm build`
   - Output Directory: `dist/public`
   - Install Command: `pnpm install`

3. **Add Environment Variables**
   
   In Vercel dashboard → Settings → Environment Variables, add:
   
   ```
   ROOMIE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   ROOMIE_API_KEY=your-optional-api-key (if your webhook requires authentication)
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - Your app will be available at `https://your-project.vercel.app/roomie.html`

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Accessing the App

- **Main React App**: `https://your-project.vercel.app/`
- **Roomie 3D Builder**: `https://your-project.vercel.app/roomie.html`

### Troubleshooting

**Issue: "Webhook URL not configured" error**
- Solution: Make sure you added `ROOMIE_WEBHOOK_URL` in Vercel environment variables
- Go to Settings → Environment Variables → Add

**Issue: CORS errors**
- Solution: The serverless function already includes CORS headers
- If still having issues, check your n8n webhook CORS settings

**Issue: Build fails**
- Solution: Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try running `pnpm build` locally first

## Alternative Deployment: Separate Frontend + Backend

For more control, deploy frontend and backend separately:

### Frontend (Netlify/Cloudflare Pages)

1. **Build the frontend**
   ```bash
   pnpm build
   ```

2. **Deploy `dist/public` folder**
   - Netlify: Drag and drop `dist/public` folder
   - Cloudflare Pages: Connect GitHub and set build output to `dist/public`

3. **Set environment variable**
   ```
   VITE_ROOMIE_API_URL=https://your-backend-url.com/api/roomie
   ```

### Backend (Render/Fly.io/Railway)

1. **Deploy to Render**
   - Create new Web Service
   - Connect GitHub repository
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`
   - Add environment variables:
     ```
     ROOMIE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
     ROOMIE_API_KEY=your-optional-api-key
     DATABASE_URL=your-database-url
     JWT_SECRET=your-secret-key
     NODE_ENV=production
     ```

2. **Deploy to Fly.io**
   ```bash
   # Install Fly CLI
   curl -L https://fly.io/install.sh | sh
   
   # Create app
   fly launch
   
   # Set secrets
   fly secrets set ROOMIE_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
   fly secrets set ROOMIE_API_KEY=your-optional-api-key
   
   # Deploy
   fly deploy
   ```

3. **Deploy to Railway**
   - Connect GitHub repository
   - Add environment variables in dashboard
   - Railway auto-detects Node.js and deploys

## Environment Variables Reference

### Required
- `ROOMIE_WEBHOOK_URL` - Your n8n webhook URL (required for AI functionality)

### Optional
- `ROOMIE_API_KEY` - API key for webhook authentication (if needed)
- `VITE_ROOMIE_API_URL` - Custom API endpoint (default: `/api/roomie`)

### Backend-only (if deploying separately)
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `NODE_ENV` - Environment (development/production)

## Testing Deployment

After deployment, test these features:

1. **Load the app**: Visit `https://your-domain.com/roomie.html`
2. **3D scene loads**: You should see a 3D room with a stickman avatar
3. **Movement works**: Press WASD keys to move around
4. **Chat works**: Type a message in the chat box
5. **AI commands work**: Try "create a blue box" or "make a red couch"

## Common Issues

### 1. White screen / Nothing loads
- Check browser console for errors
- Verify build completed successfully
- Check that `roomie.html` exists in deployment

### 2. API errors / Webhook not responding
- Verify `ROOMIE_WEBHOOK_URL` is set correctly
- Test webhook URL directly with curl:
  ```bash
  curl -X POST https://your-webhook-url \
    -H "Content-Type: application/json" \
    -d '{"prompt":"test","sceneState":{}}'
  ```

### 3. CORS errors
- For Vercel: Already handled by serverless function
- For separate backend: Add CORS middleware to Express

### 4. Build errors
- Run `pnpm build` locally first
- Check Node.js version (requires 18+)
- Clear build cache and try again

## Performance Optimization

### For Production

1. **Enable compression** (automatically handled by Vercel)
2. **Use CDN** for static assets (Vercel includes this)
3. **Optimize Three.js bundle**:
   - Consider code splitting for large scenes
   - Lazy load object geometries
4. **Add caching headers** for static assets

## Monitoring

### Vercel
- View logs: Dashboard → Deployments → [Your Deployment] → Logs
- Analytics: Dashboard → Analytics

### Custom Backend
- Add logging middleware
- Use services like Sentry for error tracking
- Monitor API response times

## Scaling

### Vercel
- Automatically scales with traffic
- Serverless functions scale independently
- No configuration needed

### Custom Backend
- Add load balancer
- Use multiple instances
- Consider Redis for session storage

## Security Checklist

- ✅ Webhook URL hidden from client (backend proxy)
- ✅ Environment variables not committed to Git
- ✅ CORS properly configured
- ✅ No `eval()` or code execution from webhook
- ✅ Input validation on API endpoints
- ⚠️ Optional: Add rate limiting for production
- ⚠️ Optional: Add authentication for multi-user scenarios

## Support

For deployment issues:
1. Check this guide first
2. Review platform-specific documentation
3. Check GitHub issues
4. Open a new issue with deployment logs

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Add custom domain
3. Set up monitoring/analytics
4. Consider adding user authentication
5. Implement room persistence (database)
6. Add more object types and commands
