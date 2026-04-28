# Cloud Run: Backend Service

## Build and Push

```bash
docker build -t REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-backend:latest ./backend
docker push REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-backend:latest
```

## Deploy

```bash
gcloud run deploy crudeflow-backend \
  --image REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-backend:latest \
  --region REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars APP_ENV=production,API_V1_PREFIX=/api/v1
```

## Required Runtime Configuration

- `DATABASE_URL`
- `CORS_ORIGINS`
- `GEMMA4_API_KEY` (or equivalent AI key)

Prefer Secret Manager for sensitive values.

