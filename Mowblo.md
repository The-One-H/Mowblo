# 🌿❄️ MOWBLO — Complete Product Specification

### The Uber Eats of Outdoor Services

**Version 1.0 | React Native | iOS & Android**

---

> **On the one-app vs. two-app question:** Go with **one unified app** — exactly like Uber (driver + rider in one). Users toggle between **"I need help"** (Customer) and **"I want to earn"** (Pro/Doer) with a single switch in their profile. This reduces install friction, lets users be both (a student who mows on weekends but also hires someone for their parents' home), and dramatically cuts your marketing spend. Two separate apps only make sense at scale (think Uber's eventual UberEats split). For launch: **one app, two modes.**

---

## 🎨 Brand Identity

### Logo-Derived Color System

```
Primary Blue    #6BB8D9   — Snow/Winter mode (from logo left panel)
Primary Green   #7DC46A   — Lawn/Summer mode (from logo right panel)
White           #FFFFFF   — Icon fills, cards, CTAs
Dark            #1A2332   — Text, deep backgrounds
Accent Blue     #4A9EC4   — Active states, links (darker blue)
Accent Green    #5BAA48   — Active states, links (darker green)
Surface         #F5F8FA   — Screen backgrounds
Gray Light      #E8EDF2   — Dividers, inactive states
Gray Mid        #9AAAB8   — Placeholder text, subtitles
```

### Seasonal Theming (Killer UX Differentiator)

The app **automatically shifts its color theme** based on the active service:

* **Snow Removal selected** → Blue-dominant UI, snowflake particle animations, frost glass morphism
* **Lawn Mowing selected** → Green-dominant UI, leaf particle animations, warm earthy tones
* **Home screen** → Split diagonal gradient (exact logo split — blue left, green right)

### Typography

```
Display:   SF Pro Rounded Bold (iOS) / Nunito ExtraBold (Android)
Headlines: SF Pro Display Semibold / Nunito Bold
Body:      SF Pro Text Regular / Nunito Regular
Mono:      SF Mono / JetBrains Mono (prices, stats)
```

### Iconography

* Rounded, filled icons (matching logo's rounded snowflake arms)
* White-on-color for primary actions
* Never use sharp corners — minimum border radius: 12px

---

## 🏗️ Architecture Overview

```
mowblo/
├── app/
│   ├── (auth)/
│   │   ├── welcome.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── onboarding/
│   │       ├── role-select.tsx       ← Customer or Pro or Both
│   │       ├── location-setup.tsx
│   │       └── pro-verification.tsx  ← Pro mode only
│   ├── (customer)/
│   │   ├── home.tsx
│   │   ├── order/
│   │   │   ├── configure.tsx         ← Service builder (like cart)
│   │   │   ├── schedule.tsx
│   │   │   ├── quote.tsx
│   │   │   ├── confirm.tsx
│   │   │   └── tracking.tsx          ← Live GPS tracking
│   │   ├── history.tsx
│   │   ├── saved-addresses.tsx
│   │   └── subscription.tsx          ← Mowblo+ plans
│   ├── (pro)/
│   │   ├── dashboard.tsx
│   │   ├── jobs/
│   │   │   ├── available.tsx         ← Job feed
│   │   │   ├── active.tsx
│   │   │   └── completed.tsx
│   │   ├── earnings.tsx
│   │   ├── schedule.tsx
│   │   └── profile-pro.tsx
│   ├── (shared)/
│   │   ├── chat.tsx
│   │   ├── ratings.tsx
│   │   ├── notifications.tsx
│   │   └── settings.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/
│   │   ├── MowbloButton.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── MapTracker.tsx
│   │   ├── ProAvatar.tsx
│   │   ├── PriceBubble.tsx
│   │   ├── SeasonalHeader.tsx
│   │   └── AnimatedSnowflake.tsx / AnimatedLeaf.tsx
│   ├── order/
│   ├── pro/
│   └── modals/
├── store/                            ← Zustand
├── hooks/
├── services/                         ← API, Stripe, Firebase
├── utils/
└── constants/
    ├── theme.ts
    └── services.ts
```

### Tech Stack

```
Framework:      React Native 0.74+ with Expo SDK 51
Navigation:     Expo Router (file-based, like Next.js)
State:          Zustand + React Query (TanStack)
Maps:           react-native-maps + Google Maps SDK
Realtime:       Firebase Realtime Database (live tracking)
Payments:       Stripe React Native SDK
Push Notifs:    Expo Notifications + FCM/APNs
Auth:           Firebase Auth (email, Google, Apple)
Animations:     React Native Reanimated 3 + Lottie
Backend:        Node.js / Fastify on Railway (or Supabase)
Analytics:      Mixpanel
Crash:          Sentry
```

---

## 📱 Screen-by-Screen Specification

---

### 1. WELCOME / SPLASH SCREEN

**Visual:** Full screen with the Mowblo logo animated in — the snowflake flies in from the left while the leaf flies in from the right, meeting in the center. Background: diagonal split (blue top-left, green bottom-right).

**Elements:**

* Animated logo (Lottie, 2.5s)
* Tagline: *"Your yard. Your snow. Your way."*
* Two CTA buttons:
  * `[ Get Started ]` — solid white, dark text
  * `[ I'm a Pro — Start Earning ]` — outlined white

```tsx
// Splash animation concept
const SplashScreen = () => {
  const snowflakeX = useSharedValue(-200);
  const leafX = useSharedValue(200);
  const opacity = useSharedValue(0);

  useEffect(() => {
    snowflakeX.value = withSpring(0, { damping: 12 });
    leafX.value = withSpring(0, { damping: 12 });
    opacity.value = withDelay(800, withTiming(1, { duration: 600 }));
  }, []);
  // ...
};
```

---

### 2. ONBOARDING — ROLE SELECTION

**Visual:** Clean card-based selector on dark navy background with subtle animated particles (snowflakes + leaves drifting).

**Cards (side by side, swipeable):**

```
┌─────────────────┐    ┌─────────────────┐
│   🏠             │    │   💪             │
│  I need help    │    │  I want to earn │
│                 │    │                 │
│  Book a Pro to  │    │  Set your own   │
│  handle your    │    │  schedule, make │
│  lawn or snow   │    │  $25-$80/hr     │
│                 │    │                 │
│  [Choose This]  │    │  [Choose This]  │
└─────────────────┘    └─────────────────┘
         ↑                      ↑
     Blue card             Green card
```

**Can select both** — shown as a third option "I'm both!" with split-color card.

---

### 3. CUSTOMER HOME SCREEN

**Header Section:**

```
┌────────────────────────────────────────┐
│  👋 Hey Marcus,                        │
│  📍 42 Maple Drive  ▾                  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  🔍  What do you need today?     │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Seasonal Alert Banner (killer feature):**

```
┌────────────────────────────────────────┐
│ ❄️  SNOW ALERT: 8-12" expected tonight │
│     Book a Pro now before they fill up!│
│                    [ Book Now → ]      │
└────────────────────────────────────────┘
```

(Pulls from Weather API — shows green banner for "Perfect mowing weather!" in summer)

**Service Selector — Hero Cards:**

```
┌──────────────────┐  ┌──────────────────┐
│  🌿              │  │  ❄️              │
│                  │  │                  │
│   LAWN           │  │   SNOW           │
│   MOWING         │  │   REMOVAL        │
│                  │  │                  │
│  From $35        │  │  From $45        │
│  ● 12 Pros near  │  │  ● 8 Pros avail  │
│                  │  │                  │
│  [Book Now]      │  │  [Book Now]      │
└──────────────────┘  └──────────────────┘
```

**Active Order Card (if in progress):**

```
┌────────────────────────────────────────┐
│ 🟢  Jake is on his way!               │
│ ━━━━━━━━━━━━━░░░░  8 min away          │
│ Lawn Mowing · 42 Maple Drive          │
│                        [Track Live →] │
└────────────────────────────────────────┘
```

**Recent Pros Section:**
Horizontally scrollable avatar row with names + last service + quick re-book button.

**Promo Banner:**

```
┌────────────────────────────────────────┐
│  ⭐  MOWBLO+   $9.99/mo                │
│  ✓ 10% off every booking              │
│  ✓ Priority matching                  │
│  ✓ Recurring schedules                │
│                         [Learn More]  │
└────────────────────────────────────────┘
```

---

### 4. SERVICE CONFIGURATION SCREEN (The "Cart" Equivalent)

This is the heart of the experience. Step-by-step builder, exactly like customizing a meal.

**Step 1: Property Details**

```
What kind of property?
[🏠 House]  [🏢 Condo]  [🏢 Commercial]  [👴 Senior]

Property size?
  ┌────────────────────────────────────┐
  │ ●──────────────●─────────────○    │
  │ Small     Medium (est.)    Large  │
  │ <2000ft²  2000-5000ft²    5000ft² │
  └────────────────────────────────────┘

Estimated price: $42–$58
```

**Step 2: Service Add-Ons (just like toppings!)**

*For Lawn Mowing:*

```
✅ Standard Mow                    +$0   (included)
☐  Edge Trimming                  +$12
☐  Weed Whacking                  +$10
☐  Leaf Blowout (cleanup)         +$15
☐  Garden Bed Edging              +$20
☐  Bag & Dispose Clippings        +$8
☐  First-Time Deep Clean          +$25
```

*For Snow Removal:*

```
✅ Driveway Clearing               +$0   (included)
☐  Front Walkway                  +$10
☐  Back Patio                     +$12
☐  Roof Rake (safe de-icing)      +$20
☐  De-Icing Salt Application      +$15
☐  Sidewalk to Street             +$8
☐  Full Property Perimeter        +$35
```

**Step 3: Photos (optional but encouraged)**

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│    📷    │  │   🖼️     │  │   🖼️     │
│  Add     │  │ [photo1] │  │ [photo2] │
│  Photo   │  │    ✕     │  │    ✕     │
└──────────┘  └──────────┘  └──────────┘
"Photos help your Pro prepare and get the job done faster!"
```

**Step 4: Special Instructions**

```
┌────────────────────────────────────────┐
│  Anything your Pro should know?        │
│  "Dog in backyard after 3pm, gate      │
│   code is #4421..."                    │
│                                   0/300│
└────────────────────────────────────────┘
```

**Sticky Bottom Summary:**

```
┌────────────────────────────────────────┐
│  Lawn Mow + Edge + Bag clippings       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Subtotal:                      $65    │
│  Mowblo fee (10%):               $6.50 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Total:                         $71.50 │
│                                        │
│        [ Continue to Schedule → ]      │
└────────────────────────────────────────┘
```

---

### 5. SCHEDULING SCREEN

**ASAP vs. Scheduled toggle:**

```
┌─────────────────┐  ┌─────────────────┐
│  ⚡ ASAP        │  │  📅 Schedule    │
│  (within 1-2hr) │  │  Pick a time    │
│  ★ Recommended │  │                 │
└─────────────────┘  └─────────────────┘
```

**Calendar Picker (custom component):**

* Horizontal scrollable week view
* Each day shows a heat indicator (how many Pros are available — green = many, yellow = few, red = busy)
* Time slots shown as card grid with Pro availability counts

**Recurring Options (Mowblo+ feature):**

```
Want automatic scheduling?
○  One-time
○  Weekly  (save 5%)
○  Every 2 weeks  (save 3%)
○  Monthly
```

---

### 6. PRO MATCHING SCREEN

**Visual:** Map view with animated Pro icons approaching. Below the map, a scrollable list of available Pros.

**Map View:**

* User property highlighted with a pulse animation
* Available Pros shown as animated circular avatars on the map
* Estimated drive times shown

**Pro Cards:**

```
┌────────────────────────────────────────┐
│  [Photo] Jake M.          ⭐ 4.97      │
│          Verified Pro · 3 yrs          │
│          📍 0.8 mi away · 12 min ETA   │
│          187 jobs · 99% completion     │
│  Specialties: [🌿 Lawn] [❄️ Snow]      │
│                                        │
│  [$62]    [See Reviews]  [Choose Jake] │
└────────────────────────────────────────┘
```

**Auto-Match CTA:**
`[ ⚡ Best Match for Me — Auto-Select ]`
(algorithm picks best-rated + nearest Pro)

---

### 7. LIVE TRACKING SCREEN

This is the **signature screen** — make it incredible.

**Full-screen map** with:

* Customer property marked with a glowing home icon (pulsing, blue for snow / green for lawn)
* Pro's real-time location as an animated avatar bubble with their photo
* Route line between them (animated dashes, moving toward property)
* ETA countdown in large, prominent display

**Status Timeline (bottom sheet, slides up):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Booking Confirmed        2:14 PM
  ✅  Jake Accepted            2:16 PM
  🔵  Jake is on his way  ← NOW
  ○   Jake Arrived
  ○   Work in Progress
  ○   Job Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Live Actions:**

* `[ 💬 Chat with Jake ]` — in-app messaging
* `[ 📞 Call Jake ]` — masked phone call
* `[ ⚠️ Issue? ]` — quick problem reporting

**Job In Progress State:**

* Timer showing how long Jake has been working
* Live photo updates option (Pro can share progress pics)
* "Ring the bell when done" notification toggle

**Completion Screen:**
Full-screen green/blue confetti explosion 🎉

```
✅  All Done!

Jake completed your lawn mowing.
Duration: 47 minutes
Photos: [3 before/after photos]

How'd Jake do?
⭐ ⭐ ⭐ ⭐ ⭐

[ Leave a Tip ]   [ Rate & Review ]
```

---

### 8. PAYMENT & CHECKOUT

**Saved Payment Methods:**

```
💳 •••• •••• •••• 4242 (Visa)    ✅ Default
💳 •••• •••• •••• 1234 (MC)
📱 Apple Pay
📱 Google Pay
[+ Add Payment Method]
```

**Post-Job Tipping (like Uber Eats tipping screen):**

```
    Leave Jake a tip?

    [ 15% ]  [ 18% ]  [ 20% ]  [ Custom ]
     $9.75   $11.70  $13.00   [_____]

         Great job Jake! ✨
```

**Promo Code:**

```
🎟️  Have a promo code?  [APPLY]
     Try: FIRSTMOW → $10 off your first booking!
```

---

### 9. PRO MODE — DASHBOARD

Mode is toggled from the profile tab — smooth transition animation flips the UI theme from blue/green to a deeper, more professional green-dominant palette.

**Header:**

```
┌────────────────────────────────────────┐
│  🟢  YOU'RE ONLINE                     │
│      Tap to go offline                 │
│                                        │
│  Today's Earnings    This Week         │
│  $127.50            $432.00            │
│                                        │
│  Jobs Today: 3  ·  Rating: ⭐ 4.98    │
└────────────────────────────────────────┘
```

**Available Jobs Feed:**

```
━━━━━━━━━━━━ NEW JOB REQUEST ━━━━━━━━━━━━

┌────────────────────────────────────────┐
│  ❄️  SNOW REMOVAL                     │
│  42 Maple Drive (0.4 mi away)          │
│                                        │
│  🏠 Medium House + Driveway            │
│  ➕ Walkway + De-icing                 │
│  📅 ASAP                              │
│  🖼️ 2 photos attached                 │
│                                        │
│  Payout: $68.00  (+tip potential)      │
│                                        │
│  [          ACCEPT          ]  [Skip]  │
│                            ⏱️ 45s     │
└────────────────────────────────────────┘
```

The **45-second countdown** is a core UX pattern (same as food delivery). Urgency drives acceptance. If declined/ignored, job goes to next Pro.

**Map View for Pros:**

* Heat map showing where demand is high (darker color = more jobs requested)
* Suggested zones: "Move 2 blocks north for 4x more job density"

**Earnings Screen:**

```
┌────────────────────────────────────────┐
│  THIS WEEK                             │
│  ████████████████░░░░  $432 / $500 goal│
│                                        │
│  Mon  ████  $95                        │
│  Tue  ██    $42                        │
│  Wed  ██████ $127                      │
│  Thu  ████  $88                        │
│  Fri  ██    $80  (today, in progress)  │
│                                        │
│  Avg per job: $68.50                   │
│  Best job: $145 (Dec 28 snowstorm 🌨️) │
│                                        │
│  [💸 Cash Out Instantly]  ($2.99 fee)  │
│  [🏦 Bank Transfer (free, 2-3 days)]   │
└────────────────────────────────────────┘
```

**Pro Schedule / Availability:**

```
Set your working hours:

Mon  [ON]   7am ──────────── 6pm
Tue  [ON]   9am ──────── 4pm
Wed  [OFF]
Thu  [ON]   7am ──────────────── 8pm
Fri  [ON]   8am ──────── 3pm
Sat  [ON]   6am ────────────────── 10pm  ← Snow season 💰
Sun  [OFF]

Max jobs per day: [5 ▾]
Service radius:   [10 miles ▾]
```

**Pro Profile Setup:**

```
✅  Identity Verified (government ID)
✅  Background Check Passed
✅  Equipment Checklist
    ✅ Lawn Mower (ride-on/push)
    ✅ Snow Blower
    ✅ Shovel
    ☐  Leaf Blower  ← Add to earn more
    ☐  Professional Edger

✅  Stripe Payout Connected
✅  Insurance Acknowledgement

Profile Completion: 87% ●●●●●●●●○○
```

---

### 10. RATINGS & REVIEWS

**Customer → Pro:**

```
⭐ Overall:         [⭐⭐⭐⭐⭐]
🎯 Quality of Work: [⭐⭐⭐⭐⭐]
⏰ Timeliness:      [⭐⭐⭐⭐⭐]
💬 Communication:   [⭐⭐⭐⭐⭐]

Quick Tags:
[✅ Thorough]  [✅ On time]  [✅ Polite]
[Friendly]    [Careful]    [Professional]

Written review (optional):
┌────────────────────────────────────────┐
│ "Jake did an amazing job clearing our  │
│  driveway before 7am. Super reliable!" │
└────────────────────────────────────────┘
```

**Pro → Customer:**

```
⭐ Overall:         [⭐⭐⭐⭐⭐]

Tags:
[Easy to find]  [Clear instructions]
[Respectful]    [Tipped well 💰]

(Reviews of customers are private — only affect matching)
```

---

### 11. NOTIFICATIONS (Push + In-App)

**Customer notifications:**

* `❄️ Snow alert! 6"+ tonight — pre-book your Pro now`
* `✅ Jake accepted your job and is 12 min away`
* `📍 Jake has arrived at your property`
* `🎉 All done! Rate your experience`
* `🔄 Your weekly lawn mow is scheduled for Saturday 8am`
* `💳 Receipt: $71.50 charged to Visa ••4242`

**Pro notifications:**

* `🔔 New $68 job 0.4mi away — 45 sec to accept!`
* `💰 You've earned $127.50 today! Keep going 🔥`
* `⭐ New 5-star review from Marcus T.`
* `🌨️ STORM ALERT: Expected demand spike tomorrow — stay online for surge pricing!`
* `💸 $85.00 transferred to your bank`

---

## 💰 Business Logic & Pricing Model

### Customer Pricing

```
Base Price Calculation:
  Property Size Score × Service Multiplier × Add-on Total + Mowblo Fee

Example:
  Medium house ($45 base)
  + Lawn mow standard (×1.0 = $45)
  + Edge trimming (+$12)
  + Bag clippings (+$8)
  = $65 subtotal
  + 10% Mowblo fee ($6.50)
  = $71.50 total

Customer pays: $71.50
Pro receives:  $58.50 (after 10% Mowblo cut)
Tip:          100% to Pro
```

### Surge Pricing (CRITICAL FEATURE)

During storms, heat waves, or high demand:

```
⚡ SURGE PRICING ACTIVE ⚡
High demand in your area.
Normal: $65  →  Now: $88 (1.35× surge)
[Book Now at $88]  [Wait for normal pricing]
```

* Surge shown clearly and honestly (like Uber)
* Surge multiplier: 1.2× – 2.5×
* Triggered by: weather events, day-of requests, low Pro availability

### Mowblo+ Subscription

```
MOWBLO+  $9.99/month
──────────────────────
✓ 10% off every booking
✓ Priority Pro matching (skip the queue)
✓ Recurring schedules (weekly/biweekly)
✓ Same-day guaranteed availability
✓ Weather re-schedule protection
✓ Dedicated support line
```

### Pro Earnings Model

```
Standard cut:    Pro keeps 85%, Mowblo takes 15%
Mowblo+ jobs:   Pro keeps 88%, Mowblo takes 12%
                (reward Pros for serving subscribers)
Tips:           100% to Pro
Instant payout: -$2.99 fee
Referral bonus: $25 for each new Pro who completes 10 jobs
```

---

## 🔄 Core User Flows

### Customer Flow (Happy Path)

```
Open App
   ↓
Home Screen — sees Snow Alert banner
   ↓
Taps "Book Snow Removal"
   ↓
Property Setup (size, add-ons)
   ↓
Upload 2 photos of driveway
   ↓
Schedule: ASAP
   ↓
See 3 available Pros on map
   ↓
Tap "Best Match" → Jake auto-selected
   ↓
Price confirmed ($71.50)
   ↓
Tap "Confirm & Pay"
   ↓
Tracking Screen — Jake is 8 min away
   ↓
Push notification: "Jake arrived"
   ↓
Push notification: "All done! View photos"
   ↓
Rating + Tip screen
   ↓
Receipt emailed
   ↓
Offer: "Set up weekly snow monitoring?"
```

### Pro Flow (Happy Path)

```
Open App (Pro mode)
   ↓
Toggle Online
   ↓
Job request pops up (fullscreen card)
   ↓
Review job details (45 sec timer)
   ↓
Tap "Accept"
   ↓
Navigation opens to customer address
   ↓
Tap "I've Arrived" on arrival
   ↓
Start job timer
   ↓
(Optional) Take before photo
   ↓
Complete job
   ↓
Take after photos (encouraged, boosts tips)
   ↓
Tap "Job Complete"
   ↓
Earnings credited instantly
   ↓
Rate customer
   ↓
Back to job feed
```

---

## 🛡️ Trust & Safety

### Pro Verification Pipeline

```
Step 1: Email + Phone verification
Step 2: Government ID (via Stripe Identity or Persona)
Step 3: Background check (via Checkr — $15, covered by Mowblo first 3 months)
Step 4: Equipment self-certification
Step 5: Insurance acknowledgement
Step 6: Optional — Pro training video (unlocks "Verified Pro" badge)
```

### Safety Features for Customers

* All Pros background-checked (badge displayed prominently)
* Masked phone calls (Twilio proxy — customer never sees Pro's real number)
* In-app chat with full message history
* "Share my tracking" — send live tracking link to family member
* Emergency button (calls 911 and alerts Mowblo safety team)
* Property access codes stored securely (not shared with Pro until job accepted)

### Customer Protection Policy

* **Mowblo Guarantee** : If Pro doesn't show, full refund + $10 credit
* **Quality Guarantee** : If unsatisfied, free re-do within 24 hours
* **Damage Protection** : Up to $500 property damage coverage per job

---

## 🎨 Component Specifications

### MowbloButton

```tsx
type MowbloButtonProps = {
  label: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  mode?: 'snow' | 'lawn' | 'neutral';
  size: 'sm' | 'md' | 'lg' | 'full';
  loading?: boolean;
  onPress: () => void;
};

// primary + snow mode → blue background, white text, ice blue shadow
// primary + lawn mode → green background, white text, leaf green shadow
// Full width buttons: height 56px, border radius 16px, SF Pro Rounded Bold 17px
```

### ServiceCard

```tsx
type ServiceCardProps = {
  service: 'lawn' | 'snow';
  title: string;
  subtitle: string;
  priceFrom: number;
  prosAvailable: number;
  urgency?: 'normal' | 'high' | 'surge';
  onPress: () => void;
};

// Card: 160px wide, 200px tall, border radius 20px
// Shadow: 0 8px 24px rgba(0,0,0,0.12)
// Icon: 48px, centered, service color background circle
// Surge badge: absolute top-right, orange, animated pulse
```

### LiveTrackingMap

```tsx
// react-native-maps MapView
// Custom map style: muted blues/greens matching brand
// Pro marker: circular avatar with animated ring pulse (service color)
// Property marker: home emoji on colored circle, 32px
// Route: animated dashed line, 3px wide, brand color
// ETA chip: white card floating over map, bold countdown number
```

### SeasonalParticleBackground

```tsx
// Lottie animation layer rendered behind main content
// Snow mode: 12 small snowflakes, varying opacity, slow drift
// Lawn mode: 8 small leaves, varying sizes, gentle tumble
// Triggered by service selection, smooth crossfade between modes
```

---

## 📊 Key Metrics to Track (Analytics Events)

```
Customer Events:
  app_open, service_selected, quote_viewed, booking_started,
  booking_confirmed, tracking_viewed, job_rated, tip_given,
  subscription_viewed, subscription_started, promo_applied

Pro Events:
  pro_online, pro_offline, job_received, job_accepted, job_declined,
  job_arrived, job_started, job_completed, earnings_viewed, cashout_initiated

Funnel KPIs:
  service_selected → booking_confirmed  (target: >60%)
  booking_confirmed → job_rated          (target: >80%)
  job_completed → tip_given              (target: >35%)
  new_user → booking_confirmed           (target: >45% D7)
```

---

## 🚀 MVP Launch Checklist

### Phase 1 — Core (Weeks 1-8)

* [ ] Auth (email, Google, Apple Sign-In)
* [ ] Customer home + service configuration
* [ ] Manual Pro matching (no auto-assign yet)
* [ ] Stripe payment processing
* [ ] Basic push notifications
* [ ] Customer live tracking screen
* [ ] Pro dashboard + job accept/decline
* [ ] 5-star rating system
* [ ] Admin dashboard for job monitoring

### Phase 2 — Polish (Weeks 9-12)

* [ ] Surge pricing engine
* [ ] Weather API integration + smart banners
* [ ] Recurring bookings
* [ ] In-app chat (Twilio or SendBird)
* [ ] Before/after photo uploads
* [ ] Instant payout (Stripe Express)
* [ ] Referral system
* [ ] Pro earnings analytics

### Phase 3 — Growth (Weeks 13-20)

* [ ] Mowblo+ subscription
* [ ] Auto-matching algorithm
* [ ] Pro heat map + demand forecasting
* [ ] iOS Widget (show upcoming bookings)
* [ ] ProBadge verification program
* [ ] Business/Commercial accounts
* [ ] Franchise/Territory system for high-volume Pros
* [ ] API for HOA / property management integrations

---

## 🌟 Signature "Wow" Features (Differentiators)

### 1. Storm Watch 🌩️

The app monitors local weather forecasts. When a major snow event is predicted 24-48 hours out, customers get a smart push notification:

> *"❄️ 10-14" of snow hitting your area Saturday night. Pre-book Jake (your last Pro) now — only 3 slots left in your zone."*

This drives massive pre-booking revenue and keeps Pros' schedules full.

### 2. Yard Profile 🏡

Customers build a one-time "Yard Profile" — upload photos, mark property boundaries on the map, annotate hazards (gas meters, flower beds, dogs). Every Pro who books immediately knows exactly what to expect. Repeat bookings take <30 seconds.

### 3. Pro Streaks & Gamification 💰

```
🔥  Jake's on a 12-job streak!
     Complete 3 more to unlock Gold Pro status
     Gold Pro benefits: +priority job routing, +$5/job bonus
```

### 4. Instant Re-book 🔄

After a 5-star job, one-tap re-book: *"Book Jake again for next Saturday?"* Pre-fills everything, charges saved card. 3 seconds to re-book.

### 5. Community Leaderboard (Pro Mode) 🏆

```
Top Pros in Ottawa this week:
🥇 Jake M.    $847  |  12 jobs  |  ⭐5.0
🥈 Sarah K.   $712  |  10 jobs  |  ⭐4.9
🥉 Mike D.    $689  |  11 jobs  |  ⭐4.8
```

### 6. The "Neighbor Effect" 🏘️

When a Pro is actively working on a job in your neighborhood, nearby customers get a notification:

> *"🌿 Alex is mowing 3 doors down from you right now! Book the same Pro for $5 off (they're already here)."*

This dramatically improves Pro efficiency (cluster jobs in one neighborhood) and drives impulse bookings.

---

## 📦 Dependencies & Setup

```bash
# Initialize Expo project
npx create-expo-app mowblo --template tabs

# Core navigation
npx expo install expo-router

# Maps
npx expo install react-native-maps

# Animations
npx expo install react-native-reanimated lottie-react-native

# Payments
npm install @stripe/stripe-react-native

# State
npm install zustand @tanstack/react-query

# Firebase
npm install @react-native-firebase/app @react-native-firebase/auth
npm install @react-native-firebase/firestore @react-native-firebase/messaging

# UI
npm install react-native-safe-area-context react-native-gesture-handler
npm install @gorhom/bottom-sheet

# Calendar/Scheduling
npm install react-native-calendars

# Image handling
npx expo install expo-image-picker expo-image-manipulator

# Push notifications
npx expo install expo-notifications

# Location
npx expo install expo-location

# Icons
npm install @expo/vector-icons
```

---

## 💡 Design Principles

1. **Seasonal Delight** — The app should feel  *alive* . Snow animations in winter, lush greens in summer. This is not decoration — it reinforces what the app does at a gut level.
2. **Speed Above All** — From open to confirmed booking in under 90 seconds. Every extra tap is a lost booking.
3. **Trust at Every Step** — Prominently display Pro verification badges, real photos, real reviews. Never show a faceless Pro.
4. **Make Pros Feel Like Heroes** — The Pro side should feel empowering, not exploitative. Big earnings numbers, streak rewards, recognition. Happy Pros = better service = happy customers.
5. **Weather is the Product** — Mowblo succeeds when the weather changes. Build the weather integration deep. It's the difference between a transaction app and a lifestyle app.

---

*Mowblo — Built for the seasons. Built for the hustle.* 🌿❄️
