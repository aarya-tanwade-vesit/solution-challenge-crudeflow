# Secret Manager Strategy

Use Google Secret Manager for all sensitive values:

- `DATABASE_URL`
- `GEMMA4_API_KEY` / `GEMINI_API_KEY`
- OAuth/API credentials

## Recommended Pattern

1. Create secrets:

```bash
gcloud secrets create GEMMA4_API_KEY --replication-policy=automatic
echo -n "your-key" | gcloud secrets versions add GEMMA4_API_KEY --data-file=-
```

2. Grant Cloud Run service account access:

```bash
gcloud secrets add-iam-policy-binding GEMMA4_API_KEY \
  --member=serviceAccount:SERVICE_ACCOUNT_EMAIL \
  --role=roles/secretmanager.secretAccessor
```

3. Attach secret to Cloud Run environment in deploy settings.

