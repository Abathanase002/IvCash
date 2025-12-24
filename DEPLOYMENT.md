# 🚀 IvCash Deployment Guide

This guide will help you deploy IvCash to production using **Railway**.

## Prerequisites

- GitHub account
- Railway account (https://railway.app)
- Git installed locally

## Step 1: Push to GitHub

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit - IvCash Platform"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ivcash.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Railway

### Option A: One-Click Deploy (Recommended)

1. Go to [Railway](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `ivcash` repository
5. Railway will auto-detect the monorepo

### Option B: Manual Setup

1. **Create Railway Project**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Add PostgreSQL Database**
   - In Railway Dashboard → Add Service → Database → PostgreSQL
   - Railway auto-injects `DATABASE_URL`

3. **Add Redis (Optional)**
   - In Railway Dashboard → Add Service → Database → Redis
   - Railway auto-injects `REDIS_URL`

4. **Deploy Backend**
   ```bash
   cd backend
   railway link
   railway up
   ```

5. **Deploy Admin Dashboard**
   ```bash
   cd admin-dashboard
   railway link
   railway up
   ```

## Step 3: Configure Environment Variables

In Railway Dashboard, set these for the **Backend** service:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `your-secure-random-string` |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://your-admin.up.railway.app` |
| `ADMIN_URL` | `https://your-admin.up.railway.app` |

For **Admin Dashboard**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-api.up.railway.app/api/v1` |

## Step 4: Create Admin User

After deployment, create the initial admin user:

```bash
# Connect to your Railway service
railway run --service backend npx ts-node src/seeds/seed-admin.ts
```

Or manually via API:

```bash
curl -X POST https://your-api.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@ivcash.com",
    "phone": "+250780000001",
    "password": "SecureAdmin@123",
    "role": "admin"
  }'
```

## Step 5: Custom Domain (Optional)

1. In Railway Dashboard → Settings → Domains
2. Add your custom domain (e.g., `api.ivcash.com`)
3. Update DNS records as instructed

## Deployment URLs

After successful deployment:

- **API Documentation**: `https://your-api.up.railway.app/docs`
- **Admin Dashboard**: `https://your-admin.up.railway.app`
- **Health Check**: `https://your-api.up.railway.app/api/v1/health`

## Monitoring

- Railway provides built-in logs and metrics
- View logs: `railway logs`
- View status: `railway status`

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is set (Railway auto-injects this)
- Check that SSL is enabled for production

### CORS Errors
- Update `FRONTEND_URL` and `ADMIN_URL` with actual deployed URLs

### Build Failures
- Check Node.js version (should be 20+)
- Review build logs in Railway Dashboard

## Cost Estimation (Railway)

| Service | Estimated Cost |
|---------|---------------|
| Backend | ~$5/month |
| Admin Dashboard | ~$5/month |
| PostgreSQL | ~$5/month |
| Redis | ~$5/month |
| **Total** | **~$15-20/month** |

Railway offers $5 free credit monthly for hobby use.

---

## Alternative: Render Deployment

If you prefer Render.com:

1. Create a **Web Service** for backend
2. Create a **Static Site** for admin dashboard
3. Create **PostgreSQL** database
4. Set environment variables similarly

## Quick Deploy Commands

```powershell
# Run the deployment script
.\deploy.ps1
```

---

**🎓 IvCash - Smart Money for Student Life**
