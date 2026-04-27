# ⚡ IssueForge

**AI-powered GitHub Issue Triage & Auto-Resolver**

Transform chaotic bug backlogs into fast, reliable resolutions. IssueForge automatically triages issues, analyzes root causes, suggests verified code fixes, and generates ready-to-submit PRs—with human review in the loop.

---

## 🎯 The Problem

GitHub issue backlogs are broken:
- **Manual triage** wastes hours on categorization
- **AI-generated fixes are unreliable** (plausible-sounding but wrong)
- **Engineers ping-pong between tools** (GitHub → IDE → Slack)
- **Context switching kills productivity**

IssueForge solves this by being "**almost right**" on purpose—giving engineers a **verified starting point**, not a finished solution.

---

## ✨ Features

- **GitHub OAuth Integration** — Connect your repositories securely
- **AI Issue Analysis** — Automatic severity classification, root cause explanation, reproduction steps
- **Hybrid Analysis Engine** — Combines static checks + LLM reasoning
- **Suggested Fixes** — Code diffs + ready-to-copy patches
- **PR Description Generator** — One-click PR draft creation
- **Side-by-Side Diff View** — Original issue vs. AI suggestion
- **Human-in-the-Loop Feedback** — Thumbs up/down to improve future analyses
- **Analytics Dashboard** — Track triage success rate, confidence scores, helpful feedback
- **Multi-LLM Support** — Anthropic Claude, OpenAI GPT-4, or Grok (configurable)
- **Rate Limiting** — 50 analyses/hour per user
- **TypeScript Strict Mode** — Full type safety

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (or Supabase/Neon)
- GitHub OAuth App credentials
- LLM API key (Claude, OpenAI, or Grok)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/issueforge.git
cd issueforge
npm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb issueforge

# Run migrations
npm run prisma:migrate

# (Optional) View database UI
npm run prisma:studio
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/issueforge"

# GitHub OAuth
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret

# NextAuth Secret
NEXTAUTH_SECRET=openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# LLM Configuration
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_key
# or
# OPENAI_API_KEY=your_openai_key
# GROK_API_KEY=your_grok_key

# GitHub Personal Token (optional, for higher API limits)
GITHUB_TOKEN=your_github_personal_token
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Usage

### Login
- Click "Get Started with GitHub"
- Authorize OAuth access to repositories

### Select Repository
- Dashboard shows your repos
- Click to select and sync open issues

### Analyze an Issue
- Click any issue card
- Hit "Run AI Analysis"
- Review severity, root cause, reproduction steps
- View suggested code diff

### Provide Feedback
- Rate helpfulness (👍/👎)
- Helps improve future analyses

### View Analytics
- Dashboard → Analytics tab
- Track completion rate, confidence scores, feedback trends
- See top issues by repository

---

## 🏗️ Architecture