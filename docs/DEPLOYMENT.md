# Production Deployment

ResidentFlow AI is ready for Vercel deployment after production services are configured.

## Required Services

1. Vercel account/project
2. Neon or PostgreSQL database
3. Cloudinary account for complaint photos
4. Resend account for email notifications

## Required Environment Variables

Set these in Vercel Project Settings > Environment Variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/residentflow?sslmode=require"
BETTER_AUTH_SECRET="generate-a-long-random-secret"
BETTER_AUTH_URL="https://your-vercel-domain.vercel.app"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RESEND_API_KEY="..."
NOTICE_FROM_EMAIL="ResidentFlow AI <notices@yourdomain.com>"
```

## Deployment Steps

1. Install dependencies locally:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Apply database migrations to the production database:

```bash
npm run prisma:migrate
```

For CI/CD production deployments, use:

```bash
npx prisma migrate deploy
```

4. Seed demo accounts only if the evaluator needs test credentials:

```bash
npm run prisma:seed
```

5. Deploy to Vercel:

```bash
npx vercel --prod
```

## Demo Credentials

After running the seed:

- Admin: `admin@residentflow.ai` / `Password123!`
- Resident: `resident@residentflow.ai` / `Password123!`

## Production Checks

- `npm run typecheck`
- `npm run build`
- `npm audit --audit-level=high`

## Notes

- Do not commit `.env`.
- Use a strong `BETTER_AUTH_SECRET` in production.
- Update `BETTER_AUTH_URL` after the final Vercel domain is known.
- If photo upload is not needed for a demo, Cloudinary can be configured later, but the assignment requirement is fully satisfied only after Cloudinary keys are set.
- If emails are not needed for a demo, Resend can be configured later, but the notification requirement is fully satisfied only after Resend keys are set.
