# UniMath - AI Math Tutor for University Students

An AI-powered math tutoring application built with Next.js, Gemini Flash, and Supabase. Helps university students master calculus, linear algebra, differential equations, probability, and more.

## Features

- **Chat Tutor** - Ask any math question and get step-by-step solutions with LaTeX rendering
- **Photo Solve** - Upload or capture a photo of a math problem for instant solutions
- **Practice Generator** - Generate unlimited practice problems by topic and difficulty
- **Formula Sheets** - AI-generated formula sheets organized by topic
- **Knowledge Map** - Interactive graph visualization of your math journey across topics
- **History** - Browse past conversations and practice sessions
- **Dark Mode** - Full light/dark theme support

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Auth & Database:** Supabase (Google OAuth + PostgreSQL)
- **AI:** Gemini Flash via `@google/genai`
- **Math Rendering:** KaTeX via react-markdown + remark-math + rehype-katex
- **Knowledge Graph:** React Flow (@xyflow/react)
- **Animations:** Framer Motion

## Setup

### 1. Install dependencies

```bash
cd unimath
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication > Providers** and enable **Google** OAuth
   - Add your Google OAuth Client ID and Secret
   - Set the redirect URL to `http://localhost:3000/auth/callback`

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    page.tsx                    # Landing page
    layout.tsx                  # Root layout with theme provider
    login/page.tsx              # Google OAuth login
    auth/callback/route.ts      # OAuth callback
    (app)/                      # Authenticated routes
      layout.tsx                # Sidebar layout
      dashboard/page.tsx        # Dashboard
      chat/page.tsx             # New chat
      chat/[id]/page.tsx        # Existing conversation
      solve/page.tsx            # Photo-to-solve
      practice/page.tsx         # Practice generator
      formulas/page.tsx         # Formula sheets
      history/page.tsx          # History browser
      map/page.tsx              # Knowledge map
      settings/page.tsx         # Settings
    api/
      chat/route.ts             # Chat streaming API
      practice/route.ts         # Practice generation API
      formulas/route.ts         # Formula sheet API
      topics/classify/route.ts  # Topic classification API
  components/
    sidebar.tsx                 # App sidebar navigation
    theme-provider.tsx          # Dark mode provider
    math-renderer.tsx           # LaTeX/Markdown renderer
    ui/                         # shadcn/ui components
  lib/
    gemini.ts                   # Gemini AI client
    topics.ts                   # Knowledge map topic data
    types.ts                    # TypeScript types
    utils.ts                    # Utility functions
    supabase/
      client.ts                 # Browser Supabase client
      server.ts                 # Server Supabase client
      middleware.ts             # Auth middleware
```
