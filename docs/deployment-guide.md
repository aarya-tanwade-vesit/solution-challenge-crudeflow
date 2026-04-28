# Deployment Guide (Google Cloud Ready)

This repository is prepared for containerized deployment to Google Cloud.  
The recommended target is **Cloud Run** for both frontend and backend.

## 1) Build Containers

```bash
docker build -t crudeflow-backend:latest ./backend
docker build -t crudeflow-frontend:latest ./frontend
```

## 2) Push to Artifact Registry

```bash
gcloud auth configure-docker REGION-docker.pkg.dev
docker tag crudeflow-backend:latest REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-backend:latest
docker tag crudeflow-frontend:latest REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-frontend:latest
docker push REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-backend:latest
docker push REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-frontend:latest
```

## 3) Create/Configure Secrets

Store sensitive values in Secret Manager:

- `DATABASE_URL`
- `GEMMA4_API_KEY` (or `GEMINI_API_KEY`, based on provider)
- any private credentials

## 4) Deploy Backend (Cloud Run)

```bash
gcloud run deploy crudeflow-backend \
  --image REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-backend:latest \
  --platform managed \
  --region REGION \
  --allow-unauthenticated \
  --set-env-vars APP_ENV=production,API_V1_PREFIX=/api/v1
```

Add secrets and database env vars via Cloud Run console or CLI.

## 5) Deploy Frontend (Cloud Run)

```bash
gcloud run deploy crudeflow-frontend \
  --image REGION-docker.pkg.dev/PROJECT/REPO/crudeflow-frontend:latest \
  --platform managed \
  --region REGION \
  --allow-unauthenticated \
  --set-env-vars CRUDEFLOW_BACKEND_ORIGIN=https://crudeflow-backend-<hash>-<region>.run.app
```

## 6) Networking and CORS

- Configure backend `CORS_ORIGINS` to include frontend Cloud Run URL.
- Validate API rewrite behavior in frontend against production backend URL.

## 7) Post-Deploy Validation

- Frontend `/dashboard` loads with live API.
- Backend `/docs` returns healthy OpenAPI docs.
- Decision approve/reject flow updates map and KPIs.
- Copilot endpoint returns structured response.

