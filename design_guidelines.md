# Design Guidelines: Gamified AI Study Assistant

## Design Approach

**Reference-Based Hybrid**: Drawing from Duolingo's playful gamification, Notion's clean document handling, and Duolingo's motivational energy while maintaining academic credibility. The design should feel like a premium learning tool that happens to be fun, not a game that happens to teach.

## Core Design Principles

1. **Celebratory Progression**: Visual celebrations for achievements without being distracting
2. **Clarity First**: Academic content must always be readable and well-structured
3. **Motivational Energy**: Encourage without overwhelming
4. **Premium Feel**: Even free tier feels polished and complete

## Typography

**Font Stack**:
- Headings: Inter (700, 600) - clean, modern, professional
- Body: Inter (400, 500) - excellent readability for study content
- Monospace: JetBrains Mono (for code snippets if needed)

**Hierarchy**:
- Page Titles: text-4xl lg:text-5xl font-bold
- Section Headers: text-2xl lg:text-3xl font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Small Stats/Labels: text-sm font-medium

## Layout System

**Spacing Units**: Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-12 lg:py-20
- Card gaps: gap-6 to gap-8

**Container Strategy**:
- Max-width: max-w-7xl for main content
- Dashboard cards: max-w-sm to max-w-md
- Study interfaces: max-w-2xl for optimal reading

## Component Library

### Navigation
**Header**: Fixed top navigation with:
- Logo/brand on left
- Study streak indicator (flame icon + number)
- XP progress bar (subtle, inline)
- User avatar with level badge overlay
- Height: h-16, backdrop blur effect

### Dashboard Layout
**Grid Structure**: 
- Primary content area (2/3 width) with active study session
- Sidebar (1/3 width) with stats, streaks, quick actions
- Mobile: Stack vertically

**Stats Cards**: Showcase key metrics
- Current Level with progress ring
- XP to next level with visual bar
- Daily streak calendar (7-day view with check/flame icons)
- Recent achievements carousel

### Flashcard Interface
**Card Design**:
- Large centered card (w-full max-w-2xl, min-h-96)
- Flip animation on click/tap
- Front: Question in large text (text-2xl)
- Back: Answer + AI-generated explanation
- Navigation arrows on sides
- Progress indicator dots at bottom
- "Mark as known" / "Study again" quick actions

### Quiz Interface
**Question Container**:
- Question text prominently displayed
- Answer options as full-width buttons with hover states
- Immediate feedback banner (correct/incorrect)
- XP reward animation on correct answers
- Progress bar showing quiz completion

### Upload Zone
**Document Upload**:
- Large drag-and-drop area (min-h-64)
- Supported formats clearly listed (PDF, TXT, DOCX icons)
- Processing state with animated progress
- Preview of extracted content before generating flashcards

### Gamification Elements

**Level Up Celebration**: 
- Full-screen overlay (semi-transparent backdrop)
- Animated badge/trophy in center
- Confetti animation (brief, 2-3 seconds)
- New level number with glow effect
- "Continue Learning" button to dismiss

**Streak Display**:
- Flame icon with current streak number
- Calendar grid showing last 7-30 days
- Visual differentiation for completed vs missed days
- Motivational message ("3 day streak - keep it up!")

**XP Progress Bar**:
- Thin bar showing progress to next level
- Fills with smooth animation when XP is earned
- Displays current/needed XP on hover

### Pricing Comparison
**Two-Column Layout**:
- Free tier (left) vs Premium (right)
- Feature checklist with checkmarks/locks
- Prominent upgrade CTA on free tier card
- $4/month pricing clearly displayed
- Feature comparison table below cards

### Study Session Components

**Flashcard Stack Visualization**:
- Visual card deck representation
- Counter showing "Card 5 of 20"
- Completed cards fade/slide away
- Review pile for "study again" cards

**Quiz Results Screen**:
- Large score display (percentage + XP earned)
- Breakdown by question type
- Review incorrect answers section
- "Try Again" and "New Quiz" CTAs
- Achievement unlock banner if applicable

## Animations

**Minimal, Purposeful**:
- Card flip: 300ms ease-in-out transform
- XP gain: Brief +number float-up animation
- Level up: One-time celebration (confetti + badge grow)
- Streak flame: Subtle pulse on dashboard
- NO continuous background animations
- NO auto-playing carousels

## Images

**Hero Section**: Include motivational study-focused image
- Scene: Students or individuals studying with laptops/tablets in clean, bright environment
- Style: Modern, diverse, professional photography
- Treatment: Subtle overlay for text readability
- Placement: Top of landing page, h-96 lg:h-[500px]

**Dashboard Illustrations**: Small accent graphics
- Empty state illustrations when no documents uploaded
- Achievement badge graphics (custom SVG placeholders)
- Trophy/medal icons for level milestones

**Document Type Icons**: Visual indicators for file types
- PDF, DOCX, TXT icons in upload zone
- Use Font Awesome or Heroicons

## Layout Patterns

**Dashboard**: Asymmetric two-column with sidebar
**Study Modes**: Single centered column for focus
**Upload Flow**: Three-step wizard with progress indicator
**Landing Page**: Hero → Features Grid (3-column) → Pricing Comparison → CTA

**Icons**: Font Awesome CDN (flame, trophy, chart, book, check, lock, star, calendar)

**Accessibility**: 
- WCAG AA contrast for all text
- Keyboard navigation for all interactive elements
- Clear focus states (ring-2 ring-offset-2)
- Screen reader labels for icons and gamification elements

This design creates an engaging, professional study platform that motivates through visual progression while maintaining academic credibility and usability.