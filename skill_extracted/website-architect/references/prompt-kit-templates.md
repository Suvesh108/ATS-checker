# Prompt Kit Templates Reference

Use during Stage 7 to generate feature-specific prompts. Each section gives a fill-in template. Replace all [BRACKETS] with project-specific details.

---

## Setup Prompts

### Project Initialization
```
Create a new [FRAMEWORK] project called "[PROJECT NAME]" with the following setup:

Tech stack:
- Frontend: [FRAMEWORK + VERSION]
- Styling: Tailwind CSS + shadcn/ui
- Database: [DATABASE]
- Auth: [AUTH PROVIDER]
- Language: TypeScript

Folder structure to create:
[PASTE FOLDER STRUCTURE FROM STAGE 3C]

After scaffolding, install all dependencies and make sure the dev server starts without errors.
Show me the commands I need to run to get started.
```

### Database Setup
```
Set up the database for my [PROJECT NAME] app using [DATABASE PROVIDER].

Create the following tables with these fields:
[PASTE DATABASE SCHEMA FROM STAGE 3C DIAGRAM 3]

Also:
- Add created_at and updated_at timestamps to every table
- Set up the database client in lib/db.ts
- Add the connection string to .env.local (show me the variable name)
- Create a seed file with 3-5 example rows of fake data for testing
```

### Authentication Setup
```
Add authentication to my [FRAMEWORK] app using [AUTH PROVIDER].

Requirements:
- Email + password sign up and login
- [Add "Google login" if social auth was selected]
- [Add "Magic link / passwordless" if selected]
- After login, redirect to [DASHBOARD PAGE]
- After logout, redirect to [HOME PAGE]
- Protect all pages inside [PROTECTED ROUTE GROUP] — redirect to /login if not authenticated
- Show the user's name/avatar in the navbar when logged in

Create these pages:
- /login — Login form
- /signup — Sign up form
- /forgot-password — Password reset request
```

---

## Feature Prompt Templates

### User Profile
```
Add a user profile page at /profile for my [PROJECT NAME] app.

The profile page should show and allow editing of:
- Display name
- Profile photo (upload to [STORAGE PROVIDER])
- [Any other profile fields relevant to the project]
- Email (display only — cannot be changed here)

Requirements:
- Changes save to the [DATABASE] users table
- Show a success message after saving
- Validate that display name is not empty
- Profile photo upload: accept jpg/png, max 2MB, show preview before saving
```

### Search Functionality
```
Add a search feature to [PAGE NAME] in my [PROJECT NAME] app.

Search should:
- Search across [FIELDS TO SEARCH, e.g. "product name, description, and category"]
- Update results in real time as the user types (debounce by 300ms)
- Show a "No results found" message when nothing matches
- Highlight the matching text in the results
- Work on mobile (search bar collapses into an icon on small screens)

Connect the search to [DATABASE TABLE] in [DATABASE PROVIDER].
```

### File / Image Upload
```
Add image upload to [FEATURE NAME] in my [PROJECT NAME] app.

Requirements:
- Accept: jpg, png, webp only
- Max file size: 5MB
- Show a preview of the image before uploading
- Upload to [STORAGE PROVIDER, e.g. Supabase Storage / Cloudinary]
- Store the public URL in the [TABLE NAME].[FIELD NAME] database field
- Show a progress bar during upload
- Show an error if the file is too large or wrong type
- Allow removing/replacing the image after upload
```

### Email Notifications
```
Add email notifications to my [PROJECT NAME] app using [EMAIL PROVIDER, e.g. Resend].

Send emails for these events:
1. [EVENT 1, e.g. "New user signup"] — Subject: "[EMAIL SUBJECT]", Content: [brief description]
2. [EVENT 2, e.g. "Order confirmed"] — Subject: "[EMAIL SUBJECT]", Content: [brief description]
3. [EVENT 3 if applicable]

Requirements:
- Create reusable email templates in /emails folder using React Email
- Send from [FROM EMAIL ADDRESS]
- Store the API key in environment variable RESEND_API_KEY
- Log email send failures but don't crash the app
- In development, log emails to console instead of actually sending
```

### Admin Dashboard
```
Build an admin dashboard at /admin for my [PROJECT NAME] app.

Access control:
- Only users with role = "admin" in the database can access /admin
- Redirect non-admins to the home page with an "Access denied" message

The dashboard should show:
- Total [KEY METRIC 1, e.g. users]: count with a sparkline chart (last 30 days)
- Total [KEY METRIC 2, e.g. orders]: count with revenue total
- Recent [MAIN ENTITY] table: last 20 items with [KEY COLUMNS]
- Ability to [KEY ADMIN ACTION, e.g. "delete a user" or "mark order as shipped"]

Use a sidebar navigation for admin sections.
```

### Payments (Stripe)
```
Add Stripe payments to my [PROJECT NAME] app.

Payment flow:
1. User clicks [BUTTON NAME] on [PAGE NAME]
2. They're taken to a Stripe Checkout page for [PRODUCT/PLAN NAME] at $[PRICE]
3. After successful payment, redirect to /success?session_id={CHECKOUT_SESSION_ID}
4. After cancelled payment, redirect back to [PAGE NAME]
5. The /success page verifies the payment and [ACTION AFTER PAYMENT, e.g. "activates their subscription" or "marks the order as paid"]

Also set up a Stripe webhook at /api/webhooks/stripe to handle:
- checkout.session.completed
- [Any other events needed]

Store STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in environment variables.
Never log or store full card details.
```

### Ratings & Reviews
```
Add a ratings and reviews system to [ITEM TYPE, e.g. "products"] in my [PROJECT NAME] app.

Features:
- Users can leave a 1–5 star rating and optional text review
- One review per user per [ITEM TYPE]
- Users can edit or delete their own review
- Show average rating + review count on [ITEM TYPE] cards and detail pages
- Reviews sorted by newest first, with pagination (10 per page)
- [OPTIONAL: "Flag inappropriate reviews" button]

Database: add a reviews table with: id, user_id, [item]_id, rating (1-5), body, created_at
```

### Real-time Features (Chat / Notifications)
```
Add real-time [FEATURE, e.g. "notifications" or "chat"] to my [PROJECT NAME] app using [Supabase Realtime / Pusher / Socket.io].

Requirements:
- [Describe what updates in real time]
- Show a badge/counter that updates live without page refresh
- [For chat]: messages appear instantly for both sender and receiver
- [For notifications]: unread count in navbar updates in real time
- Handle disconnection gracefully — reconnect automatically

Use [PROVIDER] for the WebSocket connection.
Store messages/notifications in the [TABLE NAME] table in [DATABASE].
```

---

## Polish & Quality Prompts

### Accessibility Audit
```
Audit my [PROJECT NAME] app for accessibility issues and fix them.

Check for:
- All images have descriptive alt text
- All form inputs have labels
- Color contrast meets WCAG AA standard (4.5:1 ratio)
- All interactive elements are keyboard navigable (Tab key)
- Focus indicators are visible
- Error messages are announced to screen readers
- Page has a proper heading hierarchy (h1 → h2 → h3)

Fix all issues you find.
```

### Performance Optimization
```
Optimize the performance of my [PROJECT NAME] app.

Focus on:
1. Images: convert to WebP, add width/height attributes, lazy load below-the-fold images
2. Bundle size: identify and remove unused dependencies
3. Database queries: check for N+1 query problems and fix with joins or batch queries
4. Caching: add appropriate cache headers to API responses that don't change often
5. Core Web Vitals: make sure LCP < 2.5s, CLS < 0.1, FID < 100ms

Show me the before/after impact of each change.
```

### SEO Setup
```
Add basic SEO to my [PROJECT NAME] app.

For every page, add:
- A unique <title> tag (60 characters max)
- A <meta name="description"> (160 characters max)
- Open Graph tags (og:title, og:description, og:image) for social sharing
- canonical URL tag

Also:
- Create a sitemap.xml at /sitemap.xml
- Create a robots.txt at /robots.txt
- Add structured data (JSON-LD) to [KEY PAGE, e.g. "product pages"]

Use [FRAMEWORK]'s built-in metadata API where possible.
```

---

## Debugging Prompt Templates

### Generic Error Fix
```
I'm getting this error in my [PROJECT NAME] app:

[PASTE FULL ERROR MESSAGE AND STACK TRACE HERE]

This happens when I [DESCRIBE WHAT YOU WERE DOING].

Please:
1. Explain what this error means in plain English
2. Identify the root cause
3. Fix it
4. Tell me how to prevent this type of error in the future
```

### Something Stopped Working
```
[FEATURE NAME] was working before but now it's broken. It's supposed to [DESCRIBE WHAT IT SHOULD DO].

What I see instead: [DESCRIBE WHAT HAPPENS]
Error in console (if any): [PASTE ERROR OR "none"]

Please:
1. Check the relevant files for what might have changed
2. Identify the bug
3. Fix it without breaking anything else
```

### Data Not Saving
```
When I [DESCRIBE ACTION, e.g. "submit the product form"], the data is not saving to the database.

The form submits without errors, but when I check [DATABASE PROVIDER] the new row is not there.

Please trace the full flow:
1. Form submission handler
2. API route / server action
3. Database query
4. Error handling

Find where it's failing and fix it.
```

### Deployment Broken
```
My app was working locally but after deploying to [HOSTING PLATFORM] it shows [ERROR or "blank page"].

Deployment logs show: [PASTE RELEVANT LOG LINES]

Common things to check:
- Environment variables set in production dashboard
- Build errors
- API routes working in production
- Database connection from production environment

Please diagnose and tell me exactly what to fix.
```
