# Environment Variables Setup

Create a `.env` file in your project root with these variables:

## Required for Basic Operation

```bash
# Database - Get from Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth - Generate a random secret
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Required for Melissa AI Assistant

```bash
# OpenAI - Get from OpenAI Platform
OPENAI_API_KEY="sk-..."
```

## Required for Payments

```bash
# Stripe - Get from Stripe Dashboard
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## Required for Email Notifications

```bash
# Resend - Get from Resend Dashboard
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@beautifulsoulsboarding.com"
```

## Optional (Google OAuth)

```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
```

## Optional (SMS Notifications)

```bash
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

## Optional (Docker Deployment)

```bash
DOCKER_USERNAME=""
DOCKER_PASSWORD=""
```

## Quick Setup Steps:

1. **Create `.env` file** in your project root
2. **Copy the template above** and fill in your actual values
3. **Get your Supabase DATABASE_URL** from your Supabase project settings
4. **Generate NEXTAUTH_SECRET**: Run `openssl rand -base64 32` or use any random string
5. **Restart your development server**: `npm run dev`

Once you have at least the DATABASE_URL and NEXTAUTH_SECRET, the basic app should work!
