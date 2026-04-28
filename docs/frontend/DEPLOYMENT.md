# DEPLOYMENT.md — Production Deployment Guide

**Step-by-step guide to deploy CrudeFlow to production.**

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel has native support for Next.js and automatic deployments on git push.

#### Setup

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Select the repo

3. **Configure Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.backend.example.com
   NEXT_PUBLIC_WS_URL=wss://api.backend.example.com
   NEXT_PUBLIC_API_TOKEN=<production-api-token>
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - URL: `https://<project-name>.vercel.app`

#### Auto-Deployment
- Pushes to `main` branch → automatic production deploy
- PRs → preview deployments (shareable URLs)

#### Benefits
- ✅ Zero configuration
- ✅ Global CDN
- ✅ Automatic SSL/TLS
- ✅ Edge functions support
- ✅ Analytics included

---

### Option 2: Docker + Kubernetes

For self-hosted or multi-region deployments.

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
```

#### Build and Push to Registry

```bash
# Build image
docker build -t crudeflow:latest .

# Tag for Docker Hub
docker tag crudeflow:latest your-registry/crudeflow:latest

# Push
docker push your-registry/crudeflow:latest
```

#### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crudeflow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: crudeflow
  template:
    metadata:
      labels:
        app: crudeflow
    spec:
      containers:
      - name: crudeflow
        image: your-registry/crudeflow:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_BASE_URL
          value: "https://api.backend.example.com"
        - name: NEXT_PUBLIC_WS_URL
          value: "wss://api.backend.example.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: crudeflow-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: crudeflow
```

---

### Option 3: Traditional VPS (AWS EC2, DigitalOcean, Linode)

#### Prerequisites
- Node.js 18+ installed
- nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt)
- PM2 for process management

#### Deployment Steps

1. **SSH into server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone repository**
   ```bash
   cd /var/www
   git clone https://github.com/your-org/crudeflow.git
   cd crudeflow
   ```

3. **Install dependencies**
   ```bash
   npm install -g pnpm
   pnpm install
   ```

4. **Build**
   ```bash
   pnpm build
   ```

5. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start "pnpm start" --name crudeflow
   pm2 save
   pm2 startup
   ```

6. **Configure nginx**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name crudeflow.example.com;

     ssl_certificate /etc/letsencrypt/live/crudeflow.example.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/crudeflow.example.com/privkey.pem;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

7. **Restart nginx**
   ```bash
   sudo systemctl restart nginx
   ```

---

## Pre-Deployment Checklist

- [ ] **Code Quality**
  - [ ] No console.log debug statements
  - [ ] No TODO comments in production code
  - [ ] TypeScript strict mode enabled
  - [ ] ESLint passes: `pnpm lint`

- [ ] **Environment Variables**
  - [ ] NEXT_PUBLIC_API_BASE_URL points to production backend
  - [ ] NEXT_PUBLIC_WS_URL points to production WebSocket
  - [ ] NEXT_PUBLIC_API_TOKEN is valid and rotated

- [ ] **Performance**
  - [ ] Build output < 500KB (check `pnpm build` output)
  - [ ] No unused dependencies (check `pnpm audit`)
  - [ ] Dynamic imports for Leaflet, Recharts

- [ ] **Security**
  - [ ] CORS headers configured on backend
  - [ ] API tokens not exposed in frontend code
  - [ ] HTTPS only (no http:// in production)
  - [ ] Content Security Policy headers set

- [ ] **Monitoring**
  - [ ] Error tracking configured (Sentry, LogRocket)
  - [ ] Analytics configured (Vercel Analytics, Mixpanel)
  - [ ] Health check endpoint ready (/api/health)

- [ ] **Documentation**
  - [ ] README updated with deployment instructions
  - [ ] Runbook created for incident response
  - [ ] Team has access to production dashboard

---

## Environment Configuration

### Development
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_API_TOKEN=dev-token-12345
NODE_ENV=development
```

### Staging
```env
NEXT_PUBLIC_API_BASE_URL=https://api-staging.example.com
NEXT_PUBLIC_WS_URL=wss://api-staging.example.com
NEXT_PUBLIC_API_TOKEN=<staging-api-token>
NODE_ENV=production
```

### Production
```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
NEXT_PUBLIC_API_TOKEN=<prod-api-token>
NODE_ENV=production
```

---

## Performance Optimization

### 1. Build Optimization

Verify build size:
```bash
pnpm build
# Output should show bundle analysis
```

### 2. Image Optimization

Next.js automatically optimizes images. Ensure all images use `next/image`:
```typescript
import Image from 'next/image';

<Image src="/logo.svg" alt="Logo" width={100} height={100} />
```

### 3. Font Optimization

Geist fonts are already optimized in `layout.tsx`.

### 4. CSS Optimization

Tailwind CSS tree-shakes unused classes during build.

---

## Monitoring & Logging

### Error Tracking

Add Sentry (optional but recommended):

```typescript
// app/layout.tsx
import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
```

### Health Check Endpoint

Create `app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 });
}
```

LoadBalancer can ping this every 30 seconds.

### Logs

- **Vercel:** Built-in logging dashboard
- **Docker/K8s:** Use `kubectl logs` or aggregator (ELK, Datadog)
- **VPS:** Check `/var/log/pm2/` or nginx logs

---

## Rollback Plan

### If Deployment Fails

#### Vercel
- Revert commit to `main`
- Vercel auto-deploys previous version
- Or manually select previous deployment from dashboard

#### Docker/K8s
```bash
# Rollback to previous image
kubectl set image deployment/crudeflow crudeflow=your-registry/crudeflow:previous-tag
```

#### VPS
```bash
# Revert to previous commit
git revert HEAD
git push
pm2 restart crudeflow
```

---

## Scaling Considerations

### Horizontal Scaling
- Frontend is stateless (no server-side sessions)
- Deploy multiple instances behind a load balancer
- All instances can handle any request

### Caching
- Use CloudFlare or Vercel Edge Cache for static assets
- Set Cache-Control headers:
  ```
  Cache-Control: public, max-age=3600
  ```

### Database/Backend
- Frontend doesn't directly query database
- All data flows through backend APIs
- Ensure backend can scale independently

---

## SSL/TLS Certificates

### Vercel
- Automatic SSL/TLS (no config needed)
- HTTPS by default

### Docker/K8s
- Let's Encrypt: `certbot` or use K8s cert-manager
- Self-signed: for development only

### VPS
```bash
# Install Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d crudeflow.example.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Disaster Recovery

### Backup Strategy
- Source code: GitHub (all commit history)
- Database: Backend's responsibility
- User preferences: Browser local storage + backend sync

### RTO (Recovery Time Objective)
- Vercel: ~5 minutes (automatic rollback)
- Docker/K8s: ~10 minutes (restart pods)
- VPS: ~15 minutes (manual intervention)

### Runbook
1. Check logs for error
2. Identify root cause (backend API down? database issue? frontend bug?)
3. If frontend issue: revert commit
4. If backend issue: escalate to backend team
5. If infrastructure: escalate to DevOps

---

## Post-Deployment

### Verification
1. Visit production URL
2. Check console for errors
3. Test core flows:
   - Login → Dashboard
   - Click vessel → Detail drawer
   - Enter simulation mode → Blue border visible
   - Submit decision → Queue updates

### Smoke Tests
```bash
# Check health endpoint
curl https://crudeflow.example.com/api/health

# Check for errors in logs
vercel logs --production
```

### Communication
- Post deployment announcement to team
- Update status page if applicable

---

## Rollout Strategy

### Recommended: Blue-Green Deployment

1. Deploy new version to "green" environment
2. Run smoke tests on green
3. Route 10% of traffic to green (canary)
4. Monitor errors for 10 minutes
5. Route 100% of traffic to green
6. Keep "blue" ready for rollback

**Vercel deployment previews support this** via environment promotion.

---

## Metrics to Track

| Metric | Target | Alert Threshold |
|---|---|---|
| **Page Load Time** | < 2s | > 5s |
| **Error Rate** | < 0.1% | > 1% |
| **Uptime** | 99.9% | < 99% |
| **API Response Time** | < 500ms | > 2s |
| **CPU Usage** | 50% avg | > 80% |
| **Memory Usage** | 256MB avg | > 400MB |

---

## Support & Troubleshooting

### Common Issues

| Issue | Solution |
|---|---|
| **Blank white page** | Check browser console for JS errors; verify API_BASE_URL |
| **Map not loading** | Verify Leaflet CDN is accessible; check CORS |
| **WebSocket disconnects** | Check backend WebSocket server; verify firewall rules |
| **High memory usage** | Check for memory leaks (use Chrome DevTools) |
| **Slow performance** | Check backend API response times; profile with DevTools |

### Getting Help
- Check logs: `vercel logs --production`
- Check status page: [status.example.com]
- Contact: [devops@example.com]

---

## Conclusion

CrudeFlow is production-ready. Choose the deployment option that best fits your infrastructure:

- **Vercel:** Simplest, recommended for most teams
- **Docker/K8s:** Most control, recommended for enterprises
- **VPS:** Traditional, lower cost but more maintenance

Refer to this guide during each deployment to ensure consistency and reliability.

Good luck! 🚀

