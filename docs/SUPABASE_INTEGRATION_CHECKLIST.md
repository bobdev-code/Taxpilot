# Supabase Integration Checklist

This checklist is for connecting TaxPilot AI Phase 5 to a dedicated Supabase project.

## 1. Confirm the correct Supabase project

Do not use another product's Supabase project.

Find the TaxPilot project in Supabase and note:

```txt
Project Ref
Project URL
Region
```

The project URL normally looks like:

```txt
https://PROJECT_REF.supabase.co
```

## 2. Create the receipts table

Open the Supabase SQL editor for the TaxPilot project.

Run the SQL file from this repository:

```txt
docs/supabase-receipts-schema.sql
```

It creates:

```txt
public.taxpilot_receipts
```

## 3. Configure Vercel environment variables

In Vercel project `taxpilot`, open:

```txt
Settings -> Environment Variables
```

Add these variables for Production and Preview:

```txt
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-side-key-from-supabase>
SUPABASE_RECEIPTS_TABLE=taxpilot_receipts
```

Security note: the service role key must remain server-side. Do not put it into frontend code.

## 4. Redeploy Vercel

After saving the environment variables, redeploy the latest production deployment.

## 5. Verify connection

Open:

```txt
/api/storage-status
```

Expected durable mode:

```json
{
  "durableStorageConfigured": true,
  "persistence": {
    "mode": "supabase-postgrest",
    "durability": "durable"
  }
}
```

If it still says `memory-demo`, the environment variables are missing or the deployment was not rebuilt.

## 6. Test receipt persistence

In the app:

1. Add a new receipt.
2. Refresh the page.
3. Check the Supabase table `taxpilot_receipts`.
4. Confirm the row exists.
5. Mark an open question as clarified.
6. Confirm the JSON fields update in Supabase.

## 7. Recommended next phase

After durable storage is verified, add authentication and user scoping before treating this as multi-user SaaS infrastructure.
