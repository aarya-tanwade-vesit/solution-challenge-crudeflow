# Cloud Run: Frontend Service

## Build and Push

```bash
docker build -t REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-frontend:latest ./frontend
docker push REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-frontend:latest
```

## Deploy

```bash
gcloud run deploy crudeflow-frontend \
  --image REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-frontend:latest \
  --region REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars CRUDEFLOW_BACKEND_ORIGIN=https://crudeflow-backend-<hash>-<region>.run.app
```

## Required Runtime Configuration

- `CRUDEFLOW_BACKEND_ORIGIN` pointing to backend Cloud Run URL
- `PORT` (Cloud Run injects this automatically)

