# Tutor Consultation Platform — Project Plan (v1)

> Online consultation marketplace connecting users with tutors for paid video sessions. Georgian market, commission-based revenue, manual tutor approval. Built quality-first, no fixed deadline.

---

## 0. What this product is — and is not

### Is

- A **two-sided marketplace** for paid 1-on-1 video consultations between users (clients) and tutors (experts).
- **Tutor-driven supply**: each tutor sets their own price, defines their own consultation offerings, and controls their own availability.
- **Booking-first UX**: a user finds a tutor → picks a slot → pays → joins a video room at the appointed time.
- **Georgian market only** (v1) — Georgian language UI, GEL pricing, Georgian payment rails (TBC + BOG).
- **Escrow-mediated payments**: platform holds funds until session is completed, then pays out to tutor minus commission.

### Is not (v1)

- **Not a course / LMS platform** — no pre-recorded video courses, no enrollment, no progress tracking. Live 1-on-1 only.
- **Not a group session product** — 1 user ↔ 1 tutor per booking. Group calls deferred to v2.
- **Not an international product** — UI is Georgian-only; payments are local rails only; international card support deferred.
- **Not a free / freemium service** — every consultation is paid. No free trials in v1 (tutor may offer "intro" priced low if they choose).
- **Not a SaaS for tutors** — tutors do not get standalone tools (CRM, calendar sync to Google, etc.). They use the platform UI only.
- **Not session-recording by default** — recordings are out of scope for v1 (storage cost, privacy, consent flows). Add in v2 if demand justifies it.
- **Not auto-approved supply** — every tutor profile is manually reviewed before going public.

### Why build this

The Georgian market has fragmented demand for 1-on-1 expert consultations (legal, financial, language tutoring, career coaching, mental health adjacents, etc.) but no dominant local marketplace. Existing options are Facebook groups, personal referrals, or international platforms (which have poor local payment UX). This product collapses that into a trust-mediated marketplace with local payment rails.

**Audience:** consumers seeking expert help + experts wanting to monetize hours without building their own brand site.

---

## 1. Stack (locked decisions)

| Layer | Choice | Rationale |
|---|---|---|
| Frontend framework | Next.js 15 (App Router) + TypeScript | First-class React framework, server components, mature ecosystem, SEO-friendly |
| Runtime | Node.js 20 LTS | Long-term support window aligns with v1 lifetime |
| Styling | Tailwind CSS + shadcn/ui (copy-source pattern) | Speed of iteration; not a UI library — fully owned components |
| Forms | react-hook-form + zod | Type-safe validation shared between client and server |
| Database | PostgreSQL 16 via Neon (serverless) | Auto-scaling, branching, generous free tier, works from Vercel without connection pool issues |
| ORM | Prisma 5 | Type-safe queries, migrations, schema-as-source-of-truth |
| Auth | Auth.js (NextAuth v5) | Built for Next.js App Router; Google OAuth + email/password |
| Session storage | Database sessions (not JWT) | Allows instant logout / session revocation |
| Video | LiveKit Cloud (MVP) | Free tier 50h/mo; self-hostable later; SDK is mature; supports screen share + data channels for in-call chat |
| Payments | TBC E-Commerce API + BOG iPay | Both major Georgian acquirers; required for market coverage |
| Email | Resend | Simple DX; deliverability is good for Georgian inboxes; React Email templates |
| File storage | Cloudflare R2 (S3-compatible) | ~10× cheaper than S3 egress; profile photos, certificates, intro videos, in-call file shares |
| File upload | UploadThing or direct R2 signed URLs | Avoid server-bandwidth hit |
| Realtime (chat) | Pusher Channels (managed) | 1-on-1 chat between user/tutor between bookings; cheap, no infra |
| Cron / scheduled jobs | Vercel Cron + DB-backed job queue | Send reminders, auto-cancel pending payments, mark sessions overdue |
| Logging / errors | Axiom or Sentry (free tier) | Catch runtime errors in prod; Axiom good for structured logs |
| Hosting | Vercel (Hobby → Pro when needed) | Zero-config Next.js; the only realistic option for App Router in 2026 |
| CI | GitHub Actions | Lint + type-check + test on PR |
| Package manager | pnpm | Faster, deterministic, monorepo-ready if needed |

### Not chosen — and why

| Option | Why rejected |
|---|---|
| Cloudflare Pages | Next.js App Router support still has rough edges in 2026; Workers runtime breaks Prisma without Drizzle. Re-evaluate in v2. |
| Supabase | Neon is sharper for serverless Postgres; we don't need Supabase's auth/storage bundle (we have Auth.js + R2). |
| Drizzle ORM | Prisma's DX is better for a solo team; Drizzle's edge-runtime advantage doesn't apply if we're not on Cloudflare. |
| tRPC | Server Actions + Route Handlers cover our needs; tRPC's extra layer doesn't justify its complexity here. |
| Daily.co / Twilio Video | LiveKit Cloud is cheaper at our scale and self-hostable for v2. Both are fine alternatives if LiveKit hits limits. |
| Stripe Connect | Doesn't help us — we need local Georgian acquirers, not international cards. |
| Custom WebRTC | 4–6 weeks of engineering just for signaling/TURN/recording. LiveKit gives us 95% of that for free. |

---

## 1.5. Design system specification

### Locked design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Visual direction | **Clean Modern + Warm details** | Confident, calm, professional. Linear/Vercel precision + Airbnb-style photo-driven tutor cards. |
| Color philosophy | **Indigo primary + Coral accent** | Indigo = trust, calm, modern. Coral = warmth, energy on CTAs. Avoids both corporate-cold and gamified-bright. |
| Typography | **Noto Sans Georgian (UI) + Inter (numeric)** | Noto handles Georgian properly; Inter is the gold-standard sans for prices/dates. |
| Tone | "Confident Calm" | Trust-first. Not flashy. Not corporate. Not over-friendly. |
| Mobile philosophy | Mobile-first | 70%+ of Georgian traffic is mobile. Every screen designed for 375px before 1440px. |

### Inspiration benchmarks

| Reference | Take | Don't take |
|---|---|---|
| Linear | Typography precision, motion design, density | Dev-tools focus |
| Cal.com | Booking UX, slot picker design | Corporate feel |
| Intro.co | Tutor card design, trust signals, premium feel | High price-tier branding |
| Airbnb | Photo-driven cards, search UX, filters | Over-friendliness |
| Vercel | Minimalism, typography, dark mode patterns | Tech-only audience |
| Notion | Warmth + clarity balance, illustration style | Feature-bloat |

### Color tokens (locked)

```css
/* Primary — Indigo (trust, calm, action) */
--primary-50:   #EEF1FF
--primary-100:  #DDE3FF
--primary-500:  #3D52F5   /* main brand */
--primary-600:  #2A3FE0   /* hover */
--primary-700:  #1F30B8   /* pressed */
--primary-900:  #0F1A6B   /* deep accent */

/* Accent — Coral (CTA emphasis, warmth) */
--accent-50:    #FFF1EC
--accent-500:   #FF8A65   /* main accent */
--accent-600:   #F76B43   /* hover */

/* Neutrals — warm grey (not pure greys) */
--neutral-0:    #FFFFFF
--neutral-50:   #FAFAF7   /* page surface */
--neutral-100:  #F4F4EF   /* card subtle */
--neutral-200:  #E8E8E2
--neutral-400:  #9CA3AF
--neutral-600:  #4B5563
--neutral-900:  #1A1A1A   /* main text — not pure black */

/* Semantic */
--success:      #10B981   /* booking confirmed */
--warning:      #F59E0B   /* expiring soon */
--danger:       #EF4444   /* errors only — used sparingly */
```

**Contrast verification (WCAG AA):**
- `neutral-900` on `neutral-50` = 17.4:1 ✅
- `primary-500` on `neutral-0` = 5.9:1 ✅ (large text), borderline for body — use `primary-700` for inline link text
- `accent-500` on `neutral-0` = 3.1:1 ⚠️ — use only as background-color with white text, never as text color on white

### Shadow / elevation tokens

```css
--shadow-rest:  0 1px 2px rgba(16,24,40,0.04)
--shadow-hover: 0 4px 12px rgba(16,24,40,0.08)
--shadow-modal: 0 24px 48px rgba(16,24,40,0.16)
--shadow-focus: 0 0 0 3px rgba(61,82,245,0.12)   /* focus ring */
```

### Typography scale

| Token | Desktop | Mobile | Weight | Use |
|---|---|---|---|---|
| `display` | 72px / 1.05 / -2% | 42px / 1.1 | 700 | Hero headlines only |
| `h1` | 48px / 1.1 / -1% | 32px / 1.2 | 700 | Page titles |
| `h2` | 32px / 1.2 | 24px / 1.3 | 600 | Section headers |
| `h3` | 24px / 1.3 | 20px / 1.3 | 600 | Subsection |
| `h4` | 20px / 1.4 | 18px / 1.4 | 600 | Card titles |
| `body-lg` | 18px / 1.6 | 17px / 1.6 | 400 | Lead paragraphs |
| `body` | 16px / 1.6 | 16px / 1.6 | 400 | Default |
| `body-sm` | 14px / 1.5 | 14px / 1.5 | 400 | Secondary |
| `caption` | 13px / 1.4 | 13px / 1.4 | 500 | Meta info, labels |

**Line-height note:** Georgian script needs `1.6` for body (vs Latin's `1.5`) — descenders need room.

**Font loading:** Preload Noto Sans Georgian (400, 600, 700) + Inter (500, 600). Use `font-display: swap` to avoid FOIT.

### Spacing scale

4px base — `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`

### Border radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | Badges, tags, chips |
| `radius` | 10px | Buttons, inputs |
| `radius-card` | 14px | Cards |
| `radius-modal` | 20px | Modals, sheets |
| `radius-full` | 9999px | Pills, avatars |

### Layout

| Breakpoint | Width | Container padding | Tutor grid cols |
|---|---|---|---|
| `xs` | < 640px | 16px | 1 |
| `sm` | ≥ 640px | 24px | 2 |
| `md` | ≥ 1024px | 32px | 3 |
| `lg` | ≥ 1440px | 48px | 4 |

**Max content width:** 1280px. Hero sections may go full-bleed.

### Component specs

#### Buttons

| Variant | Background | Border | Text | Use |
|---|---|---|---|---|
| `primary` | `primary-500` | none | white | Default actions |
| `secondary` | white | 1px `neutral-200` | `neutral-900` | Secondary actions |
| `ghost` | transparent | none | `primary-700` | Tertiary actions |
| `coral` | `accent-500` | none | white | **The** primary action only (Book, Pay) |
| `danger` | white | 1px `danger` | `danger` | Destructive (Cancel booking) |

| Size | Height | Padding-x | Font |
|---|---|---|---|
| `sm` | 36px | 12px | `body-sm` |
| `default` | 44px | 16px | `body` |
| `lg` | 52px | 24px | `body-lg` |

States: rest → hover (slight lift + darker shade) → pressed (scale 0.98) → disabled (opacity 0.4) → loading (spinner replaces label, button stays width-locked).

#### Inputs

- 48px height (touch-friendly)
- **Floating label pattern** — cleaner for Georgian (long labels don't truncate)
- 1px border → 2px on focus + focus-ring shadow
- Error state: red border + helper text below in `danger` color
- Disabled: `neutral-100` background, `neutral-400` text

#### Cards

- `radius-card` = 14px
- `shadow-rest` by default
- `shadow-hover` + `translateY(-2px)` on hover (200ms ease-out)
- 24px internal padding (16px mobile)

#### Modals

- Desktop: centered, `radius-modal`, `shadow-modal`, backdrop with 8px blur
- Mobile: **bottom sheet** — slides up from bottom, top corners rounded only
- Dismiss: ✕ top-right + backdrop click + Escape key
- Focus trap inside modal, returns focus to trigger on close

#### Toasts

- Desktop: top-right, stack max 3 (oldest pushed out)
- Mobile: top-full-width
- Auto-dismiss 4s (success), 6s (error), persistent (with manual ✕) for critical
- Icon + title + (optional) description

### Page anatomy (locked layouts)

#### Homepage
```
HEADER         logo │ nav │ login/register
HERO           headline + search + trust badges
CATEGORIES     8–12 icon grid
FEATURED       3 categories × tutor carousel
HOW IT WORKS   3-step illustrated
TRUST STRIP    TBC/BOG logos + stats
TESTIMONIALS   3 user quotes
FAQ TEASER     top 4 questions
CTA BAND       "become a tutor" — coral bg
FOOTER         links, social, contact
```

#### Tutor profile (`/tutors/[slug]`)
```
Desktop: 2-column. Main content 66%, sticky booking sidebar 33%.
Mobile:  Stacked, with FIXED bottom booking bar.

Above-fold:
  Photo (large) | Name + headline + ★ + category tags + share

Tabs:
  [About] [Consultations] [Reviews] [Calendar]

About:    intro video, bio, skills (chips), education, experience, certs
Consult:  cards (title, duration, price, "Book")
Reviews:  aggregate + breakdown bars + individual reviews
Calendar: month view with available days highlighted

Sticky booking sidebar (desktop):
  "ხელმისაწვდომი დრო"
  Mini calendar
  Today's available slots
  Prominent "ნახე ყველა დრო" CTA
  Trust strip: "გადახდა დაცულია TBC-ით"
```

#### Booking modal (3 steps)
```
Step 1: Select consultation offering
Step 2: Pick date + slot (calendar + slot grid)
Step 3: Review summary + choose TBC or BOG → pay

Progress bar at top: ● ─ ○ ─ ○   1/3
Back button on steps 2 + 3
Cannot skip steps
Step 3 includes expandable "Refund policy" + T&C checkbox
```

#### Video session room
```
Full-bleed peer video, self-view bottom-right (draggable, 200×150 default).
Top bar (translucent): tutor name + remaining time + connection quality.
Bottom control bar (translucent, centered): mic, camera, share, chat, files, end.
Chat panel: slides from right, 33% width desktop, full overlay mobile.
```

#### Dashboard (user)
```
Top bar:    avatar │ notifications │ logout
Left nav (desktop) / Bottom nav (mobile):
  📊 Dashboard │ 📅 Consultations │ 💳 Payments │ ⚙ Settings │ 💬 Support

Main grid (2-col responsive):
  ┌──────────────────────┬─────────────────┐
  │ UPCOMING (large)     │ STATS WIDGET    │
  ├──────────────────────┴─────────────────┤
  │ RECENT BOOKINGS                         │
  ├──────────────────────┬─────────────────┤
  │ SAVED TUTORS         │ PAYMENT HISTORY │
  └──────────────────────┴─────────────────┘
```

### Trust signals (mandatory)

The user is sending money to a stranger. Every screen with a price or action must reinforce trust:

- ✅ "გადახდა დაცულია TBC/BOG-ით" badge near every price
- ✅ "მოწმდება" (Verified) badge on approved tutor profiles
- ✅ "X წარმატებული კონსულტაცია" counter on profile + cards
- ✅ "ფული უკან გაბრუნდება თუ ტუტორი არ ჩამოვა" near booking CTA
- ✅ Real names + real photos (no avatar-only profiles — admin reject criterion)
- ✅ Review counts shown explicitly (5 reviews ≠ 500 reviews visually)
- ✅ Encrypted padlock icon next to prices
- ✅ Last-active indicator: "ბოლოს ნანახი: 2 საათის წინ"
- ✅ Money-back guarantee on T&C page, linked from booking step 3

### Microinteractions

| Element | Duration | Easing |
|---|---|---|
| Default transition | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Button press | 100ms | `ease-out` |
| Card hover lift | 200ms | `ease-out` |
| Modal slide-up | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Modal backdrop fade | 200ms | `ease-out` |
| Skeleton shimmer | 1500ms loop | linear |
| Booking confirmed animation | 300ms checkmark + 1500ms hold + redirect | `ease-out` |
| Toast slide-in | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Tab underline slide | 150ms | `ease-in-out` |

**Respect `prefers-reduced-motion`** — disable all non-essential transitions, keep duration < 100ms for critical feedback.

### Mobile-specific patterns

- **Bottom navigation bar** (not sidebar) in dashboards.
- **Bottom sheets** for filters, forms, modals — not center modals.
- **Sticky CTA bar** on tutor profile (Book button always visible).
- **Pull-to-refresh** on dashboard + consultations list.
- **Min touch target: 44×44pt** (iOS HIG).
- **Swipeable carousels** for tutor lists on home.
- **iOS safe-area-insets** respected (notch top, home indicator bottom).
- **Tap haptics** on critical actions (where supported) via `navigator.vibrate(10)`.

### Empty / Loading / Error states

| State | Pattern |
|---|---|
| **Empty** | Simple line illustration (or icon) + Georgian copy + actionable CTA. Never just "No data." |
| **Loading** | Skeleton screens matching the actual layout. **Never** full-page spinners. Shimmer animation. |
| **Error** | Friendly icon (not aggressive red ✗) + plain-Georgian explanation + retry button. Log to Sentry with context. |

Example empty states:
- No bookings yet → "ჯერ არ გაქვს დაჯავშნილი კონსულტაცია" + "იპოვე ექსპერტი →"
- No tutors match filters → "ფილტრებს არ შეესაბამება ექსპერტი" + "გასუფთავება" button
- No payments yet → "ჯერ არ გაგიხდია არცერთი კონსულტაცია"

### Iconography

- **Lucide React** only (already bundled with shadcn/ui).
- Consistent stroke-width 1.5px.
- 20×20 default, 16×16 in dense UI, 24×24 in hero areas.
- Never mix icon libraries.

### Photography guidelines (tutor profile photos)

Admin uses these criteria during T7.2 approval review:

**✅ Acceptable:**
- Plain or simple office background
- Smiling, eye contact with camera
- Shoulders-up framing
- Natural lighting preferred
- Min resolution 800×800

**❌ Rejected:**
- Heavy filters / over-edited
- Group photos
- Sunglasses, hats covering face
- Low resolution (< 800×800)
- Inappropriate setting (bedroom, party, etc.)
- Branded clothing of another company

### Accessibility (WCAG 2.1 AA target)

- All interactive elements ≥ 44×44pt
- Color contrast ≥ 4.5:1 for body text, 3:1 for large text
- Focus visible on every interactive element (`shadow-focus` ring)
- Skip-to-content link at top of each page
- ARIA labels in Georgian on icon-only buttons
- Form labels associated with inputs (programmatic + visual)
- Error messages linked to inputs via `aria-describedby`
- Keyboard nav: Tab order matches visual order
- `prefers-reduced-motion` respected
- Screen reader testing on iOS VoiceOver + Android TalkBack pre-launch

### Design workflow (no separate Figma file)

**Decision (D21):** We will NOT maintain a separate Figma design file. Reasons:
- Solo developer; no dedicated designer
- Figma maintenance overhead doesn't pay off at our scale
- Risk of Figma↔code drift

**How design happens instead:**
1. **§1.5 design system spec** (this section) is the single source of truth for tokens, components, behavior.
2. **Each UI-building atomic task includes inline design detail** — what it looks like, copy, sizes, colors, states — so the implementer (human + AI assist like v0.dev / Claude / Cursor) has everything needed.
3. **Inspiration screenshots in `docs/design/inspiration/`** — collected at T0.11 from Cal.com, Intro.co, Airbnb, Linear, etc., for visual reference only.
4. **`/_design` showcase route** (T0.14) — the live component library is the canonical visual reference once T0.13/T0.14 are done.
5. **Per-Phase Gate visual review** — compare built screen against §1.5 + inline task spec + inspiration screenshots; iterate in-browser until it feels right.

**When implementation needs a layout decision not covered:** pick something that matches §1.5 tokens + Clean Modern + Warm direction (D15), commit it, document in `docs/design/decisions.md` for consistency next time.

### Visual specs per page (inline reference)

These descriptions complement §1.5 and are linked from the relevant Phase 2/3/4/5/6 tasks. Read this section together with the §1.5 page-anatomy ASCII diagrams.

#### Homepage hero (T2.1)
- Background: `neutral-50` solid (no gradient v1)
- Layout: 2-column desktop (text 60% / visual 40%), stacked mobile
- Headline: `display` token (72px desktop / 42px mobile), Noto Sans Georgian Bold, `neutral-900` color, max 2 lines
- Headline copy: "გიპოვე ექსპერტი, მოწესთ კონსულტაცია" (or final wording)
- Subhead: `body-lg` token, `neutral-600`, max 3 lines
- Search bar: 56px height, full-width on mobile + 70% on desktop, white bg + 1px `neutral-200` border, lock icon left + autocomplete chevron right, "გაიგე ექსპერტი ან კატეგორია..." placeholder
- Primary CTA: `coral` variant, `lg` size — "დაიწყე ძებნა →"
- Secondary CTA: `secondary` variant, `lg` size — "გახდი ექსპერტი"
- Trust badges row below CTAs: 3 inline (TBC/BOG logo, "100+ ექსპერტი", "★ 4.8 საშუალო")
- Visual right side (desktop): photo collage of 3-4 tutor avatars on Indigo gradient backdrop, OR abstract geometric Indigo+Coral composition (avoid stock photos)

#### Tutor card (T2.1, T2.2)
- Width: 100% of grid column. Aspect ratio: photo 4:5 + 96px content footer
- Photo: top, 4:5 ratio, `radius-card` top corners only, `next/image` with sizes
- Verified badge: top-right of photo if approved, small Indigo circle with white checkmark
- Footer content (16px padding):
  - Line 1: Name (Noto Sans Bold, `body-lg`, `neutral-900`)
  - Line 2: Headline (`body-sm`, `neutral-600`, max 2 lines clamp)
  - Line 3: Category chip (`Badge` variant=secondary, 12px text)
  - Line 4 (split): ★ rating left (e.g., "★ 4.9 · 23"), starting price right ("50₾-დან")
- Card states: rest `shadow-rest`, hover `shadow-hover` + translateY(-2px), focus same as hover + `shadow-focus` ring
- Click target: entire card (anchor wrapper)

#### Tutor profile hero (T2.3)
- Layout: photo left 280×350 (desktop) / full-width mobile, content right
- Photo: `radius-card`, object-fit cover
- Content: Name (`h1`), Verified badge inline if approved, Headline (`body-lg`, `neutral-600`), category tags (Badge row), rating + review count (`★ 4.9 · 23 მიმოხილვა`), "გაზიარება" share button (icon-only `ghost`)
- Below hero: Tabs (About / Consultations / Reviews / Calendar) — underline-style, sticky on scroll past hero on desktop
- Sticky right column (desktop only, 380px wide): Booking widget — see below

#### Booking widget sticky sidebar (T2.3 / T4.1)
- Card with `shadow-rest`, `radius-card`, 24px padding
- Title: "ხელმისაწვდომი დრო" (`h4`)
- Mini calendar: current month, available days highlighted in `primary-100`, today outlined, past days disabled
- Below calendar: list of today's available slots (up to 5) as compact `SlotButton`s in 2-col grid
- "ნახე ყველა დრო →" full-width `primary` button → opens booking modal
- Trust strip below button: small lock icon + "გადახდა დაცულია TBC/BOG-ით" (`caption`, `neutral-600`)
- Mobile equivalent: fixed bottom bar with single "ნახე დრო და დაჯავშნე →" `coral` button (always visible while scrolling tutor profile)

#### Booking modal (T4.1, 3 steps)
- Desktop: `Dialog` centered, 560px wide, 20px radius, 24px padding
- Mobile: `Sheet` bottom-sheet variant, full-height with handle indicator on top
- Header: progress indicator (●─○─○ 1/3) centered + ✕ close top-right
- Back button: appears top-left from step 2 onward (`ghost` size `sm`)
- Step 1 — ConsultationPicker:
  - Title: "აირჩიე კონსულტაცია"
  - List of consultation cards (each `Card` clickable, single-select):
    - Title (`body-lg` bold)
    - Duration chip + price chip (right-aligned: "30 წთ · 50₾")
    - Short description (`body-sm`, `neutral-600`, 2-line clamp)
  - Selected state: `primary-500` border 2px + `primary-50` bg
- Step 2 — DatePicker + SlotGrid:
  - Title: "აირჩიე დღე და დრო"
  - Calendar (full width): month nav arrows + grid of dates, available days `primary-100` bg, selected day `primary-500` bg white text
  - Below calendar: grid of slot buttons (4-col desktop, 3-col mobile), each `SlotButton` shows time "14:00" — available/booked/selected states
  - Selected slot: `coral-500` bg, white text
- Step 3 — Summary:
  - Title: "გადახედე და გადაიხადე"
  - Summary card (`Card` with `neutral-50` bg): tutor name + photo + consultation + date/time + price line items + total
  - Refund policy: collapsible details below summary
  - T&C checkbox: "ვეთანხმები წესებსა და კონფიდენციალურობის პოლიტიკას"
  - Two payment buttons side-by-side (desktop) / stacked (mobile):
    - "გადახდა TBC-ით" (`secondary` variant + TBC logo left)
    - "გადახდა BOG-ით" (`secondary` variant + BOG logo left)

#### Dashboard widgets (T6.1)
- Grid: 2-col desktop (gap 24px) / 1-col mobile
- Each widget = `Card` with `shadow-rest`, 24px padding
- UpcomingBookingWidget (spans 2 cols on desktop):
  - Header: "შემდეგი კონსულტაცია" + "ნახე ყველა →" link
  - If has booking: tutor avatar (large 64px) + tutor name + consultation title + datetime (formatted "ხვალ 14:00") + countdown badge if < 24h + "შესვლა" coral CTA if within join window
  - If empty: friendly illustration + "ჯერ არ გაქვს დაჯავშნილი კონსულტაცია" + "იპოვე ექსპერტი →" `primary` button
- StatsWidget: 2 stats in 2-col mini-grid (total consultations, total spent), big numbers + label

#### Video session room (T5.4)
- Background: solid `neutral-900` (dark theme regardless of user preference — room is its own context)
- Peer video: full-bleed, `object-fit: cover`
- Self-view: PiP 200×150 default, bottom-right, draggable, `radius` 10px, white 2px border
- Top bar: translucent black bg (rgba 0,0,0,0.4) backdrop-blur, 48px height
  - Left: peer name + small green dot if connected
  - Center: countdown "23:42 დარჩა"
  - Right: connection quality indicator (3 bars + label)
- Bottom control bar: translucent, centered, 64px height, auto-hide after 3s desktop idle
  - 6 icon buttons (48×48 each): mic, camera, share-screen, chat, files, end-call
  - End-call: `danger` variant red, others `secondary` translucent
  - States: muted = strikethrough on icon
- Side panel (right, slides in 360px wide): tabs Chat / Files, dark theme
- Mobile: full-bleed, controls overlay tap to show, side panel full-screen overlay

#### Empty / Error / Loading state copy library
Use these exact Georgian strings for consistency:
- No bookings: "ჯერ არ გაქვს დაჯავშნილი კონსულტაცია" + CTA "იპოვე ექსპერტი →"
- No tutors match filters: "ფილტრებს არ შეესაბამება ექსპერტი" + CTA "ფილტრების გასუფთავება"
- No payments: "ჯერ არ გაგიხდია არცერთი კონსულტაცია"
- No reviews yet: "ჯერ არ აქვს მიმოხილვები"
- Network error: "კავშირი ვერ მოხერხდა" + CTA "სცადე თავიდან"
- 404: "გვერდი ვერ მოიძებნა" + CTA "მთავარზე დაბრუნება"
- 500: "რაღაც არ გამოვიდა" + "სცადე ცოტა ხანში თავიდან"
- Booking slot taken: "ეს დრო უკვე დაიჯავშნა — აირჩიე სხვა"
- Payment failed: "გადახდა ვერ მოხდა — სცადე სხვა ბარათით ან მოგვიანებით"
- Form validation generic: "შეასწორე მონიშნული ველები"

#### Per-screen copy guidelines

- Address user as "შენ" (informal singular) — not "თქვენ" (too formal for a consumer product)
- Numbers + currency: always with `numeric` font + space before ₾ (e.g., "50 ₾")
- Time: "14:00" 24-hour format
- Dates: "15 მაისი 2026" relative for upcoming ("ხვალ", "მე-3 დღეს")
- Errors are calm, not alarming — never "შეცდომა!" prefer "რაღაც არ გამოვიდა"
- CTAs are imperative verbs: "დაიწყე", "გადახდე", "შესვლა", "შენახვა"

**When implementation could go either way:** match §1.5 spec + Clean Modern + Warm direction (D15). When in doubt, simpler wins.

---

## 1.6. Testing strategy

### Philosophy

This is a marketplace with **money + video + scheduling** — three categories where bugs cost real users real money. The testing strategy is **defense in depth**: every layer catches a different class of bug.

**Rule of thumb:**
- Anything involving money, slot allocation, or auth must have integration tests.
- Every user-facing flow must have an E2E test before it ships.
- Every phase ends with a **manual phase gate** — a human walks through the new flow before merging to `master`.

### Testing pyramid (target distribution)

| Layer | % of total tests | Tool | Runs |
|---|---|---|---|
| Unit (pure logic) | ~50% | Vitest | every commit |
| Integration (DB, API, server actions) | ~30% | Vitest + Testcontainers (Postgres) | every commit |
| Component (critical UI) | ~10% | Vitest + Testing Library | every commit |
| E2E (full user flows) | ~10% | Playwright | every PR + nightly |

### Automated test types

#### 1. Unit tests (Vitest)

**Must cover:**
- Slot generation logic (T3.9) — every branch
- Refund amount calculation (per policy bracket)
- Commission calculation
- Booking state machine transitions
- Date/time utilities (timezone conversion, formatting)
- Validation schemas (zod) — invalid inputs rejected
- Pure business helpers (price formatting, name slugging)

**Coverage target:** ≥ 80% for `src/lib/`. Enforced in CI.

#### 2. Integration tests (Vitest + Testcontainers)

**Must cover:**
- Booking creation with race conditions (10 parallel inserts → 1 wins)
- Booking expiration cron behavior
- Webhook signature verification (TBC + BOG)
- Booking state machine end-to-end (PENDING → PAID → COMPLETED)
- Refund flow (cancellation → acquirer call → state update)
- Payout queue (HELD → RELEASED transitions)
- Auth flow (registration → verify email → login → logout)
- Role-based middleware (USER, TUTOR, ADMIN access patterns)

Each integration test spins up a fresh Postgres via Testcontainers — no shared state between tests.

#### 3. Component tests (Vitest + @testing-library/react)

**Must cover:**
- Booking modal (3-step flow, state persistence across steps, validation)
- Slot picker (renders available slots, disables booked ones)
- Filter component (URL state sync)
- Floating-label input (label animation, error state)
- Toast stacking (max 3, oldest pushed out)

#### 4. E2E tests (Playwright)

**Must cover the golden paths:**
- User registration → email verification → login
- Google OAuth signup → profile completion
- Browse tutors → filter → tutor profile → book → mock payment → confirmation
- Tutor onboarding wizard → submit for approval
- Admin approves tutor → tutor appears in listings
- Cancel booking → refund flow
- Video session join (mocked LiveKit room) → both parties present → end call → review

**Runs:** every PR + nightly cron. Test data seeded via Prisma + cleaned after each run.

**Mock acquirer:** Phase 4 builds an internal mock TBC/BOG endpoint behind a feature flag for E2E — no dependency on bank sandboxes during CI runs.

#### 5. Accessibility tests (axe-core)

- Integrated into Playwright E2E runs.
- Every navigated page is scanned.
- 0 violations on critical pages (homepage, tutor profile, booking modal, dashboard).

#### 6. Visual regression (optional v1)

- Chromatic or Percy on PR — defer unless we see CSS regressions in practice.
- For v1, manual visual review in Vercel Preview is sufficient.

#### 7. Type + lint checks

- `pnpm type-check` — TypeScript strict, blocks PR on failure.
- `pnpm lint` — ESLint with `next/core-web-vitals` + `@typescript-eslint/strict`, blocks PR on failure.

#### 8. Lighthouse CI

- Mobile Performance ≥ 85, Accessibility ≥ 95 (T8.1).
- Runs on PR against preview deploys.
- Blocks merge if budget broken on key pages.

#### 9. Load tests (k6)

- Pre-launch only (T8.4).
- Scenarios: 100 concurrent browsers, 20 concurrent bookings, 50 simultaneous video joins.
- Not in CI — manual run on staging before each major release.

#### 10. Security scans

- `pnpm audit` in CI — blocks on high/critical vulnerabilities.
- Snyk free tier — weekly scan.
- Sentry alerts on production errors.
- Pre-launch external pentest (T8.5).

### Manual testing

Automation catches regressions; humans catch UX problems. **Both are required.**

#### A. Phase gate checklist (after every phase)

Each phase ends with a structured manual walkthrough — see "Phase gate" subsections in §9. Until the gate checklist passes, do not start the next phase.

#### B. Real-device testing

- After Phase 2: test homepage + tutor browse on real iPhone (mid-range, e.g., iPhone 12) + real Android (e.g., Samsung A-series).
- After Phase 4: test full booking flow + payment on real devices.
- After Phase 5: test video session on real devices (2 humans, 2 networks).
- Phase 8: final cross-device pass.

#### C. Real payment sandbox testing

- TBC + BOG provide test cards for success / decline / 3D-Secure / chargeback.
- Phase 4 gate: every test card scenario verified end-to-end.

#### D. Real video session testing

- LiveKit cannot be fully mocked for production confidence.
- Phase 5 gate: 2 real humans join a real LiveKit room from different networks (one Wi-Fi, one mobile data). All controls tested. Disconnect/reconnect tested.

#### E. Accessibility manual audit

- Keyboard navigation: tab through every page without mouse.
- VoiceOver (macOS Safari) on key flows.
- TalkBack (Android Chrome) on mobile.
- Phase 8 dedicated audit (T8.2).

#### F. UX review (heuristic)

- Phase 8 gate: a non-developer (friend, family member) does a complete booking without help. Observe pain points. Fix them.
- Don't skip this — devs build paths-of-least-resistance through their own UI.

#### G. Email deliverability

- Phase 1 gate: test email arrives at Gmail, Yahoo, `.ge` mailbox (`.ge` matters because Georgian inboxes often have aggressive filtering).
- Pre-launch (T8.7): re-verify all production templates.

### Test data & fixtures

- `prisma/seed.ts` — deterministic seed data for dev + E2E:
  - 1 admin, 2 users, 5 tutors (across statuses), 10 consultations, 20 bookings (across statuses).
- `src/tests/factories/` — Factory functions for ad-hoc test data (per-test, not shared).
- Never use production data in tests. Never log PII.

### CI/CD pipeline (GitHub Actions)

**Per-commit on any branch:**
```
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:integration
```

**Per-PR (also runs against Vercel preview):**
```
pnpm test:e2e (Playwright, headless)
pnpm test:a11y (axe-core via Playwright)
Lighthouse CI on changed routes
pnpm audit (security)
```

**Nightly:**
```
Full E2E suite (longer scenarios)
Snyk vulnerability scan
```

**Pre-deploy to production:**
```
Full CI green
Manual phase gate passed
Smoke test on staging (T8.7)
```

### Coverage reporting

- Codecov on every PR (free tier).
- Threshold: 80% for `src/lib/`, 60% overall.
- New code in PR must not lower coverage.

---

## 2. Targets (honest numbers)

### Performance (v1)

| Metric | v1 baseline | v1 stretch | Notes |
|---|---|---|---|
| Homepage TTFB (Tbilisi user, warm cache) | < 400ms | < 200ms | Vercel Frankfurt PoP, ISR for tutor cards |
| Largest Contentful Paint (mobile, 4G) | < 2.5s | < 1.8s | Below Core Web Vitals "good" threshold |
| Booking-to-payment-redirect | < 1.5s | < 1s | Critical for conversion |
| Video room join time | < 3s | < 2s | After clicking "join", time to seeing peer video |
| API p95 (read endpoints) | < 200ms | < 100ms | Neon close to Frankfurt = good |
| API p95 (write endpoints, payment) | < 800ms | < 500ms | Includes TBC/BOG round-trip |

### Functional (v1)

| Metric | Target | Notes |
|---|---|---|
| Tutor approval SLA | < 48h | Manual; admin emails reviewed daily |
| Payment success rate | > 95% | Excluding user-cancelled flows |
| Refund processing time | < 5 business days | TBC/BOG processing window |
| Booking slot conflict rate | 0 | Race condition handling is acceptance criteria, not a goal |
| Email delivery rate (Resend → user inboxes) | > 98% | SPF, DKIM, DMARC all configured |

### Scale envelope (v1)

- **≤ 100 active tutors**
- **≤ 1,000 registered users**
- **≤ 200 bookings / month**
- **≤ 50 concurrent video sessions** (peak)

Above these numbers we re-evaluate hosting tier, Neon plan, and LiveKit pricing.

---

## 3. Critical architectural decisions

These are decisions that, if wrong, are expensive to undo. Lock them now.

### 3.1 Booking concurrency model

**Problem:** Two users select the same slot simultaneously. Without protection, both bookings succeed and one tutor has a double-booked calendar.

**Decision:** Database `UNIQUE (tutor_id, start_time)` constraint on `bookings` table, combined with a "PENDING" state during the payment window.

**Flow:**
1. User clicks slot → `INSERT INTO bookings (..., status='PENDING', expires_at=NOW()+10min)` inside a transaction.
2. If `INSERT` fails due to unique violation → return "slot taken, refresh" to user.
3. User is redirected to TBC/BOG payment page.
4. On webhook success → `UPDATE booking SET status='PAID'`.
5. On webhook fail / timeout (cron job runs every 5 min) → `UPDATE booking SET status='EXPIRED'` and slot is free again.

**Acceptance:** Two parallel HTTP requests for same slot — exactly one succeeds, other gets HTTP 409.

### 3.2 Escrow / payout model

**Problem:** When does the tutor get paid? Before the session (bad — tutor no-shows risk for user) or after (bad — payment provider chargebacks against platform)?

**Decision:** Platform-held escrow. Funds collected by platform's TBC/BOG merchant account on booking. Tutor payout happens **after** session completion via manual weekly batch (v1) or automated weekly job (v2).

**Implications:**
- Platform owns merchant accounts at both TBC and BOG (not the tutor).
- Tutor onboarding collects IBAN + personal ID for payouts.
- Refund flow: if user requests refund within policy window AND tutor agrees (or admin rules in user's favor), platform issues refund via acquirer API; no money has left platform yet.
- **Legal:** This is a financial intermediary operation. **Must consult a Georgian lawyer before launch** — likely requires IE registration of platform owner and possibly a payment-services license depending on volume.

**Acceptance:** Booking flow stores `payout_status: HELD | RELEASED | REFUNDED` on each transaction; weekly admin view shows pending payouts.

### 3.3 Tutor approval workflow

**Decision:** All new tutor profiles start as `status='PENDING_REVIEW'`. Not searchable, not bookable. Admin sees a queue at `/admin/tutors/pending`, reviews each profile, and clicks Approve / Reject (with reason). Email notification on decision.

**State machine:**
```
PENDING_REVIEW → APPROVED → (optionally) SUSPENDED → APPROVED
                 ↓
              REJECTED (terminal, but tutor can reapply after editing)
```

### 3.4 Video session lifecycle

**Decision:** A LiveKit room is created **lazily** at session start (15 min before scheduled time), not at booking time. Room name = `booking-${booking_id}`. Tokens are JWT-signed server-side per join request.

**Why lazy:** LiveKit charges per room-minute even if empty. Pre-creating wastes money.

**Join window:** Both parties can join 15 min before start, 15 min after start. Past that, the room is closed and the session is marked NO_SHOW for whichever side didn't join.

### 3.5 Cancellation & refund policy

**Decision (default; tutor may override):**
- User cancels > 24h before: full refund.
- User cancels < 24h before: 50% refund.
- User cancels < 2h before, or no-show: no refund.
- Tutor cancels (any time): full refund + flag on tutor profile (3 strikes → suspension).

Policy is stored in DB per tutor (with sensible default) so it can be tuned without code changes.

### 3.6 SEO / discoverability

**Decision:** Tutor profile pages and category landing pages are statically generated with **ISR (Incremental Static Regeneration)** at 60s revalidation. URLs are slug-based: `/tutors/giorgi-meladze`, `/category/business-consulting`. `sitemap.xml` and `robots.txt` are generated dynamically. Open Graph images per tutor are generated on-demand via Next.js OG image API.

**Why:** Organic search is the cheapest acquisition channel for a Georgian marketplace.

---

## 4. Differentiation — what we actually compete on

| Feature | Us (v1) | Random FB group | International (Superpeer, Intro.co) | Local competitor (BookMee, etc.) |
|---|---|---|---|---|
| Georgian language UI | ✅ | ✅ | ❌ | ⚠️ partial |
| TBC / BOG payments | ✅ | ⚠️ manual transfer | ❌ | ⚠️ usually |
| Integrated video room | ✅ | ❌ (Zoom externally) | ✅ | ⚠️ varies |
| Tutor verification (manual approval) | ✅ | ❌ | ⚠️ self-serve | ⚠️ |
| Escrow / refund protection | ✅ | ❌ | ✅ | ❌ |
| Tutor sets own price | ✅ | ✅ | ✅ | ⚠️ sometimes |
| Quality (modern UI, mobile-first) | ✅ | ❌ | ✅ | ❌ usually |

**Our wedge:** Georgian-language + Georgian-payments + trust-mediated + modern UX. **Not** competing on supply variety on day 1 (we'll have 10–30 hand-picked tutors at launch, not 1,000).

---

## 5. Budget — time and money

### Time (solo full-time)

| Scenario | Calendar weeks | Working hours |
|---|---|---|
| Optimistic (focused, no integration surprises) | 16 | ~640h |
| **Realistic (full-time, normal blockers, full test coverage)** | **20–22** | **~800–880h** |
| Pessimistic (TBC/BOG sandbox delays, legal/regulatory friction) | 26+ | ~1040h+ |
| Part-time, 20h/week | 40–44 | ~800–880h |

Add **20% buffer** for unknown unknowns. The two biggest unknowns are (a) TBC/BOG sandbox approval timelines and (b) legal/regulatory clarity on the escrow model. The previous 13–15w estimate did **not** include phase-gate testing — including it adds ~5 weeks of dedicated test work distributed across phases (mock acquirer, race-condition tests, video session E2E, manual phase gates).

**Trade-off note:** if you must compress, the only honest lever is to descope features — never to cut tests. Cutting tests on a money platform creates a ticking refund-disaster.

### Money (ongoing per month, v1 scale)

| Item | Cost (USD) | Notes |
|---|---|---|
| Vercel Pro | $20 | Required for production; Hobby has bandwidth caps |
| Neon (Launch plan) | $19 | Adequate for ≤ 1k users; free tier dies under any real traffic |
| LiveKit Cloud | $0–50 | Free tier 50h/mo; if exceeded, ~$0.004/participant-min |
| Resend | $0–20 | Free tier 3k emails/mo; transactional only |
| Cloudflare R2 | < $1 | Negligible at our file volumes |
| Pusher (free tier) | $0 | < 200k messages/day is free |
| Domain + email | $2 | ~$25/year amortized |
| Sentry (Developer) | $0 | Free tier 5k errors/mo |
| **Total ongoing** | **~$45–110/mo** | Most months under $60 |

### One-time

| Item | Cost (GEL/USD) | Notes |
|---|---|---|
| TBC E-Commerce merchant setup | One-time fee per TBC pricing | Their team will quote; allow 2–4 weeks |
| BOG iPay merchant setup | Same — quote required | 2–4 weeks |
| Lawyer consultation (escrow legality) | ~500–2,000 GEL | One session + review of T&C |
| IE registration (if not already) | ~150 GEL | Required for payment-acquirer agreements |
| Logo / brand design (if outsourced) | 500–3,000 GEL | Can be done in-house with Figma + AI tools |

### Per-transaction (operating cost on each booking)

- TBC commission: ~1.5–2.5% of transaction value (negotiable)
- BOG commission: ~1.5–2.5% (similar)
- LiveKit minutes for the session: ~$0.10–0.30 per hour at MVP scale
- Resend email cost: negligible

**Platform commission must cover all of the above plus margin.** Suggested platform commission: **15–20%** of tutor's listed price.

---

## 6. Out of scope for v1 (explicit)

These are intentional non-goals. Don't pull into v1 mid-flight.

### Hard out (don't ship until v2 minimum)

- **Session recording** — storage cost, consent flows, GDPR/local-law nuance, post-session UX. Not impossible, just not v1.
- **Group sessions / webinars** — 1-on-1 only.
- **Subscription pricing for tutors** — commission-only revenue model in v1.
- **International payments** — Stripe / PayPal deferred.
- **Internationalization (i18n)** — Georgian only. The codebase is i18n-aware (next-intl) but only one locale is shipped.
- **Mobile apps (iOS / Android native)** — responsive PWA is v1. Native apps are post-product-market-fit.
- **Tutor analytics export / CSV** — show dashboards in-app, no export.
- **Pre-recorded courses / async content** — live consultations only.
- **Calendar sync (Google Calendar, iCal)** — tutor sets availability in-app, no two-way sync.
- **In-platform messaging before booking** — chat is enabled only post-booking. Pre-booking inquiries: deferred.
- **Affiliate / referral program** — defer until growth stage.
- **Tutor verification badges (KYC, identity verification provider)** — manual review is the v1 substitute.
- **Multi-currency** — GEL only.

### Soft out (build only if blocking)

- Admin analytics dashboard with charts beyond basic counters
- A/B testing infrastructure
- Email digest (weekly tutor earnings, weekly user "tutors you might like")
- Two-factor authentication for users (admin only in v1)

---

## 7. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | TBC / BOG sandbox approval takes > 4 weeks, blocking integration testing | High | High | Apply on day 1 of Phase 0; develop against a mock acquirer in parallel; have both banks in pipeline so either unblocks |
| R2 | Escrow model requires payment-services license under Georgian law | Medium | Critical | Lawyer consult in Phase 0; if license required, pivot to direct tutor merchant accounts (each tutor has their own TBC merchant, platform takes commission via separate API) |
| R3 | LiveKit free tier exhausted faster than expected, cost spikes | Medium | Medium | Set up usage alerts at 70% / 90%; have Daily.co contract ready as failover; commission can absorb video cost |
| R4 | Race condition in booking causes double-booking in production | Medium | High | DB unique constraint + transaction (T3.1); load test with k6 before launch (T7.6) |
| R5 | Refund disputes between users and tutors create support burden | High | Medium | Clear written policy (T9.2); admin tooling for dispute resolution (T8.7); chargeback fees absorbed by tutor not platform |
| R6 | Tutor approval queue becomes a bottleneck (1 admin = limit) | Low | Medium | Admin checklist + standard rejection reasons (T8.5); 48h SLA published; recruit second admin if queue > 7 days |
| R7 | SEO not picking up — organic traffic stays near zero | Medium | High | ISR-based static pages from day 1 (T2.4); structured data / JSON-LD per tutor (T2.7); manual outreach to early tutors who already have audience |
| R8 | Mobile UX fails on real Georgian Android phones (older devices) | Medium | Medium | Test on real device starting Phase 2; mobile-first design; lighthouse mobile budget enforced in CI |
| R9 | Tutor churn is high after launch (poor matching, no demand) | High | Critical (product-market fit) | Curate initial supply (10–30 hand-picked); manual matchmaking for first 100 bookings; weekly tutor calls in first 3 months |
| R10 | Resend deliverability poor for Georgian email providers (.ge domains) | Low | Medium | Set up SPF/DKIM/DMARC carefully (T1.7); monitor bounce rate; have Mailgun as failover |
| R11 | Server-side timezones cause off-by-one booking errors | High | Medium | All timestamps stored UTC; display formatted in Asia/Tbilisi; explicit testing for DST edge cases (Georgia does not currently observe DST, but boundary tests against UTC are mandatory) |
| R12 | Tutor uploads inappropriate content (profile photo, intro video) | Low | High | Manual review in approval flow; report button on profiles post-launch; content moderation policy in T&C |
| R13 | Browser autoplay / camera permission denial breaks video room UX | High | Medium | Pre-call device check (T6.3); explicit permission prompt with helper UI; fallback to audio-only |

---

## 8. Decisions log

Resolved in product/architecture conversations. Listed for traceability.

| # | Decision | Resolution |
|---|---|---|
| D1 | Tech stack core | Next.js 15 + Prisma + Neon Postgres + Vercel |
| D2 | Video provider | LiveKit Cloud (re-evaluate self-host in v2) |
| D3 | Payments | TBC + BOG (both, in parallel) |
| D4 | Pricing model | Tutor sets own price; platform takes commission % |
| D5 | Commission rate | 15–20% (exact number tuned during Phase 0 financial model) |
| D6 | Tutor approval | Manual admin review (no automated KYC in v1) |
| D7 | Language | Georgian only |
| D8 | Notification channels | Email only (Resend); SMS/Push deferred |
| D9 | Booking model | Both fixed slots + flexible windows — tutor chooses per consultation |
| D10 | Escrow | Platform-held funds until session completion; weekly payout to tutor |
| D11 | Recording | Out of scope for v1 |
| D12 | UI library | shadcn/ui (copy-source) + Tailwind |
| D13 | Hosting | Vercel + Neon (re-evaluate Cloudflare Pages in v2) |
| D14 | Domain | TBD — to be registered in Phase 0 |
| D15 | Visual direction | Clean Modern + Warm details (Linear precision + Airbnb photo-driven cards) |
| D16 | Color palette | Indigo (#3D52F5) primary + Coral (#FF8A65) accent + warm neutrals |
| D17 | Typography | Noto Sans Georgian (UI) + Inter (numeric) + JetBrains Mono (code) |
| D18 | Tone | "Confident Calm" — trust-first, not flashy, not corporate |
| D19 | Mobile philosophy | Mobile-first — 375px before 1440px |
| D20 | Logo / brand identity | TBD — to be designed in T0.10 per locked palette + tone |

---

## 9. Phases & tasks

Each task: status, complexity (S/M/L/XL — work hours roughly 2/8/24/40+), dependencies, description, acceptance criteria.

**Phase summary:**

| Phase | Goal | Estimate | Includes test task |
|---|---|---|---|
| 0 | Foundation, infra, legal/payment setup, design system + Figma, **test infra** | 2.5 weeks | T0.15–T0.17 |
| 1 | DB schema, auth, layout shell | 2.5 weeks | T1.9 |
| 2 | Public pages (homepage, tutor listing, category, FAQ) | 2.5 weeks | T2.9 |
| 3 | Tutor onboarding (registration, profile setup, consultations CRUD, availability) | 3 weeks | T3.11 (slot tests) |
| 4 | Booking flow + payment integration (TBC + BOG) | 3 weeks | T4.10 (money-critical) |
| 5 | Video sessions (LiveKit) + post-session review | 2 weeks | T5.10 |
| 6 | User dashboard + tutor dashboard + 1-on-1 chat | 2.5 weeks | T6.10 |
| 7 | Admin panel | 1.5 weeks | T7.10 |
| 8 | Polish, accessibility, mobile pass, launch prep + Pre-Launch Gate | 1.5 weeks | Gate is the test |

**Total realistic estimate: 21 weeks** (~5 months) (with 20% buffer ≈ 25 weeks / ~6 months). Each phase ends with a **Phase Gate** — automated tests + manual checklist must pass before the next phase begins. Testing is treated as feature work, not afterthought.

---

### Phase 0 — Foundation & external dependencies

**Goal:** Project skeleton green; payment & legal blockers unblocked; brand + Figma + design tokens in place so Phase 2 can build at speed without rework.
**Estimate:** 2.5 weeks (100h).

#### T0.1: Initialize repository

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: None
- **Description**: Bootstrap git, hooks, GitHub remote.
- **Atomic tasks**:
  - [ ] T0.1.1 — Create project directory `/Users/beqolozi/Desktop/tutor` (already exists, verify)
  - [ ] T0.1.2 — Run `git init`
  - [ ] T0.1.3 — Write `.gitignore`: Node (`node_modules`, `.next`, `dist`), env (`.env*`, `!.env.example`), OS (`.DS_Store`, `Thumbs.db`), IDE (`.vscode`, `.idea`), test (`coverage`, `playwright-report`, `test-results`)
  - [ ] T0.1.4 — Write `README.md` skeleton: Overview, Setup, Scripts, Deploy, License sections
  - [ ] T0.1.5 — Create `LICENSE` (UNLICENSED or proprietary placeholder)
  - [ ] T0.1.6 — `pnpm dlx husky init`
  - [ ] T0.1.7 — Install commitlint: `pnpm add -D @commitlint/cli @commitlint/config-conventional`
  - [ ] T0.1.8 — Create `commitlint.config.js` with conventional-commits config
  - [ ] T0.1.9 — Add husky `commit-msg` hook running commitlint
  - [ ] T0.1.10 — Create private GitHub repo (decide name post-T0.10)
  - [ ] T0.1.11 — `git remote add origin <url>` and `git push -u origin master`
  - [ ] T0.1.12 — Configure GitHub branch protection: require PR, no force push, no direct commits to `master`
- **Acceptance**: `git log` shows initial commit; repo accessible on GitHub; commits with non-conventional format are rejected.

#### T0.2: Scaffold Next.js + TypeScript + Tailwind

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T0.1
- **Description**: Bootstrap the Next.js app and shadcn/ui.
- **Atomic tasks**:
  - [ ] T0.2.1 — Run `pnpm create next-app@latest` (TypeScript=yes, Tailwind=yes, App Router=yes, `src/`=yes, ESLint=no, import alias `@/*`=yes)
  - [ ] T0.2.2 — Pin Next.js version in `package.json` (exact `15.x.y`, no caret)
  - [ ] T0.2.3 — Commit `pnpm-lock.yaml` (already done by create-next-app)
  - [ ] T0.2.4 — Verify `pnpm dev` runs and shows default page at `localhost:3000`
  - [ ] T0.2.5 — Run `pnpm dlx shadcn@latest init` — pick "new-york" style, "Neutral" base color, CSS variables=yes
  - [ ] T0.2.6 — Add Button component: `pnpm dlx shadcn@latest add button`
  - [ ] T0.2.7 — Render `<Button>Test</Button>` on home page and verify it renders
  - [ ] T0.2.8 — Commit and push
- **Acceptance**: Blank app loads at `localhost:3000`; shadcn/ui Button renders.

#### T0.3: Tooling — ESLint, Prettier, TypeScript strict

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T0.2
- **Description**: Lock strict tooling baseline.
- **Atomic tasks**:
  - [ ] T0.3.1 — Update `tsconfig.json` — add `"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitOverride": true`, `"noFallthroughCasesInSwitch": true`, `"forceConsistentCasingInFileNames": true`
  - [ ] T0.3.2 — Install ESLint: `pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-next eslint-plugin-react-hooks`
  - [ ] T0.3.3 — Create `.eslintrc.json` extending `next/core-web-vitals` + `plugin:@typescript-eslint/strict`
  - [ ] T0.3.4 — Add custom rules: `@typescript-eslint/no-unused-vars`, `no-console: warn` (except `error`/`warn`)
  - [ ] T0.3.5 — Install Prettier: `pnpm add -D prettier prettier-plugin-tailwindcss`
  - [ ] T0.3.6 — Create `.prettierrc.json` (semi=true, singleQuote=true, printWidth=100, trailingComma=all)
  - [ ] T0.3.7 — Create `.prettierignore` (`node_modules`, `.next`, `coverage`, `pnpm-lock.yaml`)
  - [ ] T0.3.8 — Install lint-staged: `pnpm add -D lint-staged`
  - [ ] T0.3.9 — Configure `lint-staged` in `package.json`: `*.{ts,tsx}: eslint --fix, prettier --write`
  - [ ] T0.3.10 — Add husky `pre-commit` hook running `pnpm exec lint-staged`
  - [ ] T0.3.11 — Add scripts to `package.json`: `lint`, `lint:fix`, `type-check`, `format`, `format:check`
  - [ ] T0.3.12 — Run all scripts once and fix any baseline issues
- **Acceptance**: `pnpm lint && pnpm type-check && pnpm format:check` all green.

#### T0.4: Folder structure

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T0.2
- **Description**: Lock the project's directory skeleton.
- **Atomic tasks**:
  - [ ] T0.4.1 — Create `src/app/(public)/` route group with placeholder `page.tsx` files: `tutors`, `tutors/[slug]`, `category/[slug]`, `consultations`, `faq`, `contact`
  - [ ] T0.4.2 — Create `src/app/(dashboard)/` route group: `dashboard`, `dashboard/consultations`, `dashboard/payments`, `dashboard/settings`, `dashboard/support`
  - [ ] T0.4.3 — Create `src/app/(tutor)/` route group: `tutor/dashboard`, `tutor/consultations`, `tutor/availability`, `tutor/analytics`, `tutor/settings`
  - [ ] T0.4.4 — Create `src/app/admin/` route group: `admin/tutors`, `admin/users`, `admin/bookings`, `admin/refunds`, `admin/payouts`, `admin/categories`, `admin/audit`
  - [ ] T0.4.5 — Create `src/app/api/` placeholders: `api/webhooks/tbc`, `api/webhooks/bog`, `api/webhooks/livekit`, `api/auth/[...nextauth]`, `api/cron/expire-bookings`, `api/cron/send-reminders`, `api/cron/mark-no-shows`
  - [ ] T0.4.6 — Create `src/components/ui/` (shadcn destination)
  - [ ] T0.4.7 — Create `src/components/layout/`, `marketing/`, `booking/`, `session/`, `dashboard/`, `tutor/`, `admin/`
  - [ ] T0.4.8 — Create `src/lib/db/`, `auth/`, `payments/`, `video/`, `email/`, `storage/`, `utils/`, `validators/`
  - [ ] T0.4.9 — Create `src/server/actions/{auth,bookings,tutors,consultations,reviews,admin}/`
  - [ ] T0.4.10 — Create `src/types/` for shared TypeScript types
  - [ ] T0.4.11 — Create `prisma/` for schema (will be filled in T0.5)
  - [ ] T0.4.12 — Create `e2e/`, `src/tests/factories/`, `src/tests/fixtures/`
  - [ ] T0.4.13 — Create `docs/legal/`, `docs/qa/`, `docs/runbook/`
  - [ ] T0.4.14 — Run `pnpm build` — every placeholder route compiles
- **Acceptance**: All folders exist; placeholder pages compile; routes return rendered empty page or 404.

#### T0.5: Neon database setup

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T0.2
- **Description**: Connect Prisma to a Neon-hosted Postgres.
- **Atomic tasks**:
  - [ ] T0.5.1 — Sign up / log in at neon.tech
  - [ ] T0.5.2 — Create Neon project (region: AWS eu-central-1 Frankfurt)
  - [ ] T0.5.3 — Create `main` branch (prod) + `dev` branch (development)
  - [ ] T0.5.4 — Copy connection strings (pooled + direct) for both branches
  - [ ] T0.5.5 — Create `.env.local` with `DATABASE_URL` (pooled) + `DIRECT_URL` (direct) for dev branch
  - [ ] T0.5.6 — Create `.env.example` with placeholders
  - [ ] T0.5.7 — Install Prisma: `pnpm add -D prisma` and `pnpm add @prisma/client`
  - [ ] T0.5.8 — Run `pnpm prisma init` — generates `prisma/schema.prisma`
  - [ ] T0.5.9 — Configure schema datasource: `provider = "postgresql"`, `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`
  - [ ] T0.5.10 — Test connection: `pnpm prisma db pull` (against empty schema returns success)
  - [ ] T0.5.11 — Add scripts to `package.json`: `db:migrate`, `db:studio`, `db:reset`, `db:seed`
- **Acceptance**: `pnpm prisma migrate dev --name init` runs against Neon dev branch; `pnpm prisma studio` opens.

#### T0.6: Vercel project linked

- [x] **Status**: DONE
- **Complexity**: S
- **Dependencies**: T0.5
- **Description**: Connect repo to Vercel for previews + prod deploys.
- **Atomic tasks**:
  - [x] T0.6.1 — Signed in to Vercel with GitHub
  - [x] T0.6.2 — Imported `BekaChkhiro/tutor-platform` as Vercel project `bekas-projects-37aab3eb/tutor`
  - [x] T0.6.3 — Framework preset Next.js (auto-detected); pnpm picked up via `packageManager`
  - [x] T0.6.4 — Env vars `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `RESEND_API_KEY`, `SENTRY_DSN` set on Vercel (placeholders for the three not yet provisioned)
  - [x] T0.6.5 — Production branch = `master`; preview deploys auto-enabled for PRs
  - [x] T0.6.6 — First production deploy triggered via PR #5 merge to `master`
  - [x] T0.6.7 — Production URL renders the Next.js homepage (verified)
  - [x] T0.6.8 — Vercel CLI 50.1.6 on PATH; `vercel link` ran against the project (`.vercel/project.json` written locally)
  - [x] T0.6.9 — `.vercel` gitignored
- **Runbook**: `docs/runbook/vercel-setup.md`
- **Acceptance**: First push to `master` triggers a successful Vercel deploy; PR creates a preview URL automatically. ✅ — PR #5 preview <https://tutor-olive-ten.vercel.app>; production deploy ready post-merge.

#### T0.7: TBC E-Commerce merchant application submitted

- [ ] **Status**: TODO
- **Complexity**: S (calendar-blocking)
- **Dependencies**: D14 (domain decided), business entity ready
- **Description**: Apply for TBC merchant account (calendar-blocking; start day 1).
- **Atomic tasks**:
  - [ ] T0.7.1 — Verify IE (individual entrepreneur) is registered in Georgia; if not, register at house.gov.ge
  - [ ] T0.7.2 — Open business bank account at TBC (if not present)
  - [ ] T0.7.3 — Collect required docs: passport copy, IE registration certificate, bank account details
  - [ ] T0.7.4 — Prepare project description: marketplace model, expected monthly volume, refund policy summary
  - [ ] T0.7.5 — Contact TBC E-Commerce team via tbcbank.ge/business/e-commerce (form or email)
  - [ ] T0.7.6 — Schedule onboarding call with TBC representative
  - [ ] T0.7.7 — Sign merchant agreement
  - [ ] T0.7.8 — Receive sandbox credentials (`merchant_id`, secret keys, callback URLs documentation)
  - [ ] T0.7.9 — Save credentials in 1Password / Bitwarden (NEVER commit to repo)
  - [ ] T0.7.10 — Test sandbox credentials with a curl request to TBC sandbox endpoint
- **Acceptance**: TBC account manager assigned; sandbox credentials work for a test transaction.

#### T0.8: BOG iPay merchant application submitted

- [ ] **Status**: TODO
- **Complexity**: S (calendar-blocking)
- **Dependencies**: D14 (domain decided), business entity ready
- **Description**: Apply for BOG iPay merchant — parallel to T0.7.
- **Atomic tasks**:
  - [ ] T0.8.1 — Open BOG business account (if not present)
  - [ ] T0.8.2 — Collect same docs as T0.7.3
  - [ ] T0.8.3 — Apply at bog.ge/business/ecommerce
  - [ ] T0.8.4 — Schedule onboarding call
  - [ ] T0.8.5 — Sign BOG merchant agreement (review commission %)
  - [ ] T0.8.6 — Receive iPay sandbox credentials + API documentation
  - [ ] T0.8.7 — Save credentials to password manager
  - [ ] T0.8.8 — Test sandbox endpoint with curl
- **Acceptance**: BOG sandbox credentials work for a test transaction.

#### T0.9: Legal consultation on escrow model

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: None (start early)
- **Description**: Validate legality of escrow + draft user/tutor/refund agreements.
- **Atomic tasks**:
  - [ ] T0.9.1 — Research Georgian lawyers/firms specializing in fintech / e-commerce (BLC, Mgaloblishvili Kipiani Dzidziguri, etc.)
  - [ ] T0.9.2 — Send brief project description to 2–3 firms, request quotes
  - [ ] T0.9.3 — Sign engagement letter
  - [ ] T0.9.4 — Initial consultation: present escrow flow + payout model
  - [ ] T0.9.5 — Receive written opinion: is payment-services license required?
  - [ ] T0.9.6 — If license required, document fallback model in `docs/legal/escrow-fallback.md`
  - [ ] T0.9.7 — Commission Terms & Conditions draft (user-facing)
  - [ ] T0.9.8 — Commission Tutor Agreement draft (separate)
  - [ ] T0.9.9 — Commission Refund Policy draft
  - [ ] T0.9.10 — Commission Privacy Policy draft (Georgian Personal Data Protection law compliance)
  - [ ] T0.9.11 — Verify if Personal Data Inspector registration is required for processing user data
  - [ ] T0.9.12 — Save all docs in `docs/legal/`
- **Acceptance**: Written legal opinion stored in `docs/legal/escrow-opinion.md`; T&C / Privacy / Refund drafts ready for T8.6.

#### T0.10: Brand foundation

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: None
- **Description**: Lock product name, domain, logo, palette.
- **Atomic tasks**:
  - [ ] T0.10.1 — Brainstorm 10–15 candidate product names (Georgian + transliterated)
  - [ ] T0.10.2 — Check domain availability (`.ge`, `.com`, `.io`) for top 5 candidates
  - [ ] T0.10.3 — Check trademark / brand collision in Georgia (sakpatenti.gov.ge)
  - [ ] T0.10.4 — Final name decision and record in D14
  - [ ] T0.10.5 — Register `.ge` domain at proservice.ge / etc
  - [ ] T0.10.6 — Register `.com` for safety (optional)
  - [ ] T0.10.7 — Point DNS to Vercel (A/AAAA records)
  - [ ] T0.10.8 — Design logo wordmark in Figma — start with text in Noto Sans Georgian Bold + indigo color
  - [ ] T0.10.9 — Add small coral accent (dot, underline, or geometric mark)
  - [ ] T0.10.10 — Export logo SVG variants: full-color, single-color (indigo), reverse (white on dark)
  - [ ] T0.10.11 — Generate favicon set (16, 32, 192, 512, apple-touch-icon)
  - [ ] T0.10.12 — Save brand assets to `public/brand/`
  - [ ] T0.10.13 — Verify color contrast: `primary-500` on white, `primary-700` for body links, `accent-500` on white-with-text — using webaim.org/resources/contrastchecker
  - [ ] T0.10.14 — Write design tokens spec in `docs/design/tokens.md` (mirror of §1.5)
- **Acceptance**: Domain DNS resolves to Vercel; logo SVG variants in `public/brand/`; contrast verified; tokens documented.

#### T0.11: Figma design file

- [ ] **Status**: TODO
- **Complexity**: XL
- **Dependencies**: T0.10
- **Description**: Full Figma spec for all key screens before any Phase 2 code.
- **Atomic tasks**:
  - [ ] T0.11.1 — Create Figma file `Tutor Platform — Design v1` with project structure (pages = sections)
  - [ ] T0.11.2 — Tokens page: color swatches (all primary/accent/neutral/semantic with hex labels)
  - [ ] T0.11.3 — Tokens page: type scale (display, h1–h4, body-lg, body, body-sm, caption) — both desktop + mobile sizes
  - [ ] T0.11.4 — Tokens page: spacing scale, radius scale, shadow examples
  - [ ] T0.11.5 — Components: Button — 5 variants × 3 sizes × 5 states (rest, hover, pressed, disabled, loading)
  - [ ] T0.11.6 — Components: Input — floating-label states (empty, focused, filled, error, disabled)
  - [ ] T0.11.7 — Components: Card — rest + hover, with photo / without photo variants
  - [ ] T0.11.8 — Components: Dialog (desktop center) + Sheet (mobile bottom)
  - [ ] T0.11.9 — Components: Toast (4 variants: info, success, warning, error)
  - [ ] T0.11.10 — Components: Badge, Avatar, Skeleton, Tab strip, Dropdown menu, Tooltip
  - [ ] T0.11.11 — Components: Pricing badge, Rating stars, Trust badge ("გადახდა დაცულია TBC-ით")
  - [ ] T0.11.12 — Components: Calendar / date picker, Time-slot grid, Slot button (available/booked/selected)
  - [ ] T0.11.13 — Homepage desktop 1440px — Hero, categories, featured tutors, how-it-works, trust strip, testimonials, FAQ teaser, CTA band, footer
  - [ ] T0.11.14 — Homepage mobile 375px — stacked, swipeable carousels
  - [ ] T0.11.15 — Tutors listing desktop — grid + filter sidebar
  - [ ] T0.11.16 — Tutors listing mobile — filter drawer
  - [ ] T0.11.17 — Tutor profile desktop — main content + sticky booking sidebar
  - [ ] T0.11.18 — Tutor profile mobile — stacked + fixed bottom CTA bar
  - [ ] T0.11.19 — Tutor profile tabs: About, Consultations, Reviews, Calendar
  - [ ] T0.11.20 — Booking modal step 1 (Select consultation) — desktop + mobile bottom sheet
  - [ ] T0.11.21 — Booking modal step 2 (Pick date + slot) — desktop + mobile
  - [ ] T0.11.22 — Booking modal step 3 (Review + pay) — desktop + mobile, with TBC + BOG payment buttons
  - [ ] T0.11.23 — Booking confirmation screen / animation
  - [ ] T0.11.24 — User dashboard main — desktop + mobile (with bottom nav)
  - [ ] T0.11.25 — User consultations page (tabs: upcoming / completed / cancelled)
  - [ ] T0.11.26 — Booking detail page (user view) — all states (PENDING/PAID/COMPLETED/CANCELLED/NO_SHOW)
  - [ ] T0.11.27 — User payments page + receipt PDF preview
  - [ ] T0.11.28 — User settings page (3 tabs)
  - [ ] T0.11.29 — Tutor dashboard + analytics charts
  - [ ] T0.11.30 — Tutor onboarding wizard (6 steps)
  - [ ] T0.11.31 — Tutor availability editor (weekly grid + exception manager)
  - [ ] T0.11.32 — Tutor consultations CRUD page
  - [ ] T0.11.33 — Video room — peer video full-bleed, control bar, chat panel toggle, file share panel
  - [ ] T0.11.34 — Video room mobile — fullscreen, controls overlay
  - [ ] T0.11.35 — Pre-session waiting room (device check, camera preview)
  - [ ] T0.11.36 — Post-session screen (review prompt for user, summary for tutor)
  - [ ] T0.11.37 — Auth screens: login, register (user + tutor variants), forgot password, reset password, verify email
  - [ ] T0.11.38 — Admin layout shell + tutor approval queue + decision modal
  - [ ] T0.11.39 — Admin user management + suspend modal
  - [ ] T0.11.40 — Admin refund queue + refund decision modal
  - [ ] T0.11.41 — Admin payout management view
  - [ ] T0.11.42 — Empty states (3): no bookings, no tutors match filters, no payments
  - [ ] T0.11.43 — Error states (3): 404, 500, network error
  - [ ] T0.11.44 — Loading skeletons for: homepage carousel, tutor card grid, booking modal
  - [ ] T0.11.45 — Email templates visual mockups: welcome, verify, reset password, booking confirmation, reminders (24h + 1h), refund
  - [ ] T0.11.46 — Share Figma file with view access (link in `docs/design/figma-link.md`)
- **Acceptance**: Every Figma deliverable checklist item complete; tokens exactly match `tailwind.config.ts` (T0.13).

#### T0.12: Logging + error tracking

- [x] **Status**: CODE-COMPLETE (manual Sentry account + Vercel env + prod verify pending — see `docs/runbook/sentry-setup.md`)
- **Complexity**: S
- **Dependencies**: T0.6
- **Description**: Wire Sentry for runtime error capture.
- **Atomic tasks**:
  - [ ] T0.12.1 — Sign up at sentry.io, create project type "Next.js" _(manual — user step)_
  - [x] T0.12.2 — ~~Run `pnpm dlx @sentry/wizard@latest -i nextjs`~~ → installed `@sentry/nextjs` and wired configs by hand (wizard requires interactive Sentry login)
  - [x] T0.12.3 — Sentry init files in place: `src/instrumentation-client.ts` (modern replacement for `sentry.client.config.ts`, required for Turbopack), `sentry.server.config.ts`, `sentry.edge.config.ts`, plus `src/instrumentation.ts` and `src/app/global-error.tsx`
  - [x] T0.12.4 — `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` documented in `.env.example` and `docs/runbook/vercel-setup.md` (real values pending Sentry signup)
  - [x] T0.12.5 — `next.config.ts` wrapped with `withSentryConfig`; source-map upload auto-skipped when `SENTRY_AUTH_TOKEN` is unset
  - [x] T0.12.6 — `tracesSampleRate` is `0.1` in production / `1.0` in dev across all three configs
  - [x] T0.12.7 — `src/app/api/sentry-test/route.ts` throws `SentryTestError`
  - [ ] T0.12.8 — Prod trigger + source-mapped stack trace verification _(blocked on T0.12.1)_
  - [ ] T0.12.9 — Configure alerts: new issue, error spike, crash rate > 1% _(blocked on T0.12.1)_
- **Acceptance**: Test error captures correctly; alert fires on test threshold breach.

#### T0.13: Design tokens in code (`tailwind.config.ts`)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T0.10, T0.2
- **Description**: Implement all §1.5 tokens in code.
- **Atomic tasks**:
  - [ ] T0.13.1 — Extend `tailwind.config.ts` `theme.extend.colors` with `primary` (50, 100, 500, 600, 700, 900)
  - [ ] T0.13.2 — Extend `theme.extend.colors` with `accent` (50, 500, 600)
  - [ ] T0.13.3 — Extend `theme.extend.colors` with `neutral` (0, 50, 100, 200, 400, 600, 900)
  - [ ] T0.13.4 — Extend `theme.extend.colors` with semantic `success`, `warning`, `danger`
  - [ ] T0.13.5 — Configure `next/font/google` Noto Sans Georgian (400/600/700), Inter (500/600), JetBrains Mono in `src/app/fonts.ts`
  - [ ] T0.13.6 — Apply fonts in root layout: `<html className={notoSans.variable + inter.variable + jetBrains.variable}>`
  - [ ] T0.13.7 — Extend `theme.extend.fontFamily.sans` to use `var(--font-noto-sans-georgian), var(--font-inter), sans-serif`
  - [ ] T0.13.8 — Extend `fontFamily.numeric` (`Inter`) and `mono` (`JetBrains Mono`)
  - [ ] T0.13.9 — Extend `theme.fontSize` with 9 type tokens (display/h1/h2/h3/h4/body-lg/body/body-sm/caption) each with `[size, { lineHeight, letterSpacing, fontWeight }]`
  - [ ] T0.13.10 — Extend `theme.extend.borderRadius` with `sm: 6px`, `DEFAULT: 10px`, `card: 14px`, `modal: 20px`, `full: 9999px`
  - [ ] T0.13.11 — Extend `theme.extend.boxShadow`: `rest`, `hover`, `modal`, `focus`
  - [ ] T0.13.12 — Extend `transitionTimingFunction` with `default` and `bounce`
  - [ ] T0.13.13 — Update `src/app/globals.css`: body bg `neutral-50`, text `neutral-900`, line-height 1.6
  - [ ] T0.13.14 — Add global `*:focus-visible` style with `shadow-focus`
  - [ ] T0.13.15 — Add `@media (prefers-reduced-motion: reduce)` block disabling all `transition` and `animation`
  - [ ] T0.13.16 — Create `/_design/tokens` page rendering every token with its name + value
  - [ ] T0.13.17 — Visual diff vs Figma tokens page — must match within 1px
- **Acceptance**: Tailwind IntelliSense shows custom tokens; `/_design/tokens` matches Figma pixel-for-pixel.

#### T0.14: Custom shadcn/ui component theming

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T0.13
- **Description**: Add and customize all base shadcn/ui components to match Figma.
- **Atomic tasks**:
  - [ ] T0.14.1 — Add Button: `pnpm dlx shadcn@latest add button`; customize 5 variants × 3 sizes; loading state
  - [ ] T0.14.2 — Add Input: convert to floating-label pattern (custom wrapper); 48px height; focus ring
  - [ ] T0.14.3 — Add Label
  - [ ] T0.14.4 — Add Card: 14px radius, rest+hover shadow + translateY
  - [ ] T0.14.5 — Add Dialog: 20px radius, 8px backdrop blur
  - [ ] T0.14.6 — Add Sheet: configure for bottom-sheet on mobile (responsive variants)
  - [ ] T0.14.7 — Add Sonner (Toast): top-right desktop, top-full mobile, max 3 stack
  - [ ] T0.14.8 — Add Tabs
  - [ ] T0.14.9 — Add Badge: with variants (default, secondary, success, warning, danger)
  - [ ] T0.14.10 — Add Avatar
  - [ ] T0.14.11 — Add Skeleton: with shimmer animation
  - [ ] T0.14.12 — Add Separator
  - [ ] T0.14.13 — Add Dropdown Menu
  - [ ] T0.14.14 — Add Tooltip
  - [ ] T0.14.15 — Add Select, Checkbox, Radio Group, Switch
  - [ ] T0.14.16 — Add Calendar (react-day-picker via shadcn)
  - [ ] T0.14.17 — Add Form (react-hook-form integration)
  - [ ] T0.14.18 — Create custom: TrustBadge component (lock icon + text)
  - [ ] T0.14.19 — Create custom: RatingStars component (visual + a11y label)
  - [ ] T0.14.20 — Create custom: PriceTag component (GEL formatting + currency icon)
  - [ ] T0.14.21 — Create custom: SlotButton component (available/booked/selected states)
  - [ ] T0.14.22 — Create custom: BottomSheet wrapper that auto-switches to Dialog ≥ 640px
  - [ ] T0.14.23 — Create custom: FloatingLabelInput
  - [ ] T0.14.24 — Build `/_design` showcase page: render every component × every variant × every state
  - [ ] T0.14.25 — Gate `/_design` route behind env flag (`NEXT_PUBLIC_DESIGN_PAGE_ENABLED=true` in dev only)
  - [ ] T0.14.26 — Side-by-side diff `/_design` vs Figma component library page
- **Acceptance**: `/_design` page matches Figma component library 1:1; no hard-coded colors in components.

#### T0.15: Unit + integration test infrastructure (Vitest)

- [x] **Status**: DONE
- **Complexity**: M
- **Dependencies**: T0.3
- **Description**: Vitest with Testcontainers Postgres for real-DB integration tests.
- **Atomic tasks**:
  - [x] T0.15.1 — Install: `pnpm add -D vitest @vitest/coverage-v8 @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom`
  - [x] T0.15.2 — Install: `pnpm add -D testcontainers @testcontainers/postgresql`
  - [x] T0.15.3 — Create `vitest.config.ts` with workspace config (unit/node, integration/node + testcontainers, component/jsdom)
  - [x] T0.15.4 — Create `vitest.setup.ts` — register `@testing-library/jest-dom` matchers
  - [x] T0.15.5 — Create `src/tests/helpers/testcontainers.ts` — Postgres container helper, returns Prisma client per test worker
  - [x] T0.15.6 — Create `src/tests/helpers/cleanup.ts` — truncate all tables `beforeEach`
  - [x] T0.15.7 — Create `prisma/seed.ts` — deterministic seed (stub — fills in when User/Tutor/Booking/Consultation models land in T1.1+)
  - [x] T0.15.8 — Create `src/tests/factories/user.ts`, `tutor.ts`, `booking.ts`, `consultation.ts`
  - [x] T0.15.9 — Write smoke unit test: `1+1=2`
  - [x] T0.15.10 — Write smoke integration test: insert + select via Prisma against Postgres testcontainer (raw SQL until models land)
  - [x] T0.15.11 — Write smoke component test: render Button + assert text + click handler
  - [x] T0.15.12 — Add scripts: `test:unit`, `test:integration`, `test:component`, `test`, `test:coverage`, `test:ui`
  - [x] T0.15.13 — Configure coverage thresholds in `vitest.config.ts`: `lines: 60`, `branches: 60`, `functions: 60`, with `'src/lib/**': 80%`
- **Acceptance**: All 3 smoke tests pass; coverage report generated; coverage threshold enforced.

#### T0.16: E2E + accessibility test infrastructure (Playwright)

- [x] **Status**: DONE
- **Complexity**: M
- **Dependencies**: T0.6
- **Description**: Playwright with multi-browser + accessibility scanning.
- **Atomic tasks**:
  - [x] T0.16.1 — Install: `pnpm add -D @playwright/test` (used direct add instead of create-playwright scaffold to preserve the existing repo layout)
  - [x] T0.16.2 — Install: `pnpm add -D @axe-core/playwright`
  - [x] T0.16.3 — Configure `playwright.config.ts` with projects: chromium, firefox, webkit, mobile-chrome (Pixel 5), mobile-safari (iPhone 13)
  - [x] T0.16.4 — Set `baseURL` from env: `PLAYWRIGHT_BASE_URL || http://localhost:3000`
  - [x] T0.16.5 — Configure `webServer` block to start `pnpm dev` if running locally
  - [x] T0.16.6 — Create `e2e/helpers/auth.ts` — login via API + cookie injection (faster than UI login)
  - [x] T0.16.7 — Create `e2e/helpers/db-seed.ts` — invoke seed before E2E run
  - [x] T0.16.8 — Create `e2e/helpers/axe.ts` — wrapper to scan page with axe-core, fail on critical violations
  - [x] T0.16.9 — Write smoke E2E: homepage loads, h1 contains expected text
  - [x] T0.16.10 — Write smoke a11y: homepage scan → 0 critical violations
  - [x] T0.16.11 — Add scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:debug`, `test:a11y`
  - [x] T0.16.12 — Configure HTML report output to `playwright-report/` (gitignored)
- **Acceptance**: Smoke tests pass on chromium + firefox + webkit + mobile-chrome + mobile-safari. ✅ 10/10 green.

#### T0.17: CI/CD — GitHub Actions pipeline

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T0.15, T0.16
- **Description**: Wire GitHub Actions for per-commit + per-PR + nightly checks.
- **Atomic tasks**:
  - [ ] T0.17.1 — Create `.github/workflows/ci.yml` — triggers: push, pull_request
  - [ ] T0.17.2 — CI job 1 (lint+type): node 20, install, `pnpm lint`, `pnpm type-check`, `pnpm format:check`
  - [ ] T0.17.3 — CI job 2 (test): node 20, install, `pnpm test:unit`, `pnpm test:integration`, `pnpm test:component`
  - [ ] T0.17.4 — CI job 3 (audit): `pnpm audit --audit-level=high`
  - [ ] T0.17.5 — CI job 4 (e2e, PR only): wait for Vercel preview URL, run `pnpm test:e2e` against it, run `pnpm test:a11y`
  - [ ] T0.17.6 — CI job 5 (lighthouse, PR only): Lighthouse CI on changed routes, budget files committed
  - [ ] T0.17.7 — Create `.github/workflows/nightly.yml` — cron 2am UTC: full E2E + Snyk scan
  - [ ] T0.17.8 — Sign up for Snyk free tier, add `SNYK_TOKEN` secret
  - [ ] T0.17.9 — Sign up for Codecov, add `CODECOV_TOKEN`, upload coverage from test job
  - [ ] T0.17.10 — Configure branch protection on `master`: require all CI jobs to pass before merge
  - [ ] T0.17.11 — Create PR template at `.github/pull_request_template.md`
  - [ ] T0.17.12 — Create issue templates: bug report, feature request
  - [ ] T0.17.13 — Open a test PR to verify pipeline triggers and blocks merge until green
- **Acceptance**: PR cannot merge unless every CI job is green; nightly runs successfully overnight.

---

### Phase 0 Gate (must pass before Phase 1)

**Automated:**
- [ ] `pnpm lint && pnpm type-check` green
- [ ] `pnpm test:unit && pnpm test:integration && pnpm test:component && pnpm test:e2e && pnpm test:a11y` all green
- [ ] CI pipeline triggers and passes on a test PR
- [ ] Vercel preview deploys on PR
- [ ] Sentry receives a thrown test error

**Manual:**
- [ ] Domain DNS resolves to Vercel
- [ ] Logo renders correctly in favicon, header (24px), hero (200px)
- [ ] `/_design` page matches Figma component library page side-by-side (zoom in on buttons, inputs, cards)
- [ ] Figma file shared and tokens spot-checked against `tailwind.config.ts`
- [ ] TBC + BOG sandbox credentials received (or applications acknowledged with expected timeline)
- [ ] Lawyer opinion on escrow received in writing
- [ ] Spot-check `/login` placeholder routes return 404 (Phase 1 will fill them)

**Exit criteria:** All boxes checked, lawyer opinion in `docs/legal/escrow-opinion.md`, design tokens locked.

---

### Phase 1 — Database, auth, and layout shell

**Goal:** Data model is locked. Users + tutors can register, log in, and see a logged-in shell. No real features yet — but the spine is rigid.
**Estimate:** 2.5 weeks (100h) including T1.9 tests + Phase 1 Gate.

#### T1.1: Database schema — core entities

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T0.5
- **Description**: Design and migrate the full v1 Prisma schema.
- **Atomic tasks**:
  - [ ] T1.1.1 — Define `User` model: id (cuid), email (unique), firstName, lastName, phone, dob, role (UserRole enum), suspended (Boolean), emailVerified (DateTime?), image, createdAt, updatedAt
  - [ ] T1.1.2 — Define `Account`, `Session`, `VerificationToken` (NextAuth) per Auth.js Prisma adapter spec
  - [ ] T1.1.3 — Define `Tutor` model: id, userId (unique FK), status (TutorStatus enum), slug (unique), headline, bio, photoUrl, introVideoUrl, gender, iban (encrypted), idDocument (encrypted), refundPolicy (Json?), createdAt, updatedAt
  - [ ] T1.1.4 — Define `Skill`, `Certificate`, `Education`, `Experience` models, each linked to Tutor
  - [ ] T1.1.5 — Define `Category` model: id, slug (unique), name, description, iconName, sortOrder
  - [ ] T1.1.6 — Define `TutorCategory` join table (many-to-many)
  - [ ] T1.1.7 — Define `Consultation` model: id, tutorId (FK), title, descriptionShort, descriptionLong, categoryId (FK), durationMinutes, priceGel (Decimal), bookingType (enum FIXED|FLEXIBLE), maxPerDay, advanceNoticeMinutes, archived (Boolean), createdAt, updatedAt
  - [ ] T1.1.8 — Define `Availability` model: id, tutorId (FK), weekday (0–6), startTime (Time), endTime (Time)
  - [ ] T1.1.9 — Define `AvailabilityException` model: id, tutorId, date, startTime, endTime, type (enum BLOCK|EXTRA)
  - [ ] T1.1.10 — Define `Booking` model: id, userId, tutorId, consultationId, startTime (DateTime UTC), endTime, status (BookingStatus enum), expiresAt, reminder24SentAt, reminder1SentAt, cancellationReason, createdAt, updatedAt
  - [ ] T1.1.11 — Define `Transaction` model: id, bookingId (FK), amountGel (Decimal), commissionGel (Decimal), payoutGel (Decimal), provider (enum TBC|BOG), providerRef, payoutStatus (PayoutStatus enum), paidAt, refundedAt, createdAt
  - [ ] T1.1.12 — Define `Review` model: id, bookingId (FK unique), userId, tutorId, rating (Int 1–5), comment (Text?), createdAt
  - [ ] T1.1.13 — Define `Message` model (chat): id, bookingId (FK), senderId (FK User), body, fileUrl, readAt, createdAt
  - [ ] T1.1.14 — Define `SupportTicket` model: id, userId (FK nullable), subject, status (OPEN|IN_PROGRESS|RESOLVED|CLOSED), createdAt
  - [ ] T1.1.15 — Define `SupportMessage` model (ticket replies)
  - [ ] T1.1.16 — Define `AdminLog` model: id, adminId (FK User), action, targetType, targetId, details (Json), createdAt
  - [ ] T1.1.17 — Define `TosAcceptance` model: id, userId, tosVersion, acceptedAt (for T8.6)
  - [ ] T1.1.18 — Define enums: `UserRole` (USER, TUTOR, ADMIN), `TutorStatus` (PENDING_REVIEW, APPROVED, REJECTED, SUSPENDED), `BookingStatus` (PENDING, PAID, CONFIRMED, COMPLETED, CANCELLED, REFUNDED, NO_SHOW, EXPIRED), `PayoutStatus` (HELD, RELEASED, REFUNDED), `BookingType` (FIXED, FLEXIBLE), `ExceptionType` (BLOCK, EXTRA)
  - [ ] T1.1.19 — Add unique constraint `@@unique([tutorId, startTime])` on Booking (race condition guard, §3.1)
  - [ ] T1.1.20 — Add indices: `Booking(tutorId, status)`, `Booking(userId, status)`, `Booking(startTime)`, `Tutor(status)`, `Consultation(tutorId, archived)`
  - [ ] T1.1.21 — Run `pnpm prisma migrate dev --name init` against Neon dev branch
  - [ ] T1.1.22 — Verify all tables in `pnpm prisma studio`
  - [ ] T1.1.23 — Commit migration file
- **Acceptance**: Migration applies cleanly; all tables visible in Prisma Studio.

#### T1.2: Auth.js setup — Google OAuth + credentials

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T1.1
- **Description**: Auth.js v5 with Prisma adapter, Google + Credentials providers.
- **Atomic tasks**:
  - [ ] T1.2.1 — Install: `pnpm add next-auth@beta @auth/prisma-adapter bcrypt` and `pnpm add -D @types/bcrypt`
  - [ ] T1.2.2 — Create `src/lib/auth/auth.ts` with `NextAuth({...})` config
  - [ ] T1.2.3 — Configure Prisma adapter
  - [ ] T1.2.4 — Set session strategy = `"database"` (NOT JWT — for instant revocation)
  - [ ] T1.2.5 — Register Google OAuth app at console.cloud.google.com (callback `<domain>/api/auth/callback/google`)
  - [ ] T1.2.6 — Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` to `.env.local` + Vercel
  - [ ] T1.2.7 — Add Google provider to Auth config
  - [ ] T1.2.8 — Add Credentials provider with bcrypt password verify
  - [ ] T1.2.9 — Implement `authorize()` for Credentials: lookup user, verify password, enforce `emailVerified !== null`
  - [ ] T1.2.10 — Implement `signIn` callback: reject if user is `suspended`
  - [ ] T1.2.11 — Implement `session` callback: enrich session with `role`, `tutorStatus` (if tutor)
  - [ ] T1.2.12 — Create route handler `src/app/api/auth/[...nextauth]/route.ts`
  - [ ] T1.2.13 — Generate `NEXTAUTH_SECRET` via `openssl rand -base64 32`, add to env
  - [ ] T1.2.14 — Create `/login` page with Google button + Credentials form
  - [ ] T1.2.15 — Create `/register` placeholder page (T1.3 fills it)
  - [ ] T1.2.16 — Create `/forgot-password` placeholder (T1.4 fills it)
  - [ ] T1.2.17 — Verify Google OAuth flow end-to-end manually
  - [ ] T1.2.18 — Verify Credentials login with a manually-seeded user
- **Acceptance**: Both providers produce a logged-in database session; suspended users cannot log in.

#### T1.3: Registration forms (user + tutor)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T1.2
- **Description**: User + tutor registration flows with email verification.
- **Atomic tasks**:
  - [ ] T1.3.1 — Install `pnpm add react-hook-form @hookform/resolvers zod`
  - [ ] T1.3.2 — Create `src/lib/validators/registration.ts` with zod schemas: `userRegistrationSchema`, `tutorRegistrationSchema`
  - [ ] T1.3.3 — Phone validator: regex `+995\d{9}$`, helper to mask input
  - [ ] T1.3.4 — DOB validator: must be ≥ 18 years old (Georgian age-of-consent)
  - [ ] T1.3.5 — Password validator: ≥ 8 chars, 1 letter, 1 digit
  - [ ] T1.3.6 — Build user registration UI at `/register` — react-hook-form + zod, FloatingLabelInput
  - [ ] T1.3.7 — Build tutor registration UI at `/register/tutor` — same + gender field
  - [ ] T1.3.8 — Create server action `registerUser({...})` — hash password, insert user, generate verify token (24h expiry), send email
  - [ ] T1.3.9 — Create server action `registerTutor({...})` — same + create Tutor row with status=PENDING_REVIEW
  - [ ] T1.3.10 — Create `/verify-email?token=...` page that consumes token, marks `emailVerified`, redirects to dashboard
  - [ ] T1.3.11 — Build `/complete-profile` page for Google OAuth users missing phone/DOB/gender
  - [ ] T1.3.12 — Middleware redirect: users with incomplete profile → `/complete-profile`
  - [ ] T1.3.13 — Test all 5 fields persist; verification email arrives; click-through verifies
- **Acceptance**: User + tutor registration both work; verification email link logs the user in; Google → complete-profile → full registration works.

#### T1.4: Password reset flow

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T1.3
- **Description**: Self-serve password reset via email token.
- **Atomic tasks**:
  - [ ] T1.4.1 — Build `/forgot-password` form: email input, submit
  - [ ] T1.4.2 — Server action `requestPasswordReset(email)` — find user, generate token, save to `VerificationToken` table with 1h expiry, send email
  - [ ] T1.4.3 — Build email template `password-reset.tsx` (React Email)
  - [ ] T1.4.4 — Build `/reset-password?token=...` form: new password, confirm password, submit
  - [ ] T1.4.5 — Server action `resetPassword(token, newPassword)` — verify token, check expiry, hash + save, delete token
  - [ ] T1.4.6 — Show generic message on `/forgot-password` (don't leak whether email exists)
  - [ ] T1.4.7 — Rate limit `/forgot-password` to 5 req/hour per IP
- **Acceptance**: Full flow works; token expires after 1h; reused token rejected.

#### T1.5: Role-based middleware

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T1.2
- **Description**: Route-level access control via Next.js middleware.
- **Atomic tasks**:
  - [ ] T1.5.1 — Create `src/middleware.ts` with matcher config
  - [ ] T1.5.2 — Implement session read from cookie (Auth.js v5 supports edge-compatible session check)
  - [ ] T1.5.3 — Rule: `/(dashboard)/*` requires logged-in USER+
  - [ ] T1.5.4 — Rule: `/tutor/*` requires `role=TUTOR` AND `tutorStatus=APPROVED`; pending tutors redirected to `/tutor/pending-status`; rejected to `/tutor/rejected`
  - [ ] T1.5.5 — Rule: `/admin/*` requires `role=ADMIN`; non-admin → 404 (not 403 — don't reveal admin existence)
  - [ ] T1.5.6 — Unauthorized in dashboard/tutor: redirect to `/login?from=<path>`
  - [ ] T1.5.7 — Create `/tutor/pending-status` page (Phase 3 enriches)
  - [ ] T1.5.8 — Create `/tutor/rejected` page (Phase 3 enriches)
  - [ ] T1.5.9 — Add helper `requireUser()`, `requireTutor()`, `requireAdmin()` in `src/lib/auth/guards.ts` for server actions
  - [ ] T1.5.10 — Manual test: log in as USER and try every protected route, repeat as TUTOR, repeat as ADMIN
- **Acceptance**: Each role sees correct redirect / status; no protected route leaks data.

#### T1.6: Layout shells

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T0.10, T1.2
- **Description**: Implement all 4 layout types per Figma.
- **Atomic tasks**:
  - [ ] T1.6.1 — Build `PublicHeader`: logo + nav links + login/register CTAs (mobile: hamburger)
  - [ ] T1.6.2 — Build `PublicFooter`: link columns, social icons, contact info, language switcher (Georgian only — disabled)
  - [ ] T1.6.3 — Create `src/app/(public)/layout.tsx` using Public header/footer
  - [ ] T1.6.4 — Build `DashboardSidebar` (user): 5 nav items, active-state styling
  - [ ] T1.6.5 — Build `DashboardTopbar`: avatar dropdown (Profile, Settings, Logout), notifications bell
  - [ ] T1.6.6 — Build `MobileBottomNav` (user): 5 icons + label
  - [ ] T1.6.7 — Create `src/app/(dashboard)/layout.tsx`
  - [ ] T1.6.8 — Build `TutorSidebar` + `TutorTopbar` similarly
  - [ ] T1.6.9 — Create `src/app/(tutor)/layout.tsx`
  - [ ] T1.6.10 — Build `AdminLayout`: minimal sidebar + breadcrumbs
  - [ ] T1.6.11 — Create `src/app/admin/layout.tsx`
  - [ ] T1.6.12 — Test responsive: 320px, 375px, 768px, 1024px, 1440px
  - [ ] T1.6.13 — Test layout switch by logging in as USER → TUTOR → ADMIN
- **Acceptance**: All 4 layouts render correctly across all breakpoints.

#### T1.7: Email infrastructure (Resend)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T0.10 (domain)
- **Description**: Resend setup with React Email templates and DNS verification.
- **Atomic tasks**:
  - [ ] T1.7.1 — Sign up at resend.com
  - [ ] T1.7.2 — Add domain in Resend dashboard
  - [ ] T1.7.3 — Add DNS records at domain registrar: SPF, DKIM (3 CNAME records), DMARC, MX (Resend)
  - [ ] T1.7.4 — Wait for Resend to verify domain (~5 min)
  - [ ] T1.7.5 — Generate API key, save to `.env.local` + Vercel as `RESEND_API_KEY`
  - [ ] T1.7.6 — Install `pnpm add resend @react-email/components @react-email/render`
  - [ ] T1.7.7 — Create `src/lib/email/client.ts` exporting `resend` client
  - [ ] T1.7.8 — Create `src/lib/email/send.ts` with `sendEmail({template, to, props})` helper
  - [ ] T1.7.9 — Build `src/lib/email/templates/Welcome.tsx`
  - [ ] T1.7.10 — Build `src/lib/email/templates/VerifyEmail.tsx`
  - [ ] T1.7.11 — Build `src/lib/email/templates/ResetPassword.tsx`
  - [ ] T1.7.12 — Build `src/lib/email/templates/Layout.tsx` (shared header/footer)
  - [ ] T1.7.13 — Set "from" address to `no-reply@<domain>` (verified)
  - [ ] T1.7.14 — Add Sentry breadcrumb on send + capture exception on failure
  - [ ] T1.7.15 — Test send to 3 addresses: Gmail, Yahoo, a `.ge` mailbox
  - [ ] T1.7.16 — Run mail-tester.com — score ≥ 9/10
- **Acceptance**: Test email arrives at all 3 inboxes without spam flag; DKIM passes.

#### T1.8: Error boundaries + 404 / 500 pages

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T1.6
- **Description**: Polished error pages in Georgian.
- **Atomic tasks**:
  - [ ] T1.8.1 — Create `src/app/not-found.tsx` (Georgian 404 with home link)
  - [ ] T1.8.2 — Create `src/app/error.tsx` (root error boundary, logs to Sentry, shows friendly message + retry + home)
  - [ ] T1.8.3 — Create `src/app/(public)/error.tsx`, `(dashboard)/error.tsx`, `(tutor)/error.tsx`, `admin/error.tsx`
  - [ ] T1.8.4 — Create `src/app/(public)/not-found.tsx` etc per route group
  - [ ] T1.8.5 — Test by throwing in a server component → fallback UI renders, Sentry captures
  - [ ] T1.8.6 — Test bad URL → custom 404 page
- **Acceptance**: All error/404 states styled correctly, errors caught and reported.

#### T1.9: Phase 1 tests

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T1.1–T1.8
- **Description**: Cover auth flow with unit + integration + E2E + a11y.
- **Atomic tasks**:
  - [ ] T1.9.1 — Unit test: `userRegistrationSchema` accepts valid input, rejects invalid (every field's failure mode)
  - [ ] T1.9.2 — Unit test: `tutorRegistrationSchema` similar
  - [ ] T1.9.3 — Unit test: bcrypt password hash + verify
  - [ ] T1.9.4 — Unit test: Georgian phone validator (`+995...` regex edge cases)
  - [ ] T1.9.5 — Unit test: DOB validator rejects < 18 years
  - [ ] T1.9.6 — Integration test (real Postgres): register → verify email token → login → session present in DB
  - [ ] T1.9.7 — Integration test: expired verify token → rejected
  - [ ] T1.9.8 — Integration test: password reset full flow
  - [ ] T1.9.9 — Integration test: middleware — USER GET `/admin` → 404
  - [ ] T1.9.10 — Integration test: middleware — TUTOR with PENDING status GET `/tutor/dashboard` → redirect to `/tutor/pending-status`
  - [ ] T1.9.11 — Integration test: middleware — ADMIN GET `/admin` → 200
  - [ ] T1.9.12 — Integration test: suspended user cannot log in
  - [ ] T1.9.13 — E2E: register via form → mock Resend webhook → click verify link → logged-in dashboard
  - [ ] T1.9.14 — E2E: tutor register → pending state → admin approves (DB seed) → public profile visible
  - [ ] T1.9.15 — E2E: password reset full flow
  - [ ] T1.9.16 — A11y scan: `/login`, `/register`, `/register/tutor`, `/forgot-password`, `/reset-password`, `/verify-email`
- **Acceptance**: All tests green; coverage for `src/lib/auth/` ≥ 80%.

---

### Phase 1 Gate (must pass before Phase 2)

**Automated:**
- [ ] All Phase 1 unit + integration + E2E tests green
- [ ] CI lint, type-check, audit clean
- [ ] Coverage ≥ 80% for `src/lib/auth/` and `src/lib/db/`
- [ ] Lighthouse on `/login` and `/register` → Performance ≥ 90, A11y ≥ 95

**Manual:**
- [ ] Register a new user via email/password → receive verification email at Gmail + at one `.ge` address → click link → logged in
- [ ] Register via Google OAuth → profile completion step → logged in
- [ ] Forgot password flow: receive token email, reset password, old token rejected when re-used
- [ ] Try to access `/admin` as USER → redirect to login; as TUTOR → 403; as ADMIN → renders
- [ ] Logout fully clears session — refresh shows logged-out state
- [ ] All Phase 1 forms tested with keyboard only (Tab, Enter, Esc) — no mouse needed
- [ ] DKIM passes on outbound email (use mail-tester.com — score ≥ 9/10)

**Exit criteria:** Auth is bulletproof. DB schema reviewed and committed. No flaky tests.

---

### Phase 2 — Public pages

**Goal:** Marketing surface complete. Anyone can browse, find a tutor, view a category, read FAQ. SEO is correct from day 1.
**Estimate:** 2.5 weeks (100h) including T2.9 tests + Phase 2 Gate.

#### T2.1: Homepage

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T1.6, T0.11 (Figma)
- **Description**: Build the homepage exactly per Figma.
- **Atomic tasks**:
  - [ ] T2.1.1 — Build `HeroSection` — headline + search input + 2 CTAs + trust badges
  - [ ] T2.1.2 — Implement search bar with autocomplete suggestions (server-fetched)
  - [ ] T2.1.3 — Build `CategoriesGrid` — 8–12 icon cards, server-fetched
  - [ ] T2.1.4 — Build `TutorCard` component (reusable)
  - [ ] T2.1.5 — Build `TutorCarousel` — horizontal scroll, swipe on mobile, arrows on desktop (use embla-carousel)
  - [ ] T2.1.6 — Build `FeaturedTutors` — 3 categories × carousel, server-fetched with ISR 60s
  - [ ] T2.1.7 — Build `HowItWorks` — 3-step illustrated, custom SVG icons
  - [ ] T2.1.8 — Build `TrustStrip` — TBC/BOG logos + stats counters
  - [ ] T2.1.9 — Build `Testimonials` — 3 user quotes (seeded fixtures for now)
  - [ ] T2.1.10 — Build `FAQTeaser` — top 4 collapsibles + "view all" link
  - [ ] T2.1.11 — Build `CTABand` — "Become a tutor" — coral background, white text
  - [ ] T2.1.12 — Assemble `src/app/(public)/page.tsx` with all sections
  - [ ] T2.1.13 — Configure ISR: `export const revalidate = 60`
  - [ ] T2.1.14 — Add metadata (title, description, OG image)
  - [ ] T2.1.15 — Lighthouse mobile check: Perf ≥ 90, A11y ≥ 95, LCP < 2.5s
  - [ ] T2.1.16 — Visual diff vs Figma (zoom-in on each section)
- **Acceptance**: Matches Figma; Lighthouse mobile budgets met.

#### T2.2: Tutors listing page (`/tutors`)

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T1.1
- **Description**: Filterable, paginated tutor browse page with URL-shareable state.
- **Atomic tasks**:
  - [ ] T2.2.1 — Build `FilterSidebar` (desktop) with: CategoryMultiselect, PriceRangeSlider, RatingFilter, SortDropdown
  - [ ] T2.2.2 — Build `FilterDrawer` (mobile) — opens from bottom sheet, applies on submit
  - [ ] T2.2.3 — Implement URL-state hook: `useFilters()` reading/writing search params
  - [ ] T2.2.4 — Server fetcher `fetchTutors({filters, page, perPage})` — Prisma query with where + orderBy + skip/take
  - [ ] T2.2.5 — Build `TutorsGrid` (uses `TutorCard` from T2.1)
  - [ ] T2.2.6 — Build `Pagination` component (1, 2, 3, …, last)
  - [ ] T2.2.7 — Build `EmptyFilterState` — "No tutors match — clear filters?"
  - [ ] T2.2.8 — Assemble `src/app/(public)/tutors/page.tsx` — SSR (no `'use client'`)
  - [ ] T2.2.9 — Metadata: dynamic title based on filters
  - [ ] T2.2.10 — Test: apply filter → URL updates; copy URL → reload → state restored
  - [ ] T2.2.11 — Test back/forward navigation
  - [ ] T2.2.12 — Lighthouse check
- **Acceptance**: Filters persist in URL; SSR initial load; back/forward works.

#### T2.3: Tutor profile page (`/tutors/[slug]`)

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T2.2
- **Description**: SEO-optimized tutor detail page with sticky booking widget.
- **Atomic tasks**:
  - [ ] T2.3.1 — Build `TutorHero` — large photo, name, headline, rating, category tags, share button
  - [ ] T2.3.2 — Build `IntroVideoPlayer` — autoplay muted on hover, click to unmute
  - [ ] T2.3.3 — Build `AboutSection` — bio text + skills chips
  - [ ] T2.3.4 — Build `CertificatesList` — grid of cert thumbnails with year + issuer
  - [ ] T2.3.5 — Build `EducationTimeline`
  - [ ] T2.3.6 — Build `ExperienceTimeline`
  - [ ] T2.3.7 — Build `ConsultationsList` — cards per consultation (title, duration, price, Book button)
  - [ ] T2.3.8 — Build `ReviewsSection` — aggregate rating + breakdown bars + paginated reviews
  - [ ] T2.3.9 — Build `TabsNav` (About / Consultations / Reviews / Calendar)
  - [ ] T2.3.10 — Build `BookingSidebar` (sticky desktop, fixed-bottom mobile) — placeholder (T4 fills functionality)
  - [ ] T2.3.11 — Generate `static params` from approved tutors at build
  - [ ] T2.3.12 — Configure ISR `revalidate = 60`
  - [ ] T2.3.13 — Add Schema.org `Person` + `Service` JSON-LD via `<script type="application/ld+json">`
  - [ ] T2.3.14 — Build OG image route `src/app/tutors/[slug]/opengraph-image.tsx` (Next OG API)
  - [ ] T2.3.15 — Generate dynamic metadata in `generateMetadata()`
  - [ ] T2.3.16 — Test with FB Sharing Debugger + Twitter Card Validator
  - [ ] T2.3.17 — Test with Google Rich Results Test
- **Acceptance**: JSON-LD validates; OG image renders; Google Rich Results pass.

#### T2.4: Categories landing pages (`/category/[slug]`)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T2.2
- **Description**: SEO-targeted category landing pages.
- **Atomic tasks**:
  - [ ] T2.4.1 — Build `CategoryHero` — title, description, tutor count, related categories chips
  - [ ] T2.4.2 — Reuse `TutorsGrid` from T2.2 pre-filtered by category
  - [ ] T2.4.3 — Generate `static params` for all active categories
  - [ ] T2.4.4 — `generateMetadata()` with category-specific title + description
  - [ ] T2.4.5 — Add OG image per category
  - [ ] T2.4.6 — Configure ISR
- **Acceptance**: Each category has unique SEO meta and renders correctly.

#### T2.5: Consultations listing page (`/consultations`)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T2.2
- **Description**: Browse by consultation offering.
- **Atomic tasks**:
  - [ ] T2.5.1 — Build `ConsultationCard` (different shape from TutorCard)
  - [ ] T2.5.2 — Reuse FilterSidebar/Drawer from T2.2
  - [ ] T2.5.3 — Server fetcher `fetchConsultations({filters, page})` joining Consultation + Tutor
  - [ ] T2.5.4 — Build `src/app/(public)/consultations/page.tsx`
  - [ ] T2.5.5 — Add metadata + canonical URL
- **Acceptance**: Same UX as `/tutors` with consultation-shape cards.

#### T2.6: FAQ page

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T1.6
- **Description**: FAQ with categorized accordions, anchor links.
- **Atomic tasks**:
  - [ ] T2.6.1 — Decide storage: MDX file in `content/faq.mdx`
  - [ ] T2.6.2 — Install `pnpm add next-mdx-remote` (or use `@next/mdx`)
  - [ ] T2.6.3 — Write initial FAQ content: 4 categories × 5–8 questions in Georgian
  - [ ] T2.6.4 — Build `FAQAccordion` component (shadcn Accordion-based)
  - [ ] T2.6.5 — Build `src/app/(public)/faq/page.tsx`
  - [ ] T2.6.6 — Implement `?q=slug` URL param → auto-open + scroll to that question
  - [ ] T2.6.7 — Add SEO FAQ schema.org JSON-LD
- **Acceptance**: Anchors deep-link correctly; Google FAQ rich result test passes.

#### T2.7: Contact page

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T1.7
- **Description**: Contact form with anti-spam.
- **Atomic tasks**:
  - [ ] T2.7.1 — Sign up at hcaptcha.com, get site key + secret
  - [ ] T2.7.2 — Add `HCAPTCHA_SITEKEY` (public) + `HCAPTCHA_SECRET` (server) to env
  - [ ] T2.7.3 — Install `pnpm add @hcaptcha/react-hcaptcha`
  - [ ] T2.7.4 — Build contact form: name, email, subject (select), message
  - [ ] T2.7.5 — Server action `submitContactForm({...})` — verify hCaptcha server-side, insert `SupportTicket`, send admin notification email
  - [ ] T2.7.6 — Static info section: address, email, phone, social icons
  - [ ] T2.7.7 — Success state UI after submit
  - [ ] T2.7.8 — Rate limit: 3 submissions per 10 min per IP
- **Acceptance**: Form delivers email + creates ticket; bot blocked by hCaptcha.

#### T2.8: SEO infrastructure

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T2.1, T2.3
- **Description**: Full SEO foundation: sitemap, robots, metadata, canonical, OG, Search Console.
- **Atomic tasks**:
  - [ ] T2.8.1 — Create `src/app/sitemap.ts` (Next.js native) — dynamic with all approved tutors + categories + static pages
  - [ ] T2.8.2 — Create `src/app/robots.ts` — allow all except `/api`, `/admin`, `/dashboard`, `/tutor`
  - [ ] T2.8.3 — Add canonical URL via metadata `alternates.canonical` on every page
  - [ ] T2.8.4 — Add Open Graph metadata on every public page (title, description, image, type)
  - [ ] T2.8.5 — Add Twitter Card metadata
  - [ ] T2.8.6 — Build OG image route for homepage, tutor, category, consultation
  - [ ] T2.8.7 — Add `<link rel="alternate" hreflang="ka-GE">` placeholder (i18n forward-compat)
  - [ ] T2.8.8 — Sign up for Google Search Console + verify domain ownership
  - [ ] T2.8.9 — Submit `sitemap.xml` to Search Console
  - [ ] T2.8.10 — Sign up for Bing Webmaster Tools (smaller but free)
  - [ ] T2.8.11 — Verify first crawl shows URLs indexed
- **Acceptance**: Sitemap submitted; URLs indexed; OG previews work in social sharing.

#### T2.9: Phase 2 tests

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T2.1–T2.8
- **Description**: Cover public pages with unit + component + E2E + a11y + SEO.
- **Atomic tasks**:
  - [ ] T2.9.1 — Unit: filter URL-state round-trip (encode → decode → equal)
  - [ ] T2.9.2 — Unit: slug generation (kebab-case, transliterates Georgian)
  - [ ] T2.9.3 — Unit: GEL price formatter (50 → "50 ₾", 1000 → "1,000 ₾", 0 → "უფასო")
  - [ ] T2.9.4 — Component: TutorCard all variants
  - [ ] T2.9.5 — Component: FilterDrawer state sync
  - [ ] T2.9.6 — Component: TutorCarousel keyboard navigation (arrow keys, focus)
  - [ ] T2.9.7 — E2E: Homepage → click category → filter applied → open tutor profile → tabs work
  - [ ] T2.9.8 — E2E: Filter persistence (back/forward)
  - [ ] T2.9.9 — E2E: FAQ anchor (`?q=refund-policy`) opens and scrolls
  - [ ] T2.9.10 — E2E: Contact form submit → success state + admin email mock
  - [ ] T2.9.11 — A11y scan: homepage, `/tutors`, `/tutors/[slug]`, `/category/[slug]`, `/consultations`, `/faq`, `/contact`
  - [ ] T2.9.12 — SEO: `sitemap.xml` is valid XML with all approved tutors
  - [ ] T2.9.13 — SEO: OG image renders correctly (snapshot test)
  - [ ] T2.9.14 — Lighthouse CI: SEO ≥ 95 on every public page
- **Acceptance**: All tests green; Lighthouse SEO ≥ 95.

---

### Phase 2 Gate (must pass before Phase 3)

**Automated:**
- [ ] All Phase 2 tests green
- [ ] Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95 on homepage and tutor profile
- [ ] LCP < 2.5s on mobile 4G simulation
- [ ] JSON-LD validates via Google Rich Results Test
- [ ] sitemap.xml validates as XML and includes seeded tutors

**Manual:**
- [ ] Test on **real iPhone** (mid-range) — full browse → tutor profile flow works, no scroll-lock or zoom bugs
- [ ] Test on **real Android** (mid-range, e.g., Samsung A series) — same flow
- [ ] Test on slow 3G (Chrome DevTools throttle) — first paint within 4s
- [ ] OG image: share a tutor URL in Telegram + Facebook → preview renders with photo + name
- [ ] Read all Georgian copy aloud — fix awkward translations, typos
- [ ] Click every link in header + footer — no 404s
- [ ] Disable JavaScript → critical content (tutor profile, categories) still readable (server-rendered)
- [ ] Print stylesheet check: ⌘P on tutor profile → no broken layout

**Exit criteria:** Public site is launch-quality even though backend features aren't done. Could ship as a "coming soon" today.

---

### Phase 3 — Tutor onboarding & profile setup

**Goal:** A registered tutor can complete their profile, submit for approval, manage consultations, and set availability.
**Estimate:** 3 weeks (120h) including T3.11 slot-generation tests + Phase 3 Gate.

#### T3.1: Tutor onboarding wizard

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T1.3, T1.5
- **Description**: 6-step wizard with mid-flow save and final submit.
- **Atomic tasks**:
  - [ ] T3.1.1 — Build `WizardShell`: progress bar (6 steps), Save & exit button, Next/Back navigation
  - [ ] T3.1.2 — Step 1: Basic info (headline, bio, profile photo placeholder)
  - [ ] T3.1.3 — Step 2: Photo + intro video upload (links into T3.2, T3.3)
  - [ ] T3.1.4 — Step 3: Skills + categories (links into T3.4, T3.5)
  - [ ] T3.1.5 — Step 4: Education + experience (links into T3.4)
  - [ ] T3.1.6 — Step 5: Certificates (links into T3.4)
  - [ ] T3.1.7 — Step 6: Review & submit — read-only preview of all steps + "Submit for approval" button
  - [ ] T3.1.8 — Persist progress to DB per step (Tutor row + child rows)
  - [ ] T3.1.9 — Resume from any step on next login
  - [ ] T3.1.10 — Submit action: status PENDING_REVIEW, notify admin via email
  - [ ] T3.1.11 — Lock all wizard fields while status=PENDING_REVIEW (show "Submitted, awaiting review" banner)
  - [ ] T3.1.12 — Allow re-edit if status=REJECTED
- **Acceptance**: Mid-flow exit/resume works; admin email arrives on submit.

#### T3.2: Profile photo upload

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T3.1
- **Description**: Upload + crop + multi-size variants to R2.
- **Atomic tasks**:
  - [ ] T3.2.1 — Sign up for Cloudflare R2; create bucket `tutor-platform-assets`
  - [ ] T3.2.2 — Generate R2 API tokens with scoped permissions
  - [ ] T3.2.3 — Add R2 env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
  - [ ] T3.2.4 — Install `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp`
  - [ ] T3.2.5 — Create `src/lib/storage/r2.ts` with signed-URL helpers
  - [ ] T3.2.6 — Server action `requestUploadUrl({type: 'profile_photo'})` — returns presigned PUT URL
  - [ ] T3.2.7 — Client: install `react-easy-crop` for square crop UI
  - [ ] T3.2.8 — Drag-and-drop file zone with preview
  - [ ] T3.2.9 — Client validation: min 400×400, max 10MB, jpeg/png/webp
  - [ ] T3.2.10 — Crop to 1:1 client-side before upload
  - [ ] T3.2.11 — Server action `finalizePhoto({key})` — fetch from R2, generate 200/400/800 variants via sharp, upload variants, save `photoUrl` (base) on Tutor
  - [ ] T3.2.12 — Render variants via `<Image>` `sizes` for responsive
  - [ ] T3.2.13 — Cleanup old photo variants when re-uploaded
- **Acceptance**: Photo renders in cards (200), profile (400/800); old photo cleaned up.

#### T3.3: Intro video upload

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T3.1
- **Description**: Upload short intro video, server-side validate, generate poster.
- **Atomic tasks**:
  - [ ] T3.3.1 — Decide path: v1 = direct R2 upload (no transcode); revisit Cloudflare Stream in v2
  - [ ] T3.3.2 — Client validation: MP4/WebM, ≤ 60s (read metadata), ≤ 50MB
  - [ ] T3.3.3 — Presigned R2 upload with progress bar
  - [ ] T3.3.4 — Server action `finalizeIntroVideo({key})` — verify duration via ffprobe (or rely on client check), save `introVideoUrl`
  - [ ] T3.3.5 — Generate poster image via ffmpeg first-frame on server (`@ffmpeg-installer/ffmpeg`) → store as `<key>-poster.jpg`
  - [ ] T3.3.6 — Build `<video controls poster={...}>` component on profile
  - [ ] T3.3.7 — Test on iOS Safari (autoplay policies)
- **Acceptance**: Video plays mobile + desktop; constraints enforced; poster shows before play.

#### T3.4: Skills, certificates, education, experience editors

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T3.1
- **Description**: 4 list editors with add/edit/delete/reorder.
- **Atomic tasks**:
  - [ ] T3.4.1 — Build `SkillsEditor`: tag input with autocomplete from common pool (seeded list)
  - [ ] T3.4.2 — Seed common skills table (200+ Georgian skills across categories)
  - [ ] T3.4.3 — Build `CertificatesEditor` with file upload (PDF/image to R2)
  - [ ] T3.4.4 — Build `EducationTimelineEditor` (institution, degree, year-from, year-to)
  - [ ] T3.4.5 — Build `ExperienceTimelineEditor` (company, role, year-from, year-to or "present", description)
  - [ ] T3.4.6 — Install `pnpm add @dnd-kit/core @dnd-kit/sortable` for reorder
  - [ ] T3.4.7 — Implement drag-to-reorder with persistence (`sortOrder` field on each row)
  - [ ] T3.4.8 — Validate: max 30 skills, max 20 certificates, max 10 education, max 15 experience
  - [ ] T3.4.9 — Delete confirmation dialog
- **Acceptance**: All 4 editors support add/edit/delete/reorder; reorder persists.

#### T3.5: Categories selection

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T3.1
- **Description**: Pick up to 3 categories with primary designation.
- **Atomic tasks**:
  - [ ] T3.5.1 — Seed initial categories (10–15) via Prisma seed: ბიზნეს კონსულტაცია, ფსიქოლოგია, კარიერა, განათლება, IT, ენები, ფინანსები, იურიდიული, etc
  - [ ] T3.5.2 — Build `CategoryPicker` — checkbox list with max 3 selection
  - [ ] T3.5.3 — Drag to set primary (first-picked is primary by default)
  - [ ] T3.5.4 — Persist via `TutorCategory` join table with `isPrimary` flag
- **Acceptance**: Selection persists; primary used in listings.

#### T3.6: Consultation CRUD

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T3.4
- **Description**: Full CRUD for consultation offerings.
- **Atomic tasks**:
  - [ ] T3.6.1 — Build consultations list page at `/tutor/consultations` with table + "Create new" button
  - [ ] T3.6.2 — Build `ConsultationForm` (modal or page): title, short desc, long desc, category, duration (radio 15/30/45/60/90), price GEL, bookingType (radio), maxPerDay, advanceNoticeMinutes
  - [ ] T3.6.3 — Zod validation: title 5–80 chars, price 5–500 GEL, etc
  - [ ] T3.6.4 — Server action `createConsultation`, `updateConsultation`, `archiveConsultation`
  - [ ] T3.6.5 — Confirm dialog on archive (warn about existing bookings)
  - [ ] T3.6.6 — Empty state: "Create your first consultation"
  - [ ] T3.6.7 — Archived view filter (toggle "Show archived")
  - [ ] T3.6.8 — Price preview: "User pays Xლ, you receive X * (1 - commission)"
- **Acceptance**: CRUD works; archived consultations hidden from public; tutor's archive view shows them.

#### T3.7: Availability — fixed weekly schedule

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T3.6
- **Description**: Weekly recurring availability grid editor.
- **Atomic tasks**:
  - [ ] T3.7.1 — Build `WeeklyGrid` UI: 7 columns × hours (6:00–23:00)
  - [ ] T3.7.2 — Click to add 30-min slot; drag to extend; click to remove
  - [ ] T3.7.3 — Display existing windows as filled rectangles
  - [ ] T3.7.4 — Server action `saveAvailability(weekday, start, end)` — upsert
  - [ ] T3.7.5 — Server action `deleteAvailability(id)`
  - [ ] T3.7.6 — "Copy from Monday to weekdays" quick action
  - [ ] T3.7.7 — Mobile fallback: time-input pairs per weekday
  - [ ] T3.7.8 — All times stored as UTC (convert from Asia/Tbilisi on save/load)
  - [ ] T3.7.9 — Edit triggers cache invalidation for affected dates
- **Acceptance**: Schedule UI matches Figma; persists correctly with timezone math.

#### T3.8: Availability — date exceptions

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T3.7
- **Description**: One-off block / extra windows per date.
- **Atomic tasks**:
  - [ ] T3.8.1 — Build `ExceptionsList` panel beside weekly grid
  - [ ] T3.8.2 — Add exception form: date picker, type (BLOCK / EXTRA), time range (only required for EXTRA)
  - [ ] T3.8.3 — Server actions: `createException`, `deleteException`
  - [ ] T3.8.4 — Visualize on grid for the chosen week (red shading for BLOCK, green for EXTRA)
  - [ ] T3.8.5 — Vacation mode shortcut: block range of dates
  - [ ] T3.8.6 — Cache invalidation on exception edit
- **Acceptance**: Slot UI on exception dates correctly reflects block/extra.

#### T3.9: Slot generation logic

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T3.7, T3.8, T1.1
- **Description**: Pure-function slot generator with comprehensive edge cases.
- **Atomic tasks**:
  - [ ] T3.9.1 — Install `pnpm add date-fns date-fns-tz`
  - [ ] T3.9.2 — Create `src/lib/booking/generateSlots.ts` — signature `(consultation, tutor, dateRange) → Slot[]`
  - [ ] T3.9.3 — Expand weekly schedule into concrete date+time slots for range
  - [ ] T3.9.4 — Apply BLOCK exceptions: remove overlapping slots
  - [ ] T3.9.5 — Apply EXTRA exceptions: add slots
  - [ ] T3.9.6 — Chunk windows into slot-sized blocks per consultation duration
  - [ ] T3.9.7 — Subtract existing bookings in PENDING / PAID / CONFIRMED states
  - [ ] T3.9.8 — Apply advance-notice cutoff (now + advanceNoticeMinutes)
  - [ ] T3.9.9 — Apply max-per-day limit
  - [ ] T3.9.10 — Apply buffer between bookings (configurable, default 0 in v1)
  - [ ] T3.9.11 — Handle DST boundaries (Asia/Tbilisi does not observe DST, but assert via test)
  - [ ] T3.9.12 — Return slots in user timezone (Asia/Tbilisi)
  - [ ] T3.9.13 — Add Redis caching layer (optional v1 — defer unless slow)
  - [ ] T3.9.14 — Cache invalidation hooks on booking/availability changes
- **Acceptance**: All edge cases covered by unit tests (T3.11).

#### T3.10: Tutor settings page

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T1.6
- **Description**: 3 tabs of tutor settings.
- **Atomic tasks**:
  - [ ] T3.10.1 — Build settings layout with Tabs (Profile / Payments / Refund Policy)
  - [ ] T3.10.2 — Profile tab: re-edit profile fields (locks Status if PENDING_REVIEW)
  - [ ] T3.10.3 — Payments tab: IBAN input (validate Georgian IBAN format `GE\d{2}...`), ID document upload (encrypted at rest)
  - [ ] T3.10.4 — Payments tab: payout history placeholder (filled by T6.6)
  - [ ] T3.10.5 — Refund Policy tab: toggle "Use platform default" (§3.5) OR custom — date bracket sliders
  - [ ] T3.10.6 — IBAN + ID stored encrypted via `@/lib/crypto` AES-256 with `ENCRYPTION_KEY` env var
  - [ ] T3.10.7 — Trigger ISR revalidate on profile field change
- **Acceptance**: Settings persist; public profile reflects after ISR.

#### T3.11: Phase 3 tests (slot-generation critical)

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T3.1–T3.10
- **Description**: Highest test rigor on `generateSlots()` + wizard + uploads.
- **Atomic tasks**:
  - [ ] T3.11.1 — Unit: regular weekly schedule produces correct slots
  - [ ] T3.11.2 — Unit: BLOCK exception hides slots
  - [ ] T3.11.3 — Unit: EXTRA exception adds slots
  - [ ] T3.11.4 — Unit: fully-booked day returns empty
  - [ ] T3.11.5 — Unit: advance-notice cutoff excludes near-term
  - [ ] T3.11.6 — Unit: max-per-day reached → no more slots
  - [ ] T3.11.7 — Unit: timezone math (Asia/Tbilisi → UTC)
  - [ ] T3.11.8 — Unit: buffer between consecutive bookings
  - [ ] T3.11.9 — Unit: empty schedule returns empty array
  - [ ] T3.11.10 — Unit: invalid date range (start > end) throws
  - [ ] T3.11.11 — Integration: wizard saves progress mid-flow; resume from any step
  - [ ] T3.11.12 — Integration: submit changes status; admin email mocked
  - [ ] T3.11.13 — Component: AvailabilityGrid drag-to-extend
  - [ ] T3.11.14 — Component: ConsultationForm zod validation
  - [ ] T3.11.15 — Component: SkillsEditor reorder
  - [ ] T3.11.16 — E2E: full tutor onboarding from signup to approval
  - [ ] T3.11.17 — E2E: photo upload via R2 mock
  - [ ] T3.11.18 — E2E: archive consultation → gone from public listing
  - [ ] T3.11.19 — A11y: each wizard step scanned
- **Acceptance**: `generateSlots()` 100% branch coverage; all other tests green.

---

### Phase 3 Gate (must pass before Phase 4)

**Automated:**
- [ ] All Phase 3 tests green
- [ ] `generateSlots()` branch coverage = 100%
- [ ] Wizard saves/resumes work via integration test
- [ ] R2 file upload smoke test (a known-good image uploads and renders)

**Manual:**
- [ ] Onboard a fake tutor end-to-end yourself — every wizard step, including photo + video upload
- [ ] Upload a 1080p photo → server resizes to 200/400/800 variants → each variant renders on cards/profile
- [ ] Upload a 60s MP4 → plays inline; upload 90s MP4 → rejected with clear error
- [ ] Set availability Mon 14:00–18:00 with 30-min consultation → slots `14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30` appear
- [ ] Add an exception BLOCK for tomorrow → slots gone for that date
- [ ] Add an EXTRA window for Saturday → slots appear even though no recurring schedule for Saturday
- [ ] Archive a consultation → still in tutor's archive view, gone from public listings
- [ ] Edit profile after submission → profile is locked (cannot edit while pending)

**Exit criteria:** A real tutor (your first hand-recruited launch tutor candidate) can onboard themselves without help.

---

### Phase 4 — Booking flow & payments

**Goal:** A logged-in user can find a tutor, pick a slot, pay via TBC or BOG, and have a confirmed booking in the database.
**Estimate:** 3 weeks (120h) including T4.10 money-critical tests + mock acquirer + Phase 4 Gate.

#### T4.1: Booking widget on tutor profile

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T2.3, T3.9
- **Description**: 3-step booking flow modal with progress + back button.
- **Atomic tasks**:
  - [ ] T4.1.1 — Build `BookingModal` shell with progress indicator (●─○─○)
  - [ ] T4.1.2 — Step 1: `ConsultationPicker` — list cards with title/duration/price/select
  - [ ] T4.1.3 — Step 2: `DatePicker` (next 30 days, available-days highlighted via T3.9) + `SlotGrid` (chunked slots)
  - [ ] T4.1.4 — Step 3: `BookingSummary` — review all info + refund policy expandable + T&C checkbox
  - [ ] T4.1.5 — "Log in to continue" CTA mid-modal if not authenticated
  - [ ] T4.1.6 — Back button on steps 2 + 3
  - [ ] T4.1.7 — Cannot proceed without selection at each step
  - [ ] T4.1.8 — Loading skeletons on slot fetch
  - [ ] T4.1.9 — Mobile: BottomSheet variant
  - [ ] T4.1.10 — Sticky CTA on tutor profile triggers modal open
- **Acceptance**: All 3 steps reachable; pre-fill works; loading + skeleton states match Figma.

#### T4.2: Booking creation (PENDING state)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T4.1, T1.1
- **Description**: Race-condition-safe booking insert.
- **Atomic tasks**:
  - [ ] T4.2.1 — Create server action `createBooking({tutorId, consultationId, startTime})`
  - [ ] T4.2.2 — Inside `prisma.$transaction()`: re-verify slot via `generateSlots` (defense against URL hacks)
  - [ ] T4.2.3 — INSERT booking with status=PENDING, expiresAt=NOW()+10 min
  - [ ] T4.2.4 — Catch Prisma unique constraint violation → return `{ error: 'SLOT_TAKEN' }`
  - [ ] T4.2.5 — Return `{ bookingId, paymentUrl: '/checkout/<bookingId>' }`
  - [ ] T4.2.6 — Rate limit: max 10 PENDING bookings per user (prevent slot hoarding)
  - [ ] T4.2.7 — Audit-log creation attempt + outcome
- **Acceptance**: Race-condition test passes 50/50 trials.

#### T4.3: TBC E-Commerce integration

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T0.7 (sandbox creds), T4.2
- **Description**: Full TBC integration: init, webhook, refund.
- **Atomic tasks**:
  - [ ] T4.3.1 — Read TBC E-Commerce API documentation thoroughly; document quirks
  - [ ] T4.3.2 — Create `src/lib/payments/tbc.ts` with typed wrapper
  - [ ] T4.3.3 — Function `initPayment({bookingId, amountGel, returnUrl, callbackUrl})` — calls TBC API, returns redirect URL
  - [ ] T4.3.4 — Function `verifyWebhookSignature(payload, signature)` — HMAC verification
  - [ ] T4.3.5 — Function `captureTransaction({tbcTxId})` — if pre-auth model used
  - [ ] T4.3.6 — Function `refundTransaction({tbcTxId, amountGel})`
  - [ ] T4.3.7 — Create `/checkout/[bookingId]/page.tsx` — shows TBC + BOG buttons
  - [ ] T4.3.8 — Server action `redirectToTbc(bookingId)` → calls `initPayment`, redirects
  - [ ] T4.3.9 — Create webhook route `src/app/api/webhooks/tbc/route.ts`
  - [ ] T4.3.10 — Webhook: verify signature → find booking by merchant ref → idempotent state update
  - [ ] T4.3.11 — Handle outcomes: success → PAID, fail → keep PENDING, timeout → log, fraud → CANCELLED with note
  - [ ] T4.3.12 — Insert Transaction row on success
  - [ ] T4.3.13 — Set `payout_status=HELD` on successful Transaction
  - [ ] T4.3.14 — Trigger booking confirmation email (T4.6)
  - [ ] T4.3.15 — Sentry capture on any webhook error
  - [ ] T4.3.16 — Log webhook events to `WebhookLog` table for debugging (audit trail)
- **Acceptance**: Sandbox card succeeds end-to-end; failed card leaves PENDING (cron expires); friendly error to user.

#### T4.4: BOG iPay integration

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T0.8, T4.2
- **Description**: Full BOG iPay integration, parallel structure to T4.3.
- **Atomic tasks**:
  - [ ] T4.4.1 — Read BOG iPay API docs
  - [ ] T4.4.2 — Create `src/lib/payments/bog.ts` with typed wrapper (mirror of TBC interface)
  - [ ] T4.4.3 — `initPayment`, `verifyWebhookSignature`, `refundTransaction` functions
  - [ ] T4.4.4 — Webhook route `src/app/api/webhooks/bog/route.ts`
  - [ ] T4.4.5 — Update `/checkout/[bookingId]` page to show TBC + BOG buttons side-by-side
  - [ ] T4.4.6 — Unified internal interface `PaymentProvider` so business logic doesn't depend on provider
  - [ ] T4.4.7 — Test sandbox flow
- **Acceptance**: Sandbox BOG payment succeeds; both providers work from same checkout.

#### T4.5: Booking expiration cron

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T4.2
- **Description**: Vercel Cron expires stale PENDING bookings.
- **Atomic tasks**:
  - [ ] T4.5.1 — Configure `vercel.json` with cron: `0 */5 * * * *` → `/api/cron/expire-bookings`
  - [ ] T4.5.2 — Create route handler `src/app/api/cron/expire-bookings/route.ts`
  - [ ] T4.5.3 — Auth: verify `CRON_SECRET` header (set in Vercel env)
  - [ ] T4.5.4 — Query: `UPDATE bookings SET status='EXPIRED' WHERE status='PENDING' AND expires_at < NOW()`
  - [ ] T4.5.5 — Log count of expired bookings; send Sentry event if > 50 in one run (anomaly)
- **Acceptance**: PENDING > 10 min → EXPIRED; slot reappears.

#### T4.6: Booking confirmation emails

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T1.7, T4.3
- **Description**: Confirmation emails to both parties with .ics attachment.
- **Atomic tasks**:
  - [ ] T4.6.1 — Install `pnpm add ics` (calendar file generator)
  - [ ] T4.6.2 — Function `generateIcs(booking)` returning `.ics` content with VEVENT
  - [ ] T4.6.3 — Build `BookingConfirmedUser.tsx` template — summary + .ics attachment + join link
  - [ ] T4.6.4 — Build `BookingConfirmedTutor.tsx` template — new booking + user info
  - [ ] T4.6.5 — Hook into TBC webhook success path — fire both emails
  - [ ] T4.6.6 — Same for BOG
  - [ ] T4.6.7 — Test .ics imports correctly in Google Calendar (manual)
  - [ ] T4.6.8 — Test rendering in Gmail, iOS Mail, Android Gmail (Litmus or manual)
- **Acceptance**: Both emails arrive < 1 min; .ics imports cleanly.

#### T4.7: Booking reminder cron

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T4.6
- **Description**: 24h + 1h reminder emails, idempotent.
- **Atomic tasks**:
  - [ ] T4.7.1 — Cron entry: `0 * * * *` → `/api/cron/send-reminders`
  - [ ] T4.7.2 — Build `BookingReminder24h.tsx` template
  - [ ] T4.7.3 — Build `BookingReminder1h.tsx` template (with prominent join link)
  - [ ] T4.7.4 — Logic: select bookings starting in [23h, 25h] with `reminder_24h_sent_at IS NULL`
  - [ ] T4.7.5 — Send email → atomically update `reminder_24h_sent_at` (prevents double-send)
  - [ ] T4.7.6 — Same for 1h reminder window [50min, 70min]
  - [ ] T4.7.7 — Test: trigger cron twice — second run is no-op
- **Acceptance**: Reminders fire exactly once per booking; no double-sends even if cron retries.

#### T4.8: Booking cancellation flow (user side)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T4.6
- **Description**: User-initiated cancellation with policy-based refund.
- **Atomic tasks**:
  - [ ] T4.8.1 — Function `calculateRefund(booking)` — applies §3.5 default or tutor override, returns `{percent, amountGel, reasonCode}`
  - [ ] T4.8.2 — Build cancel confirmation dialog: shows refund amount, policy explanation, cancel reason field
  - [ ] T4.8.3 — Server action `cancelBookingByUser({bookingId, reason})`
  - [ ] T4.8.4 — Inside transaction: update Booking.status=CANCELLED, write Transaction.refundedAt, call provider refund API
  - [ ] T4.8.5 — Handle provider refund failure: revert state + alert admin (don't leave user stuck)
  - [ ] T4.8.6 — On refund webhook receipt: update `Transaction.payout_status=REFUNDED`
  - [ ] T4.8.7 — Send user "cancellation confirmed" email + tutor "booking cancelled" email
  - [ ] T4.8.8 — Release the slot (it should re-appear in availability)
- **Acceptance**: Each refund bracket computes correctly; refund propagates everywhere.

#### T4.9: Booking cancellation flow (tutor side)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T4.8
- **Description**: Tutor-initiated cancellation with strike system.
- **Atomic tasks**:
  - [ ] T4.9.1 — Server action `cancelBookingByTutor({bookingId, reason})` — full refund regardless of policy
  - [ ] T4.9.2 — Insert row in `TutorCancellationEvent` table
  - [ ] T4.9.3 — Count cancellations in last 30 days; if ≥ 3 → set `Tutor.status=SUSPENDED` automatically
  - [ ] T4.9.4 — Email tutor: "You've been auto-suspended" + how to appeal
  - [ ] T4.9.5 — Email admin: tutor X auto-suspended (review queue)
  - [ ] T4.9.6 — Email user: tutor cancelled + full refund + 10% discount code for next booking (optional growth lever)
  - [ ] T4.9.7 — Confirm dialog for tutor with strong warning
- **Acceptance**: Strike system triggers at 3rd cancellation; admin alerted.

#### T4.10: Phase 4 tests (money-critical — highest rigor)

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T4.1–T4.9
- **Description**: Mock acquirer + exhaustive payment-flow tests.
- **Atomic tasks**:
  - [ ] T4.10.1 — Build mock TBC route `/api/_test/mock-tbc` (env-gated)
  - [ ] T4.10.2 — Build mock BOG route `/api/_test/mock-bog`
  - [ ] T4.10.3 — Mock supports payloads: success, fail, timeout, fraud-block, refund-success, refund-fail
  - [ ] T4.10.4 — Mock can be triggered to send webhook back to our handler
  - [ ] T4.10.5 — Unit: refund calculation at 24h boundary (24h+1s vs 24h-1s)
  - [ ] T4.10.6 — Unit: refund calculation at 2h boundary
  - [ ] T4.10.7 — Unit: refund calculation no-show case
  - [ ] T4.10.8 — Unit: commission calculation 5/50/100/500 GEL inputs
  - [ ] T4.10.9 — Integration: 10 parallel bookSlot → 1 wins (using `Promise.allSettled`)
  - [ ] T4.10.10 — Stress: re-run race test 50× → all pass
  - [ ] T4.10.11 — Integration: expire-bookings cron
  - [ ] T4.10.12 — Integration: webhook idempotency (same payload 3×)
  - [ ] T4.10.13 — Integration: forged webhook signature → 401
  - [ ] T4.10.14 — Integration: reminder cron idempotent (run 2× → 1 send)
  - [ ] T4.10.15 — Integration: user cancel > 24h → full refund
  - [ ] T4.10.16 — Integration: tutor strike system (3rd cancellation → suspended)
  - [ ] T4.10.17 — E2E: full booking happy path with mock acquirer
  - [ ] T4.10.18 — E2E: declined card → friendly error → slot reappears after cron
  - [ ] T4.10.19 — A11y: booking modal all 3 steps + /checkout page
  - [ ] T4.10.20 — Coverage check: `src/lib/payments/` + `src/server/actions/bookings/` ≥ 90%
- **Acceptance**: Race-condition test 50/50 pass; all idempotency tests green; coverage ≥ 90%.

---

### Phase 4 Gate (must pass before Phase 5) — **HIGHEST SCRUTINY**

**Automated:**
- [ ] All Phase 4 tests green; race condition test re-run 50× → 50× pass
- [ ] Webhook idempotency verified — same payload 5× → state unchanged after first
- [ ] Coverage ≥ 90% for `src/lib/payments/` and `src/server/actions/bookings/`
- [ ] Load test: 50 concurrent bookings on same tutor's calendar → no double-bookings (k6 small scenario, not full T8.4)

**Manual — TBC sandbox:**
- [ ] Successful payment with sandbox card → booking PAID → email arrives → `.ics` opens in Google Calendar correctly
- [ ] Declined card → booking stays PENDING → expires per cron → slot reappears
- [ ] 3D-Secure flow → completes → booking PAID
- [ ] Sandbox refund: cancel booking > 24h → refund webhook fires → state updates
- [ ] Sandbox refund: cancel booking 1h before → 50% refund processed, correct amount

**Manual — BOG sandbox:**
- [ ] Same 5 scenarios as TBC, verified independently

**Manual — UX:**
- [ ] Book a consultation as a real-feeling user — confusing copy or missing trust signals get flagged
- [ ] Try to book past slot via URL hack → server rejects
- [ ] Try to double-book same slot in 2 browser windows → second window gets "slot taken" friendly error
- [ ] Test booking confirmation email rendering in Gmail (web + iOS Mail + Android Gmail)

**Exit criteria:** Money flow is bulletproof. **DO NOT MOVE TO PHASE 5 IF ANY MONEY TEST IS FLAKY.** Document every test scenario verified with screenshots in `docs/qa/phase-4-evidence/`.

---

### Phase 5 — Video sessions

**Goal:** At session time, both parties join a LiveKit room. Video, audio, screen share, in-call chat, file share work. Post-session, the user can rate the tutor.
**Estimate:** 2 weeks (80h) including T5.10 tests + Phase 5 Gate.

#### T5.1: LiveKit setup

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: None
- **Description**: Provision LiveKit Cloud + install SDKs.
- **Atomic tasks**:
  - [ ] T5.1.1 — Sign up at livekit.io / cloud.livekit.io
  - [ ] T5.1.2 — Create LiveKit project; choose region close to Georgia (likely EU)
  - [ ] T5.1.3 — Generate API Key + Secret; save to `.env.local` + Vercel: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`
  - [ ] T5.1.4 — Install `pnpm add livekit-server-sdk livekit-client @livekit/components-react @livekit/components-styles`
  - [ ] T5.1.5 — Write Node script to test SDK connection (create test room)
  - [ ] T5.1.6 — Configure LiveKit usage alerts: 70% / 90% of monthly free tier (50h)
- **Acceptance**: Test script creates a room successfully on LiveKit Cloud.

#### T5.2: Room creation on session start

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T5.1, T4.6
- **Description**: Lazy room creation + scoped JWT tokens.
- **Atomic tasks**:
  - [ ] T5.2.1 — Server action `requestRoomToken({bookingId})` — verifies user is party to booking
  - [ ] T5.2.2 — Verify current time within join window (15 min before start → 15 min after start)
  - [ ] T5.2.3 — Outside window → return 403 `OUTSIDE_WINDOW`
  - [ ] T5.2.4 — Generate JWT via `livekit-server-sdk` AccessToken with `identity=user_id`, `room=booking-${id}`, `videoGrants={room, roomJoin, canPublish, canSubscribe}`
  - [ ] T5.2.5 — Token expires at `endTime + 30min`
  - [ ] T5.2.6 — Return `{token, url, room}`
  - [ ] T5.2.7 — Webhook `/api/webhooks/livekit/route.ts` — capture `room_started`, `participant_joined`, `participant_left`, `room_finished`
  - [ ] T5.2.8 — Persist join events to `BookingSessionEvent` table (for no-show attribution)
- **Acceptance**: In-window join works; outside window returns 403; events logged.

#### T5.3: Pre-session waiting room

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T5.2
- **Description**: Pre-call device check + waiting state.
- **Atomic tasks**:
  - [ ] T5.3.1 — Build `/session/[bookingId]/page.tsx` route
  - [ ] T5.3.2 — Show countdown / "Available in X min" if before window
  - [ ] T5.3.3 — Show "Join session" button when within window
  - [ ] T5.3.4 — Pre-call screen: camera preview via `navigator.mediaDevices.getUserMedia`
  - [ ] T5.3.5 — Mic preview with audio level meter
  - [ ] T5.3.6 — Device selector dropdowns (camera, mic, speakers)
  - [ ] T5.3.7 — Permission-denied state: actionable error with browser-specific instructions
  - [ ] T5.3.8 — No-camera state: "Continue with audio only" option
  - [ ] T5.3.9 — Network speed indicator (optional)
  - [ ] T5.3.10 — "Join" CTA → connects to LiveKit room
  - [ ] T5.3.11 — Waiting state UI: "Waiting for tutor / user to join..." spinner
- **Acceptance**: All permission/device states have actionable UI; user understands what's wrong.

#### T5.4: In-call UI

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T5.3
- **Description**: In-call UX built on LiveKit React components.
- **Atomic tasks**:
  - [ ] T5.4.1 — Build `InCallRoom` with `LiveKitRoom` wrapper from `@livekit/components-react`
  - [ ] T5.4.2 — Layout: peer video full-bleed, self-view PiP bottom-right (draggable)
  - [ ] T5.4.3 — Top bar (translucent): peer name + remaining time countdown + connection quality
  - [ ] T5.4.4 — Bottom control bar (centered, translucent): mic, camera, screen share, chat, files, end-call
  - [ ] T5.4.5 — Mic toggle button with state indicator
  - [ ] T5.4.6 — Camera toggle button
  - [ ] T5.4.7 — Side panel for chat (T5.6) + files (T5.7) — slide-from-right
  - [ ] T5.4.8 — Mobile: full-bleed video, swipeable panels, fullscreen self-view toggle
  - [ ] T5.4.9 — Connection quality indicator (excellent/good/poor) — uses LiveKit metrics
  - [ ] T5.4.10 — Auto-hide controls after 3s idle on desktop (mouse-move shows again)
  - [ ] T5.4.11 — Test on: Chrome desktop + Android, Safari mac + iOS, Firefox desktop
- **Acceptance**: All controls work across all browsers; mobile UX clean.

#### T5.5: Screen sharing

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T5.4
- **Description**: Screen share toggle using LiveKit primitives.
- **Atomic tasks**:
  - [ ] T5.5.1 — Add screen-share toggle button to control bar
  - [ ] T5.5.2 — Use `useLocalParticipant().localParticipant.setScreenShareEnabled()`
  - [ ] T5.5.3 — When peer starts sharing, swap layout: share = main, peer-camera = PiP
  - [ ] T5.5.4 — Test mobile Safari quirks (limited screen share on iOS)
- **Acceptance**: Screen share works both directions on desktop; documented mobile limitations.

#### T5.6: In-call chat

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T5.4
- **Description**: Chat via LiveKit data channels + persistence.
- **Atomic tasks**:
  - [ ] T5.6.1 — Build `ChatPanel` UI: thread + input + send button
  - [ ] T5.6.2 — Subscribe to `room.on('dataReceived')` events
  - [ ] T5.6.3 — Send: `room.localParticipant.publishData(JSON.stringify({type:'chat', body, ts}))` via reliable channel
  - [ ] T5.6.4 — Buffer messages locally during call
  - [ ] T5.6.5 — On call end → persist buffer to DB as `Message` rows (linked to booking)
  - [ ] T5.6.6 — Transcript viewable on Booking Detail post-session (T6.3)
  - [ ] T5.6.7 — Unread indicator on closed chat panel
- **Acceptance**: Messages real-time; transcript persists.

#### T5.7: In-call file sharing

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T5.4
- **Description**: File upload to R2 + broadcast link.
- **Atomic tasks**:
  - [ ] T5.7.1 — Build file-picker UI in side panel
  - [ ] T5.7.2 — Server action `requestFileUploadUrl({bookingId})` — returns presigned R2 URL
  - [ ] T5.7.3 — Validation: ≤ 25MB, common types (PDF, images, docs)
  - [ ] T5.7.4 — Upload with progress bar
  - [ ] T5.7.5 — On upload success → save `BookingFile` row + broadcast metadata via data channel
  - [ ] T5.7.6 — Other party sees notification + download link
  - [ ] T5.7.7 — File persists; visible on Booking Detail post-session
- **Acceptance**: PDF + image upload/download work; files persist.

#### T5.8: Post-session flow

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T5.4
- **Description**: Mark COMPLETED, prompt review, queue payout.
- **Atomic tasks**:
  - [ ] T5.8.1 — On `endCall` button OR LiveKit `room_finished` webhook → close room
  - [ ] T5.8.2 — Server logic: if booking has join events and end is past scheduled end+5min grace → status=COMPLETED
  - [ ] T5.8.3 — Build post-session screen for user: 1–5 star rating + optional textarea + "Submit review" / "Skip"
  - [ ] T5.8.4 — Build post-session screen for tutor: "Session ended" + private note field for tutor's own records
  - [ ] T5.8.5 — Server action `submitReview({bookingId, rating, comment})` — insert Review row
  - [ ] T5.8.6 — Update Tutor aggregate rating (denormalized field for cards)
  - [ ] T5.8.7 — Mark Transaction as payout-eligible (no state change, but `weekly_batch_eligible_at` field set)
  - [ ] T5.8.8 — Persist chat transcript + file list to booking record (link to T5.6/T5.7)
- **Acceptance**: Review persists; rating updates; payout queue includes booking.

#### T5.9: No-show handling

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T5.2
- **Description**: Cron-based no-show detection with attribution.
- **Atomic tasks**:
  - [ ] T5.9.1 — Vercel Cron `*/15 * * * *` → `/api/cron/mark-no-shows`
  - [ ] T5.9.2 — Logic: find bookings with `endTime + 30min < NOW()` and status=PAID/CONFIRMED
  - [ ] T5.9.3 — Query LiveKit join events (from BookingSessionEvent table)
  - [ ] T5.9.4 — Case: both joined → status=COMPLETED (handled in T5.8 fallback)
  - [ ] T5.9.5 — Case: only user joined → status=NO_SHOW, attribution=TUTOR, full refund + strike (T4.9 path)
  - [ ] T5.9.6 — Case: only tutor joined → status=NO_SHOW, attribution=USER, tutor still paid
  - [ ] T5.9.7 — Case: neither joined → status=NO_SHOW, attribution=BOTH (treat as user no-show — tutor not paid since session didn't happen; admin can override)
  - [ ] T5.9.8 — Email both parties with attribution outcome
- **Acceptance**: 4 cases handled correctly per test scenarios.

#### T5.10: Phase 5 tests

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T5.1–T5.9
- **Description**: Cover video room with mocks.
- **Atomic tasks**:
  - [ ] T5.10.1 — Unit: JWT token has correct identity, room, grants, expiry
  - [ ] T5.10.2 — Integration: token request 30min before window → 403
  - [ ] T5.10.3 — Integration: token request 30min after window → 403
  - [ ] T5.10.4 — Integration: token request from non-party user → 403
  - [ ] T5.10.5 — Integration: no-show — both joined → COMPLETED
  - [ ] T5.10.6 — Integration: no-show — only user → NO_SHOW + tutor strike
  - [ ] T5.10.7 — Integration: no-show — only tutor → NO_SHOW + user side
  - [ ] T5.10.8 — Integration: no-show — neither → NO_SHOW with admin flag
  - [ ] T5.10.9 — E2E (mocked LiveKit): join → both present → end → review prompt
  - [ ] T5.10.10 — A11y: pre-session waiting room + post-session review
- **Acceptance**: All tests pass; reusable mock LiveKit harness.

---

### Phase 5 Gate (must pass before Phase 6)

**Automated:**
- [ ] All Phase 5 tests green
- [ ] Token-window enforcement tested

**Manual — real LiveKit room with 2 humans:**
- [ ] Person A (Mac, Chrome, Wi-Fi) + Person B (Android, Chrome, mobile data) — both join → see each other's video and hear audio
- [ ] Test screen share both directions
- [ ] Test in-call chat — messages appear in real-time on both sides
- [ ] Test file share — upload PDF on side A, side B sees download link, file opens
- [ ] Test mic toggle, camera toggle — peer sees the change
- [ ] Test connection-quality indicator: throttle network on B → A sees "poor connection" badge
- [ ] Test "end call" → both parties land on post-session screen → review form appears for user
- [ ] Test browser-permission-denied state — user gets actionable error, not silent fail
- [ ] Test no-camera device (laptop with camera covered) — graceful fallback to audio-only

**Manual — cross-browser:**
- [ ] Chrome (desktop + Android), Safari (macOS + iOS), Firefox (desktop)
- [ ] iOS Safari is the riskiest — verify camera/mic permission flow works

**Exit criteria:** Two humans on two networks complete a real 5-minute session including all features. Recording of this test stored in `docs/qa/phase-5-evidence/`.

---

### Phase 6 — Dashboards & messaging

**Goal:** Both users and tutors have a daily-driver dashboard. They can message each other 1-on-1 between bookings.
**Estimate:** 2.5 weeks (100h) including T6.10 tests + Phase 6 Gate.

#### T6.1: User main dashboard

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T1.6
- **Description**: Grid of widgets per Figma.
- **Atomic tasks**:
  - [ ] T6.1.1 — Build `UpcomingBookingWidget` — large card, next booking with join-now state if within 15 min
  - [ ] T6.1.2 — Build `RecentBookingsWidget` — last 3 bookings (compact rows)
  - [ ] T6.1.3 — Build `RecentPaymentsWidget` — last 3 transactions
  - [ ] T6.1.4 — Build `SupportTicketsWidget` — open tickets count
  - [ ] T6.1.5 — Build `SavedTutorsWidget` (placeholder for v2; show empty state)
  - [ ] T6.1.6 — Build `StatsWidget` — total consultations, total spent
  - [ ] T6.1.7 — Each widget uses `Suspense` + skeleton fallback for independent loading
  - [ ] T6.1.8 — Empty states: "No upcoming consultations" with CTA to browse tutors
  - [ ] T6.1.9 — Lighthouse check: TTI < 500ms
- **Acceptance**: Dashboard loads quickly with lazy widgets; matches Figma.

#### T6.2: User consultations page

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T6.1
- **Description**: Full booking list with tabs + filters.
- **Atomic tasks**:
  - [ ] T6.2.1 — Build tabs nav: Upcoming, Completed, Cancelled
  - [ ] T6.2.2 — Build `BookingRow` component (tutor avatar+name, title, date/time, status badge, primary action)
  - [ ] T6.2.3 — Status badges: color-coded per status (PENDING yellow, PAID blue, COMPLETED green, CANCELLED gray, NO_SHOW red)
  - [ ] T6.2.4 — Primary action varies by status: Join (within window), Review (post-session, no review yet), Cancel (eligible), Re-book (completed/cancelled)
  - [ ] T6.2.5 — Date-range filter
  - [ ] T6.2.6 — Pagination
  - [ ] T6.2.7 — Empty states per tab
- **Acceptance**: All filters + actions work per spec; clicking row opens T6.3.

#### T6.3: Booking detail page (user view)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T6.2
- **Description**: Single booking comprehensive view.
- **Atomic tasks**:
  - [ ] T6.3.1 — Build `/dashboard/bookings/[id]/page.tsx`
  - [ ] T6.3.2 — Section: Booking info card (tutor, consultation, datetime, status, location=video)
  - [ ] T6.3.3 — Section: Payment receipt (amount paid, payment method, transaction ID, date)
  - [ ] T6.3.4 — Section: Refund policy (collapsible)
  - [ ] T6.3.5 — Section: Files shared (post-session) — list with download
  - [ ] T6.3.6 — Section: Chat transcript (post-session) — read-only
  - [ ] T6.3.7 — Section: Review form (if eligible) — stars + text → triggers T5.8 review submission
  - [ ] T6.3.8 — Action: Cancel button (if within policy)
  - [ ] T6.3.9 — Action: Join Session button (if within join window)
  - [ ] T6.3.10 — Action: Re-book button (post-session)
  - [ ] T6.3.11 — Chat panel toggle (post-PAID, pre-30day-archive — links to T6.8)
- **Acceptance**: Every booking state renders correct UI + actions.

#### T6.4: User profile settings

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T1.3
- **Description**: User account self-management.
- **Atomic tasks**:
  - [ ] T6.4.1 — Build settings layout: Profile / Security / Privacy tabs
  - [ ] T6.4.2 — Profile tab: edit name, phone, DOB; avatar upload (reuse T3.2 R2 helper for square 200×200)
  - [ ] T6.4.3 — Security tab: change email (sends verify to new + notify old) flow
  - [ ] T6.4.4 — Security tab: change password (require current password)
  - [ ] T6.4.5 — Privacy tab: delete account button (confirm via password) — soft-delete user, anonymize displayed info, keep bookings for tutor history
  - [ ] T6.4.6 — Privacy tab: download my data (GDPR-style, optional v1)
- **Acceptance**: Email change requires double verification; soft-delete retains FK integrity.

#### T6.5: User payments / transactions page

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T6.4
- **Description**: Transaction history + receipts + refund requests.
- **Atomic tasks**:
  - [ ] T6.5.1 — Build `/dashboard/payments/page.tsx` with table
  - [ ] T6.5.2 — Columns: date, booking link, tutor, amount, status badge, action
  - [ ] T6.5.3 — Filters: date range, status, provider
  - [ ] T6.5.4 — Install `pnpm add @react-pdf/renderer` for server-side PDF
  - [ ] T6.5.5 — Build `ReceiptPdf.tsx` template (booking summary, tutor info, GEL amount, tax line if applicable)
  - [ ] T6.5.6 — Server action `generateReceiptPdf({transactionId})` — returns PDF stream
  - [ ] T6.5.7 — "Download receipt" link per row
  - [ ] T6.5.8 — "Request refund" link if booking within policy window → opens SupportTicket flow
- **Acceptance**: Receipt PDFs valid; refund request creates ticket.

#### T6.6: Tutor dashboard + analytics

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T1.6, T1.1
- **Description**: Tutor analytics + earnings + activity.
- **Atomic tasks**:
  - [ ] T6.6.1 — Build `EarningsCard` (this month, last month, lifetime held, lifetime released)
  - [ ] T6.6.2 — Server fetcher with SQL aggregation
  - [ ] T6.6.3 — Build `BookingsByStatusChart` — pie/bar chart (recharts)
  - [ ] T6.6.4 — Install `pnpm add recharts`
  - [ ] T6.6.5 — Build `ConversionWidget` — profile views (track per visit) / bookings
  - [ ] T6.6.6 — Track profile views: log on `/tutors/[slug]` SSR (rate-limited per IP, sampled)
  - [ ] T6.6.7 — Build `UpcomingConsultationsWidget`
  - [ ] T6.6.8 — Build `TopConsultationsWidget` — most-booked offerings
  - [ ] T6.6.9 — Build `PayoutScheduleWidget` — next payout date + amount
  - [ ] T6.6.10 — Mobile: stacked, swipeable charts
- **Acceptance**: Numbers match SQL ground-truth (T6.10 verifies).

#### T6.7: Tutor consultations management

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T3.6
- **Description**: Extends T3.6 with per-consultation bookings view.
- **Atomic tasks**:
  - [ ] T6.7.1 — Add "View bookings" button on each consultation row
  - [ ] T6.7.2 — Build `/tutor/consultations/[id]/bookings/page.tsx` — paginated table
  - [ ] T6.7.3 — Filters: status, date range
  - [ ] T6.7.4 — Show per-row: user (name/avatar), datetime, status, earnings amount, action (cancel if upcoming)
- **Acceptance**: All bookings for that offering visible.

#### T6.8: 1-on-1 chat (user ↔ tutor)

- [ ] **Status**: TODO
- **Complexity**: L
- **Dependencies**: T6.3
- **Description**: Per-booking real-time chat thread.
- **Atomic tasks**:
  - [ ] T6.8.1 — Sign up for Pusher Channels; create app
  - [ ] T6.8.2 — Add env: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`
  - [ ] T6.8.3 — Install `pnpm add pusher pusher-js`
  - [ ] T6.8.4 — Server: `pusher.trigger(\`booking-${id}\`, 'new-message', payload)`
  - [ ] T6.8.5 — Client: subscribe to channel via private auth endpoint
  - [ ] T6.8.6 — Auth endpoint `/api/pusher/auth` — verify user is party to booking
  - [ ] T6.8.7 — Build `ChatThread` component with message bubbles, sender side, timestamps
  - [ ] T6.8.8 — Message input + send action — saves to DB + triggers Pusher event
  - [ ] T6.8.9 — Read receipts: server action `markRead`, update Message.readAt; render double-check (read) vs single-check (delivered)
  - [ ] T6.8.10 — File attachment (≤ 10MB) via R2 presigned URL
  - [ ] T6.8.11 — Available only when booking.status=PAID (or COMPLETED < 30 days for read-only)
  - [ ] T6.8.12 — Cron `0 3 * * *` — archive chats older than 30 days post-completion
  - [ ] T6.8.13 — Offline-sent messages: client retry with exponential backoff
- **Acceptance**: Real-time delivery < 1s; messages persist; offline retry works.

#### T6.9: Support chat (user → platform)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T1.6
- **Description**: Floating support widget linking to admin ticket system.
- **Atomic tasks**:
  - [ ] T6.9.1 — Build `SupportWidget` floating button (bottom-right) shared across dashboard + tutor layout
  - [ ] T6.9.2 — Clicking opens panel with: existing tickets list + "New ticket" form
  - [ ] T6.9.3 — New ticket form: subject (select), priority (low/medium/high), message
  - [ ] T6.9.4 — Server action `createSupportTicket({...})` — creates SupportTicket + first SupportMessage
  - [ ] T6.9.5 — Email admin: "New support ticket: <subject>"
  - [ ] T6.9.6 — Ticket detail view: thread of messages, status badge, reply field
  - [ ] T6.9.7 — When admin replies, user gets email + in-app notification badge
  - [ ] T6.9.8 — Status transitions: OPEN → IN_PROGRESS (admin replies) → RESOLVED (admin marks) → CLOSED (user accepts)
- **Acceptance**: Ticket flow works both ways; admin email + user notifications fire.

#### T6.10: Phase 6 tests

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T6.1–T6.9
- **Description**: Test dashboards + chat with real-time.
- **Atomic tasks**:
  - [ ] T6.10.1 — Unit: tutor analytics aggregations match raw SQL output (fixture-based)
  - [ ] T6.10.2 — Integration: chat message persists, readAt updates
  - [ ] T6.10.3 — Integration: chat archive cron archives > 30 days
  - [ ] T6.10.4 — Integration: support ticket creation + admin notification
  - [ ] T6.10.5 — Component: dashboard widgets empty/loading/error states
  - [ ] T6.10.6 — Component: ChatThread renders bubbles correctly with sender attribution
  - [ ] T6.10.7 — E2E: dashboard → upcoming booking → cancel → CANCELLED state visible
  - [ ] T6.10.8 — E2E: chat — open in 2 browser windows, send → other sees within 2s
  - [ ] T6.10.9 — A11y: user dashboard, tutor dashboard, chat panel, support widget
- **Acceptance**: All tests pass; real-time chat E2E stable across 10 runs.

---

### Phase 6 Gate (must pass before Phase 7)

**Automated:**
- [ ] All Phase 6 tests green
- [ ] Real-time delivery < 1s in E2E test

**Manual:**
- [ ] User dashboard loads in < 500ms (use Chrome DevTools)
- [ ] Tutor dashboard: numbers match what you can compute from Prisma Studio manually
- [ ] Send chat message, refresh recipient's page → message persists
- [ ] Send chat message while recipient offline → recipient sees it on next page load + (if Pusher present subscription) gets in-app notification
- [ ] Try to chat before booking PAID → chat unavailable, message says "available after payment"
- [ ] Test on mobile — bottom nav bar visible and functional, sidebar collapses correctly
- [ ] Force-refresh dashboard during loading → graceful state, no spinner stuck
- [ ] Edit user profile → save → see updated info on tutor's view of booking detail

**Exit criteria:** Both user and tutor can self-serve all daily-driver actions without contacting support.

---

### Phase 7 — Admin panel

**Goal:** Solo admin can run the platform: review tutors, resolve disputes, manage payouts, see system health.
**Estimate:** 1.5 weeks (60h) including T7.10 tests + Phase 7 Gate.

#### T7.1: Admin login + role enforcement

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T1.5
- **Description**: Admin auth with mandatory TOTP 2FA.
- **Atomic tasks**:
  - [ ] T7.1.1 — Install `pnpm add otpauth`
  - [ ] T7.1.2 — Add fields to User: `totpSecret` (encrypted), `totpEnabled`
  - [ ] T7.1.3 — Build admin onboarding script `scripts/create-admin.ts` — interactive, generates TOTP secret + QR code
  - [ ] T7.1.4 — Build `/admin/login` 2-step: email/password → TOTP code
  - [ ] T7.1.5 — Auth.js extension: require TOTP for ADMIN role
  - [ ] T7.1.6 — Brute-force protection: 5 failed TOTP attempts → lockout 15 min
  - [ ] T7.1.7 — Recovery codes (10 single-use) issued at TOTP setup
  - [ ] T7.1.8 — Non-admin gets 404 on `/admin/*` (don't reveal existence)
- **Acceptance**: Admin must enter TOTP; non-admin gets 404.

#### T7.2: Tutor approval queue

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T7.1, T3.1
- **Description**: Approve/reject pending tutors.
- **Atomic tasks**:
  - [ ] T7.2.1 — Build `/admin/tutors/pending/page.tsx` — list cards
  - [ ] T7.2.2 — Each card shows: photo, name, headline, submitted date, "Review" button
  - [ ] T7.2.3 — `/admin/tutors/[id]/page.tsx` — full preview as it'll appear publicly
  - [ ] T7.2.4 — Photo review against §1.5 criteria (visual reference panel)
  - [ ] T7.2.5 — Skills/cert/education review against fraud markers
  - [ ] T7.2.6 — Approve button → status=APPROVED, trigger ISR revalidate
  - [ ] T7.2.7 — Reject modal: dropdown of preset reasons + optional free-text + Send
  - [ ] T7.2.8 — Email tutor with decision + reasons (if rejected)
  - [ ] T7.2.9 — Log decision to AdminLog
- **Acceptance**: Both flows complete; emails arrive; ISR makes approved tutor public.

#### T7.3: User management

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T7.1
- **Description**: Admin user CRUD-lite + suspension.
- **Atomic tasks**:
  - [ ] T7.3.1 — Build `/admin/users/page.tsx` with table + search (email, name, phone)
  - [ ] T7.3.2 — Pagination
  - [ ] T7.3.3 — User detail page `/admin/users/[id]` — profile + bookings + transactions + tickets tabs
  - [ ] T7.3.4 — Suspend button → sets `suspended=true`; modal asks reason
  - [ ] T7.3.5 — Unsuspend button (admins only)
  - [ ] T7.3.6 — Force-logout button → deletes all Session rows for user; effect within 30s (NextAuth checks DB session)
  - [ ] T7.3.7 — Log every action to AdminLog
- **Acceptance**: Suspend works (login blocked); force-logout effective < 30s.

#### T7.4: Booking / transaction overview

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T7.1
- **Description**: Admin view of all bookings + transactions.
- **Atomic tasks**:
  - [ ] T7.4.1 — `/admin/bookings/page.tsx` with table + filters (status, date range, tutor, user)
  - [ ] T7.4.2 — Drill-down to booking detail with full audit info (parties, payment, chat transcript, files)
  - [ ] T7.4.3 — "Export CSV" button — generates CSV server-side, streams response
  - [ ] T7.4.4 — Include refund history per booking
  - [ ] T7.4.5 — Read-only access to chat transcript (admin audit privilege)
- **Acceptance**: CSV valid; drill-down shows complete info.

#### T7.5: Refund / dispute management

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T4.8
- **Description**: Admin reviews refund requests + disputes.
- **Atomic tasks**:
  - [ ] T7.5.1 — `/admin/refunds/page.tsx` — queue of refund tickets
  - [ ] T7.5.2 — Per-row: user, tutor, booking, amount, reason, attached evidence (chat snippets)
  - [ ] T7.5.3 — Action panel: Approve full / Approve partial (amount input) / Deny (reason)
  - [ ] T7.5.4 — Approve → call TBC/BOG refund API + update Transaction
  - [ ] T7.5.5 — Email user (refund issued) + email tutor (refund deducted)
  - [ ] T7.5.6 — If denied → ticket marked RESOLVED with reason
  - [ ] T7.5.7 — Log decision to AdminLog
- **Acceptance**: Sandbox refund completes; all parties notified.

#### T7.6: Payout management

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T7.1, T5.8
- **Description**: Weekly payout batch via admin manual review.
- **Atomic tasks**:
  - [ ] T7.6.1 — `/admin/payouts/page.tsx` — group HELD transactions by tutor
  - [ ] T7.6.2 — Per-tutor summary: total amount, # of sessions, IBAN, payout reference
  - [ ] T7.6.3 — Export selected tutors to CSV (for batch bank upload)
  - [ ] T7.6.4 — "Mark as released" button (after admin sent the money via banking)
  - [ ] T7.6.5 — Action: set Transaction.payout_status=RELEASED + Transaction.releasedAt
  - [ ] T7.6.6 — Email tutor: "Payout of X GEL has been released; should arrive in 1–2 days"
  - [ ] T7.6.7 — Filter: by tutor, by date range
  - [ ] T7.6.8 — Audit log every release action
- **Acceptance**: Status flips correctly; email arrives; CSV exports clean.

#### T7.7: Category management

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T7.1
- **Description**: Admin CRUD for categories.
- **Atomic tasks**:
  - [ ] T7.7.1 — `/admin/categories/page.tsx` — table + reorder via drag
  - [ ] T7.7.2 — Add modal: name, slug (auto-generated), description, icon (Lucide picker), sortOrder
  - [ ] T7.7.3 — Edit modal
  - [ ] T7.7.4 — Soft-delete (`archived` flag); prevent if tutors use it (or reassign)
  - [ ] T7.7.5 — Trigger ISR revalidation on `/category/[slug]` + `/tutors`
- **Acceptance**: New category appears immediately on public site.

#### T7.8: FAQ management

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T2.6
- **Description**: MDX-based — no admin UI in v1.
- **Atomic tasks**:
  - [ ] T7.8.1 — Document workflow in `docs/runbook/faq-edit.md`: edit `content/faq.mdx` → commit + push → Vercel rebuild
  - [ ] T7.8.2 — Add admin-help section in admin sidebar linking to GitHub repo
- **Acceptance**: Documented workflow allows admin to update FAQ via PR (or admin edits markdown then dev merges).

#### T7.9: Audit log viewer

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T7.1
- **Description**: Read-only audit trail.
- **Atomic tasks**:
  - [ ] T7.9.1 — Define `AdminLog` table actions enum: TUTOR_APPROVED, TUTOR_REJECTED, USER_SUSPENDED, USER_UNSUSPENDED, REFUND_APPROVED, REFUND_DENIED, PAYOUT_RELEASED, CATEGORY_CREATED, etc
  - [ ] T7.9.2 — Helper `logAdminAction({adminId, action, targetType, targetId, details})`
  - [ ] T7.9.3 — Inject helper into every Phase 7 action
  - [ ] T7.9.4 — Build `/admin/audit/page.tsx` — paginated table with filters (admin, action, date range)
  - [ ] T7.9.5 — Drill-down to `details` JSON viewer
- **Acceptance**: Every Phase 7 action produces a log entry.

#### T7.10: Phase 7 tests

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: T7.1–T7.9
- **Description**: Cover admin workflows.
- **Atomic tasks**:
  - [ ] T7.10.1 — Unit: TOTP code verify — correct codes pass
  - [ ] T7.10.2 — Unit: TOTP off-by-one window edge cases
  - [ ] T7.10.3 — Unit: TOTP replay rejected (track used codes)
  - [ ] T7.10.4 — Integration: approve tutor writes AdminLog
  - [ ] T7.10.5 — Integration: force-logout deletes Session rows
  - [ ] T7.10.6 — Integration: CSV export contains all rows
  - [ ] T7.10.7 — Integration: refund propagates to Transaction.payout_status
  - [ ] T7.10.8 — E2E: admin login with TOTP → approve pending tutor → public listing reflects
  - [ ] T7.10.9 — E2E: admin refunds sandbox booking → state propagates
  - [ ] T7.10.10 — A11y: admin tutor queue, user management, payout view
- **Acceptance**: All audit-log entries fire; force-logout < 30s.

---

### Phase 7 Gate (must pass before Phase 8)

**Automated:**
- [ ] All Phase 7 tests green
- [ ] AdminLog has entries for every sensitive action in test runs

**Manual:**
- [ ] Login as admin with TOTP (use Google Authenticator) → must enter valid code to access
- [ ] Approve a pending tutor → tutor receives email, profile becomes public
- [ ] Reject a pending tutor with reason → tutor receives email with reason, can resubmit after edit
- [ ] Suspend a user → user cannot log in until unsuspended
- [ ] Process a refund via admin → TBC sandbox shows refund, user gets refund email, transaction state correct
- [ ] Mark payouts released for last week's batch → tutor sees "released" status, gets email
- [ ] Add a new category → it appears in tutor onboarding category picker and on `/category/[slug]` route
- [ ] Audit log shows every action I just did with correct admin ID, timestamp, target entity

**Exit criteria:** You can run the platform daily for a week using only the admin panel — no DB shell access needed.

---

### Phase 8 — Polish, performance, accessibility, launch

**Goal:** Cross-cutting cleanup. Ship to production. Real Georgian users find and book a real tutor.
**Estimate:** 1.5 weeks (60h). The Pre-Launch Gate at the end **is** the test work — no separate test task.

#### T8.1: Lighthouse + Core Web Vitals pass

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: All Phase 2 tasks
- **Description**: Performance + a11y final polish.
- **Atomic tasks**:
  - [ ] T8.1.1 — Install Lighthouse CI as GitHub action
  - [ ] T8.1.2 — Configure `lighthouserc.json` with budgets per route
  - [ ] T8.1.3 — Run audit; fix any failures
  - [ ] T8.1.4 — Image optimization audit (all use `next/image`, correct sizes)
  - [ ] T8.1.5 — Font preloading verification (Noto Sans Georgian top of head)
  - [ ] T8.1.6 — Remove unused CSS audit (uncss / size-limit)
  - [ ] T8.1.7 — Tree-shake unused JS — check bundle analyzer
  - [ ] T8.1.8 — Defer non-critical scripts
  - [ ] T8.1.9 — Add `<link rel="preconnect">` for external origins (Resend, R2, LiveKit, Pusher)
  - [ ] T8.1.10 — Verify CLS < 0.1 (image dimensions, font fallback metrics)
- **Acceptance**: All routes meet mobile budgets; PR blocked if regression.

#### T8.2: Accessibility (WCAG 2.1 AA)

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: All Phase 1–6 tasks
- **Description**: Manual + automated a11y pass.
- **Atomic tasks**:
  - [ ] T8.2.1 — Keyboard nav on every page (Tab order matches visual)
  - [ ] T8.2.2 — Add skip-to-content link
  - [ ] T8.2.3 — Focus visible on every interactive element
  - [ ] T8.2.4 — Screen reader labels: icon buttons, decorative SVGs
  - [ ] T8.2.5 — Color contrast ≥ 4.5:1 audit (use Chrome devtools)
  - [ ] T8.2.6 — Form labels association via `htmlFor`
  - [ ] T8.2.7 — Error messages linked via `aria-describedby`
  - [ ] T8.2.8 — Live region announcements (chat, toast)
  - [ ] T8.2.9 — Touch target sizes ≥ 44pt on mobile
  - [ ] T8.2.10 — Heading hierarchy validation (h1 once per page, no skip)
  - [ ] T8.2.11 — Run axe-core full scan on every key page → 0 violations
- **Acceptance**: axe-core = 0 critical violations site-wide.

#### T8.3: Mobile pass on real device

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: All Phase 2–6 tasks
- **Description**: Real-device test on iOS + Android.
- **Atomic tasks**:
  - [ ] T8.3.1 — Borrow / acquire mid-range iPhone (iPhone 12-ish)
  - [ ] T8.3.2 — Borrow / acquire mid-range Android (Samsung A-series)
  - [ ] T8.3.3 — Test full booking on iPhone Safari
  - [ ] T8.3.4 — Test video session on iPhone Safari
  - [ ] T8.3.5 — Test on Android Chrome
  - [ ] T8.3.6 — Document bugs in `docs/qa/mobile-bugs.md`
  - [ ] T8.3.7 — Fix touch target sizes
  - [ ] T8.3.8 — Fix scroll issues (rubber-banding, momentum)
  - [ ] T8.3.9 — Fix safe-area-inset (notch, home indicator)
  - [ ] T8.3.10 — Test pull-to-refresh
  - [ ] T8.3.11 — Test slow 3G via WiFi-throttle
- **Acceptance**: Full flows work end-to-end on both real devices.

#### T8.4: Load testing

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: Phase 4–6
- **Description**: k6 load scenarios against staging.
- **Atomic tasks**:
  - [ ] T8.4.1 — Install k6 locally
  - [ ] T8.4.2 — Create scenario A: 100 concurrent users browsing homepage + tutor listing + profile
  - [ ] T8.4.3 — Create scenario B: 20 concurrent bookings (mock acquirer)
  - [ ] T8.4.4 — Create scenario C: 50 simultaneous LiveKit token requests
  - [ ] T8.4.5 — Run against staging environment
  - [ ] T8.4.6 — Measure p50, p95, p99 latencies per endpoint
  - [ ] T8.4.7 — Compare against §2 targets — fix degradations
  - [ ] T8.4.8 — Identify bottlenecks (DB indices, N+1 queries, Neon connection pool)
  - [ ] T8.4.9 — Generate report → `docs/qa/load-test-results.md`
- **Acceptance**: All §2 targets met at 1.5× expected v1 scale.

#### T8.5: Security review

- [ ] **Status**: TODO
- **Complexity**: M
- **Dependencies**: All
- **Description**: Internal + external security audit.
- **Atomic tasks**:
  - [ ] T8.5.1 — Run `security-audit` skill on the branch
  - [ ] T8.5.2 — Verify no secrets in client bundle (`grep` for API keys in `.next/static`)
  - [ ] T8.5.3 — Verify CSRF protection on all mutations (Next.js Server Actions auto-protect, but check route handlers)
  - [ ] T8.5.4 — Rate limit auth endpoints, booking creation, payment webhooks
  - [ ] T8.5.5 — Install `pnpm add @upstash/ratelimit @upstash/redis` for rate limit storage
  - [ ] T8.5.6 — Verify webhook signature checks on all webhooks
  - [ ] T8.5.7 — Audit `dangerouslySetInnerHTML` usage (FAQ MDX is the only one, sanitize)
  - [ ] T8.5.8 — Verify file upload mime-type whitelist + max size
  - [ ] T8.5.9 — Verify R2 signed URL expiry ≤ 15 min
  - [ ] T8.5.10 — Verify IBAN + ID document encrypted at rest
  - [ ] T8.5.11 — `pnpm audit` — fix all high/critical
  - [ ] T8.5.12 — Snyk dashboard review
  - [ ] T8.5.13 — Find external pentester (Upwork search, ~200–500 USD budget for basic test)
  - [ ] T8.5.14 — Send scope to pentester (auth, booking, payment, file upload, video room)
  - [ ] T8.5.15 — Resolve all findings
- **Acceptance**: 0 high/critical issues; pentest report stored in `docs/qa/pentest-report.md`.

#### T8.6: T&C + Privacy Policy + Refund Policy pages

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T0.9
- **Description**: Publish lawyer-approved legal docs + versioning.
- **Atomic tasks**:
  - [ ] T8.6.1 — Receive final lawyer-approved T&C, Privacy Policy, Refund Policy texts
  - [ ] T8.6.2 — Store in `content/legal/terms-v1.mdx`, `privacy-v1.mdx`, `refunds-v1.mdx`
  - [ ] T8.6.3 — Build `/legal/terms`, `/legal/privacy`, `/legal/refunds` routes
  - [ ] T8.6.4 — Link from footer + booking step 3 + signup pages
  - [ ] T8.6.5 — Implement `TosAcceptance` model — track each user + version + acceptedAt
  - [ ] T8.6.6 — At signup: require checkbox "I agree to T&C v1 + Privacy v1"
  - [ ] T8.6.7 — Version-bump flow: on next login after change, modal asks to re-accept new version
  - [ ] T8.6.8 — Index page `/legal` with links to all 3 + version history
- **Acceptance**: Acceptance logged with version + timestamp; modal triggers on version change.

#### T8.7: Production deploy

- [ ] **Status**: TODO
- **Complexity**: S
- **Dependencies**: T0.6, all phases
- **Description**: Production cutover.
- **Atomic tasks**:
  - [ ] T8.7.1 — Receive TBC production credentials (after merchant onboarding fully complete)
  - [ ] T8.7.2 — Receive BOG production credentials
  - [ ] T8.7.3 — Verify production webhook URLs registered in TBC + BOG portals
  - [ ] T8.7.4 — Switch Vercel env vars from sandbox to production (TBC, BOG, LiveKit, Resend)
  - [ ] T8.7.5 — Run Neon point-in-time-restore drill (verify backup works)
  - [ ] T8.7.6 — Run final Prisma migration on prod branch
  - [ ] T8.7.7 — Seed prod with: 10–15 categories, admin user, T&C v1
  - [ ] T8.7.8 — DNS verification (A/AAAA, MX, SPF, DKIM, DMARC)
  - [ ] T8.7.9 — Smoke test on prod: signup → email verify → book → pay (1 GEL real) → join video → review → refund
  - [ ] T8.7.10 — Verify Sentry production errors flow correctly
  - [ ] T8.7.11 — Write incident runbook (`docs/runbook/incidents.md`)
  - [ ] T8.7.12 — Write backup/restore runbook (`docs/runbook/backup-restore.md`)
  - [ ] T8.7.13 — Set up uptime monitor (BetterStack / UptimeRobot free tier)
- **Acceptance**: 1 GEL real payment + refund both work on production.

#### T8.8: Initial tutor outreach

- [ ] **Status**: TODO
- **Complexity**: M (non-coding)
- **Dependencies**: T8.7
- **Description**: Hand-recruit launch tutors.
- **Atomic tasks**:
  - [ ] T8.8.1 — Build target list: 30 candidates across categories (LinkedIn / FB / personal network)
  - [ ] T8.8.2 — Write pitch script (Georgian) — short + benefits-focused
  - [ ] T8.8.3 — Reach out to 30 candidates personally
  - [ ] T8.8.4 — Schedule 20 onboarding calls
  - [ ] T8.8.5 — Walk each through registration + profile setup
  - [ ] T8.8.6 — Review their photos against §1.5 criteria; suggest improvements
  - [ ] T8.8.7 — Help with bio + headline copy
  - [ ] T8.8.8 — Approve 10–15 tutors with polished profiles
  - [ ] T8.8.9 — Track in spreadsheet (name, category, status, follow-up date)
  - [ ] T8.8.10 — Set up weekly office hours with tutors for first 4 weeks post-launch
- **Acceptance**: 10+ approved tutors with full profiles, ready for launch day.

#### T8.9: Launch announcement

- [ ] **Status**: TODO
- **Complexity**: S (non-coding)
- **Dependencies**: T8.8
- **Description**: Public launch.
- **Atomic tasks**:
  - [ ] T8.9.1 — Draft launch post for FB / LinkedIn / Instagram (Georgian)
  - [ ] T8.9.2 — Create OG image template for social
  - [ ] T8.9.3 — Schedule posts for launch day
  - [ ] T8.9.4 — Email personal network ("we're live!") — limit list, no spam
  - [ ] T8.9.5 — Submit to Producthunt.com (English, post-launch)
  - [ ] T8.9.6 — Optional: 100 GEL Facebook ad test (interest targeting: business / education)
  - [ ] T8.9.7 — Monitor day-1 traffic in Vercel Analytics / Plausible
  - [ ] T8.9.8 — Hot-fix incident response: keep dev environment open + on-call mindset day 1
- **Acceptance**: Day-1 visitors > 50; first organic booking within week 1.

---

### Phase 8 Pre-Launch Gate (must pass before public launch)

This is the final gate. Everything must be green or explicitly waived.

**Automated:**
- [ ] All test suites green: unit, integration, component, E2E, a11y, lint, type-check, audit
- [ ] Lighthouse CI: mobile Perf ≥ 85, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 95 on homepage, tutor profile, booking modal, dashboard
- [ ] k6 load tests pass §2 targets at 1.5× expected v1 scale
- [ ] axe-core: 0 violations on every key page
- [ ] Sentry source maps uploaded; test error captures correctly with readable stack
- [ ] `pnpm audit` — 0 high/critical vulnerabilities

**Manual — payment & booking:**
- [ ] Real GEL payment of 1₾ on production TBC merchant (real card, real money) → refund processed back successfully
- [ ] Same on BOG production merchant
- [ ] Edge case: pay then cancel within 24h → refund within policy bracket arrives within 5 business days

**Manual — video:**
- [ ] Two real humans on two real networks complete a 15-minute session including all features, on production LiveKit project

**Manual — outsider UX review:**
- [ ] A non-developer (friend / family) completes a full booking on their own device without instructions. Watch silently. Note every pause / confusion. Fix the top 3.
- [ ] Same person tries to register as a tutor (different account). Note same.

**Manual — accessibility:**
- [ ] Keyboard-only navigation works on every page (Tab order matches visual order)
- [ ] iOS VoiceOver on Safari: complete a booking
- [ ] Android TalkBack on Chrome: complete a booking

**Manual — legal / content:**
- [ ] T&C, Privacy Policy, Refund Policy live, lawyer-reviewed, versioned, linked from footer + booking step 3
- [ ] Personal data inspector (Georgia) registration filed if required by lawyer
- [ ] Email deliverability: mail-tester.com score ≥ 9/10 on every transactional template

**Manual — infrastructure:**
- [ ] Production env vars: no placeholders, no dev keys
- [ ] DNS health: A/AAAA, MX (Resend), TXT (SPF, DKIM, DMARC) all green
- [ ] Backup strategy: Neon point-in-time-restore enabled; documented in `docs/runbook/backup-restore.md`
- [ ] Incident runbook written: who to contact, how to roll back, how to disable signups in emergency
- [ ] Status page (or static page) for downtime communication

**Manual — content:**
- [ ] 10+ approved tutors with polished profiles ready to go
- [ ] Each launch tutor has been onboarded with a walkthrough call
- [ ] FAQ has answers to top 10 anticipated questions
- [ ] Support email auto-replies within 1h

**Exit criteria:** Every box checked or explicitly waived with written justification in `docs/qa/launch-readiness.md`. **No waiving allowed on payment, video, or auth boxes.**

---

## 10. Post-launch backlog (v2 candidates, not in v1)

Triage after first 30 days of data:

- Session recording (with consent flow + 30-day retention)
- Calendar sync (Google Calendar two-way)
- Group sessions (1 tutor ↔ many users)
- SMS notifications (Magti API)
- Push notifications (PWA + Web Push)
- English UI (i18n second locale)
- International payments (Stripe for non-GEL cards)
- Affiliate / referral program
- Subscription pricing for tutors (premium tier)
- Verified-identity badge (integrated KYC provider)
- Recommendation engine (collaborative filtering on bookings)
- Native iOS / Android apps
- Self-hosted LiveKit (cost optimization once volume justifies)

---

## 11. Glossary

| Term | Meaning |
|---|---|
| **Tutor** | A vetted expert providing paid 1-on-1 consultations. Approved via manual review. |
| **User** | A person who books a consultation with a tutor. (Sometimes called "client" in copy.) |
| **Consultation** | A specific offering by a tutor (e.g., "30-minute career-change strategy session"). |
| **Booking** | A specific scheduled instance of a consultation between one user and one tutor. |
| **Session** | The actual video meeting that fulfills a booking. |
| **Escrow** | Funds held by the platform between user payment and tutor payout. |
| **Payout** | The portion of a booking's payment (after commission) released to the tutor. |
| **Commission** | The percentage retained by the platform from each booking. |
| **Slot** | A specific time window during which a consultation can be booked. |

---

*Last updated: 2026-05-14. Maintained by the project owner. PRs welcome.*
