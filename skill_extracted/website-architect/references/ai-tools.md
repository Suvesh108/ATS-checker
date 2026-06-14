# AI Agentic Coding Tools Reference

Use during Stage 6 to recommend the right tool and generate the starter prompt.

---

## Tool Comparison at a Glance

| Tool | Best For | Skill Level | Cost | Setup Needed |
|---|---|---|---|---|
| Google AI Studio | Complete beginners, full-stack apps | None | Free | None — browser only |
| Bolt.new | Fast UI prototypes, visual learners | None–Some | Free tier | None — browser only |
| Lovable | Startups, non-tech founders | None–Some | Free tier | None — browser only |
| Cursor | Developers who want full control | Some–Advanced | Free tier / $20mo | Install desktop app |
| Claude Code | Advanced / terminal-comfortable | Advanced | Usage-based | Install via npm |
| Replit | Learning to code, simple projects | Beginner | Free tier | None — browser only |

---

## Tool Deep Dives

### Google AI Studio (Recommended for most non-tech users)
- **URL**: aistudio.google.com
- **What it does**: You describe your app in plain English and it builds a working Next.js web app. It automatically detects when you need a database or login system and sets them up — no manual configuration.
- **Key strengths**:
  - Zero setup — open browser, start building
  - Auto-wires Firebase Authentication and Firestore database from your prompt
  - Publishes directly to Firebase App Hosting with one click
  - Free to start (Firebase services may need billing account at scale)
- **Best starter prompt style**: Describe the full app in one detailed paragraph. Include purpose, users, key pages, and features.
- **Limitation**: Works best for Next.js web apps. Less suited for highly custom backends or mobile.
- **Note**: Firebase Studio (the predecessor) is being sunset in favour of Google AI Studio as of early 2026.

---

### Bolt.new
- **URL**: bolt.new
- **What it does**: Generates a full-stack web app from a prompt, with a live preview you can see updating in real time. Strong on UI/frontend quality.
- **Key strengths**:
  - Instant visual preview — you see changes as they happen
  - Great UI output — modern, clean designs
  - Supports React, Next.js, Vue, and more
  - Can connect to Supabase for database + auth
- **Best starter prompt style**: Describe the UI and user flow in detail. Mention specific pages and what each one shows.
- **Limitation**: Can get confused on complex backend logic. Better for frontend-heavy projects.

---

### Lovable
- **URL**: lovable.dev
- **What it does**: Similar to Bolt — describe your app, get a working prototype. Popular with startup founders.
- **Key strengths**:
  - Very polished UI output
  - GitHub sync built in
  - Supabase integration for backend
  - Good at iterating based on feedback ("make the button bigger", "change the color scheme")
- **Best starter prompt style**: Start with the core value proposition. "Build me a [type] app where users can [main action]." Then iterate.
- **Limitation**: Free tier has limited monthly credits.

---

### Cursor
- **URL**: cursor.com
- **What it does**: A full desktop code editor (like VS Code) with AI deeply integrated. You can ask it to write, edit, explain, or debug any part of your codebase.
- **Key strengths**:
  - Works with any tech stack
  - Best for iterating on existing code
  - Can read your whole codebase for context
  - Agent mode can make multi-file changes autonomously
- **Best starter prompt style**: Give it the full implementation plan as context, then ask it to start with a specific file or feature.
- **Limitation**: Requires installing a desktop app and some comfort with terminals and file systems.

---

### Claude Code
- **URL**: claude.ai/code (or `npm install -g @anthropic-ai/claude-code`)
- **What it does**: A terminal-based AI agent that can read, write, and run code across your entire project. Most powerful for complex, multi-file work.
- **Key strengths**:
  - Understands your full codebase
  - Can run commands, install packages, run tests
  - Best at complex architecture and refactoring
- **Best starter prompt style**: Give it the full implementation plan document, then say "Start by scaffolding the project structure."
- **Limitation**: Terminal-only — not suitable for complete beginners.

---

### Replit
- **URL**: replit.com
- **What it does**: Browser-based coding environment with AI help. Good for learning and simple projects.
- **Key strengths**:
  - No local setup — everything in browser
  - Good for learning how code works
  - Can host the app directly from Replit
- **Best starter prompt style**: Simple and direct. "Build a [simple description] web app."
- **Limitation**: Less powerful than Cursor or Claude Code for production apps.

---

## Starter Prompt Tips by Tool

### For Google AI Studio / Bolt / Lovable (no-code tools)
- Be **very specific** about pages: list every page by name and what it shows
- Mention the **tech stack explicitly** — they can use different frameworks
- Include the **user types** — "regular users" vs "admin users"
- Describe the **main data** — "products have a name, price, image, and description"
- Say what happens **after key actions** — "after checkout, show an order confirmation page"

### For Cursor / Claude Code (developer tools)
- Paste the **full implementation plan** as context at the start
- Ask it to **read the plan first** before writing any code
- Break work into **one feature at a time** — don't ask for everything at once
- After each feature: ask it to **review for bugs** before moving on
- Keep a running `PROGRESS.md` file and ask the AI to update it after each step

---

## Common Mistakes to Avoid

1. **Asking for too much at once** — "Build my entire website" overwhelms AI tools. Always build feature by feature.
2. **Not specifying the tech stack** — If you don't say, the AI picks randomly and you may end up with something hard to maintain.
3. **Ignoring errors** — If the AI produces broken code, don't just move on. Ask it to fix the error before adding more features.
4. **Not testing after each prompt** — Click through the app after every change to make sure nothing broke.
5. **Forgetting environment variables** — AI tools often hardcode API keys in the code. Always ask: "Move all secrets to environment variables."
