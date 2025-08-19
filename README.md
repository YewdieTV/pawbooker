# PawBooker - AI-Powered Dog Care Booking Platform

A production-ready full-stack booking website for dog care services with an intelligent AI scheduling agent. Built with Next.js 14, TypeScript, and modern web technologies.

![PawBooker Screenshot](https://via.placeholder.com/800x400?text=PawBooker+Dashboard)

## 🚀 Features

### Core Features
- **AI-Powered Booking Agent**: Natural language booking with OpenAI GPT-4o-mini
- **Real-time Availability**: Dynamic scheduling with capacity management and buffer times
- **Multi-Service Support**: Boarding, daycare, walks, and drop-in visits
- **Secure Payments**: Stripe integration with deposit handling
- **Email Notifications**: Automated confirmations and reminders via Resend
- **SMS Reminders**: Optional Twilio integration for text notifications

### User Experience
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Authentication**: Magic link email and Google OAuth via NextAuth
- **Client Portal**: Booking management and pet profiles
- **Admin Dashboard**: Comprehensive management interface
- **Calendar Integration**: Visual availability checking

### Technical Features
- **Type-Safe APIs**: Full TypeScript with Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Updates**: Optimistic UI updates
- **Error Handling**: Comprehensive error boundaries and validation
- **Testing**: Unit tests and E2E testing with Playwright
- **CI/CD**: GitHub Actions with Docker deployment

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **shadcn/ui** for component library
- **React Hook Form** for form handling
- **TanStack Query** for state management

### Backend
- **Next.js API Routes** for server logic
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **OpenAI API** for AI scheduling
- **Stripe** for payments
- **Resend** for email notifications
- **Twilio** for SMS (optional)

### DevOps
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **ESLint & Prettier** for code quality
- **Playwright** for E2E testing
- **Jest** for unit testing

## 🏗 Project Structure

```
pawbooker/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   ├── api/                      # API routes
│   ├── availability/             # Availability calendar
│   ├── book-with-assistant/      # AI booking interface
│   ├── portal/                   # Client dashboard
│   ├── services/                 # Services showcase
│   └── layout.tsx                # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   ├── auth/                     # Authentication components
│   ├── ai-chat.tsx              # AI chat interface
│   ├── availability-calendar.tsx # Calendar component
│   └── navigation.tsx           # Main navigation
├── lib/                         # Utility libraries
│   ├── ai/                      # AI tools and functions
│   ├── availability.ts          # Availability engine
│   ├── auth.ts                  # NextAuth configuration
│   ├── notifications.ts         # Email/SMS handling
│   ├── prisma.ts               # Database client
│   ├── stripe.ts               # Payment processing
│   ├── utils.ts                # Utility functions
│   └── validations.ts          # Zod schemas
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── .github/workflows/          # CI/CD configuration
├── Dockerfile                  # Container configuration
└── package.json               # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- PostgreSQL database
- Required API keys (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pawbooker.git
   cd pawbooker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```

4. **Configure Environment Variables**
   Edit `.env.local` with your values:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/pawbooker"

   # NextAuth
   NEXTAUTH_SECRET="your-random-secret-here"
   NEXTAUTH_URL="http://localhost:3000"

   # OpenAI (Required)
   OPENAI_API_KEY="sk-your-openai-api-key"

   # Stripe (Required)
   STRIPE_PUBLISHABLE_KEY="pk_test_your-publishable-key"
   STRIPE_SECRET_KEY="sk_test_your-secret-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

   # Email (Required)
   RESEND_API_KEY="re_your-resend-api-key"
   FROM_EMAIL="noreply@yourdomain.com"

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # SMS (Optional)
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="+1234567890"

   # App Settings
   NEXT_PUBLIC_DEMO="true"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed the database
   npx prisma db seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/pawbooker` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | `openssl rand -base64 32` |
| `OPENAI_API_KEY` | OpenAI API key for AI agent | `sk-...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `RESEND_API_KEY` | Resend API key for emails | `re_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - |
| `TWILIO_ACCOUNT_SID` | Twilio account SID for SMS | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | - |
| `NEXT_PUBLIC_DEMO` | Enable demo mode | `false` |

## 🎯 Usage

### Demo Accounts

The seed script creates demo accounts for testing:

- **Admin**: `admin@pawbooker.com`
- **Client**: `client@example.com`

Use magic link authentication to sign in.

### AI Booking Agent

The AI agent can help with:
- Checking service availability
- Understanding pricing and policies
- Finding suitable time slots
- Creating bookings
- Managing pet information

Example interactions:
- "I need boarding for my Golden Retriever next weekend"
- "What are your walk prices?"
- "Can you show me available daycare slots this week?"

### API Endpoints

#### Public Endpoints
- `GET /api/availability` - Check service availability
- `POST /api/ai/scheduler` - AI booking assistant

#### Authenticated Endpoints
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `POST /api/holds` - Hold time slot temporarily

#### Admin Endpoints
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/holds` - Get active holds

#### Webhooks
- `POST /api/webhooks/stripe` - Stripe payment events

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 🚢 Deployment

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t pawbooker .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your-db-url" \
     -e NEXTAUTH_SECRET="your-secret" \
     pawbooker
   ```

### Production Deployment

1. **Environment Setup**
   - Set up PostgreSQL database
   - Configure environment variables
   - Set up Stripe webhooks
   - Configure email domain

2. **Database Migration**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

## 🔒 Security Features

- **Authentication**: Secure magic link and OAuth
- **Authorization**: Role-based access control
- **Data Validation**: Comprehensive input validation with Zod
- **SQL Injection Prevention**: Prisma ORM protection
- **CSRF Protection**: NextAuth built-in protection
- **Environment Variables**: Secure configuration management

## 📊 Monitoring

### Health Checks
- Database connectivity
- API response times
- Payment processing status
- Email delivery rates

### Error Tracking
- Comprehensive error logging
- User-friendly error messages
- Automated error reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation as needed

## 📝 API Documentation

### Booking Flow

1. **Check Availability**
   ```typescript
   GET /api/availability?serviceId={id}&from={date}&to={date}
   ```

2. **Create Hold** (Optional)
   ```typescript
   POST /api/holds
   {
     "serviceId": "string",
     "startDateTime": "ISO date",
     "endDateTime": "ISO date",
     "clientId": "string",
     "petId": "string",
     "priceCents": number
   }
   ```

3. **Create Booking**
   ```typescript
   POST /api/bookings
   {
     "serviceId": "string",
     "petId": "string", 
     "startDateTime": "ISO date",
     "endDateTime": "ISO date",
     "notes": "string?"
   }
   ```

4. **Process Payment**
   Stripe PaymentIntent returned with booking

## 🎨 Customization

### Branding
- Update logo in `components/navigation.tsx`
- Modify colors in `tailwind.config.js`
- Update business information in seed script

### Services
- Add new service types in `prisma/schema.prisma`
- Update pricing in services seed data
- Modify availability rules as needed

### AI Prompts
- Customize system prompt in `app/api/ai/scheduler/route.ts`
- Add new tools in `lib/ai/tools.ts`
- Adjust AI behavior for your business

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check PostgreSQL is running
   - Ensure database exists

2. **AI Agent Not Working**
   - Verify OPENAI_API_KEY is valid
   - Check API key has sufficient credits
   - Review AI function definitions

3. **Email Not Sending**
   - Verify RESEND_API_KEY
   - Check FROM_EMAIL domain
   - Review email templates

4. **Payment Issues**
   - Verify Stripe keys match environment
   - Check webhook endpoint configuration
   - Review Stripe dashboard for errors

### Development Issues

1. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next

   # Regenerate Prisma client
   npx prisma generate

   # Rebuild
   npm run build
   ```

2. **Database Issues**
   ```bash
   # Reset database
   npx prisma migrate reset

   # Reseed data
   npx prisma db seed
   ```

## 📞 Support

- **Documentation**: Check this README and code comments
- **Issues**: Open GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Email**: [your-email@domain.com](mailto:your-email@domain.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [OpenAI](https://openai.com/) - AI capabilities
- [Stripe](https://stripe.com/) - Payment processing
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Resend](https://resend.com/) - Email delivery

---

Built with ❤️ for dog lovers everywhere. 🐕
