# StudyBuddy AI - Gamified Learning Platform

## Overview
StudyBuddy AI is a gamified study assistant that transforms uploaded documents into interactive flashcards and quizzes. Users earn XP, maintain streaks, and level up while learning. The platform features a modern, Duolingo-inspired design with professional academic reliability.

## Project Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── ui/         # Shadcn UI components
│   │   ├── ThemeToggle.tsx
│   │   ├── XPProgressBar.tsx
│   │   ├── StreakDisplay.tsx
│   │   ├── LevelBadge.tsx
│   │   ├── LevelUpCelebration.tsx
│   │   ├── XPGainAnimation.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── FlashcardStudy.tsx
│   │   └── QuizInterface.tsx
│   ├── pages/          # Page components
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   └── Pricing.tsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── use-toast.ts
│   └── lib/            # Utilities
server/
├── db.ts              # Database connection
├── storage.ts         # Database operations
├── routes.ts          # API endpoints
├── replitAuth.ts      # Replit Auth setup
└── openai.ts          # AI generation functions
shared/
└── schema.ts          # Database schema & types
```

## Key Features
- **Document Upload**: PDF, TXT, DOCX support with AI content extraction
- **AI Flashcard Generation**: OpenAI-powered flashcard creation
- **AI Quiz Generation**: Multiple choice, true/false, fill-in-blank questions
- **XP System**: Earn XP for studying, level up with progressive requirements
- **Streak Tracking**: Daily streak counter with calendar visualization
- **Level Celebrations**: Animated level-up celebrations with confetti
- **Free/Premium Tiers**: Daily limits for free users, unlimited for premium

## Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **AI**: OpenAI GPT-5 for content generation
- **Payments**: Stripe Payment Links

## API Endpoints
- `GET /api/auth/user` - Get current user
- `POST /api/documents/upload` - Upload study document
- `GET /api/documents` - Get user's documents
- `POST /api/documents/:id/generate-flashcards` - Generate flashcards from document
- `POST /api/documents/:id/generate-quiz` - Generate quiz from document
- `GET /api/flashcard-sets` - Get user's flashcard sets
- `POST /api/flashcard-sets/:id/complete` - Complete flashcard study session
- `GET /api/quizzes` - Get user's quizzes
- `POST /api/quizzes/:id/complete` - Complete quiz
- `GET /api/study-sessions` - Get recent study sessions
- `GET /api/upgrade` - Redirect to Stripe payment

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `SESSION_SECRET` - Session encryption secret
- `STRIPE_PAYMENT_LINK` - Stripe payment link for premium upgrades

## Gamification System
- **XP Rewards**:
  - 5 XP per flashcard studied
  - 10 XP per quiz question correct
  - 25 XP bonus for perfect quiz score
  - 10 XP streak bonus
- **Level Formula**: Level = √(XP/50) + 1
- **Free Tier Limits**: 10 flashcards/day, 5 quizzes/day

## Recent Changes
- Initial project setup with full gamification features
- Implemented Replit Auth for user authentication
- Created AI-powered flashcard and quiz generation
- Built complete dashboard with progress tracking
- Added level-up celebrations and XP animations
- Implemented pricing page with Stripe integration
