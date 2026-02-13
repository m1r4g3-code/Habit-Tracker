# Habit Hero

A premium, mood-aware, gamified habit tracking web app built with Next.js, TypeScript, and Tailwind CSS.

Habit Hero combines disciplined performance tracking (XP, levels, streaks) with subtle emotional context awareness to create a focused, intentional, and psychologically supportive user experience.

This is not a noisy productivity app.  
It is a structured system for consistency and mastery.

---

## ✨ Core Features

- Daily mood check-in (adaptive UI accent + tone)
- Habit creation and completion tracking
- Persistent local storage (structured schema)
- XP-based progression system
- Level calculation logic
- Daily streak tracking
- Premium dark UI with intentional spacing
- Modular architecture for SaaS scalability

---

## 🧠 Product Philosophy

Habit Hero is built on three principles:

### 1. Discipline Without Pressure
Gamification is consistent and structured.  
Mood does not alter streaks or XP logic.

### 2. Emotional Context Awareness
The UI subtly adapts to the user’s daily mood:
- Accent tone changes
- Microcopy tone adjusts
- Animation intensity varies

Core performance metrics remain objective.

### 3. Premium Minimal Design
- No clutter
- No childish gamification
- Intentional spacing
- Subtle motion (150–250ms)
- Calm, confident visual hierarchy

---

## 🏗 Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- LocalStorage (MVP persistence layer)

---

## 📁 Architecture Overview

```
app/
  page.tsx (Dashboard)

components/
  MoodCheckInModal.tsx
  HabitCard.tsx
  ProgressBar.tsx

lib/
  storage.ts
  date.ts
```

### Storage Keys

- `habitHero.v1.habits`
- `habitHero.v1.stats`
- `habitHero.v1.mood`

All persistence logic is isolated in utility modules to prevent hydration conflicts.

---

## 🎮 Gamification Model

### XP System
- Completing a habit grants fixed XP.
- Undoing completion removes XP.
- XP accumulates across days.

### Level Logic
Level is calculated based on total XP:

```
level = floor(totalXP / 100) + 1
```

### Streak Logic
- Streak increments when all habits are completed for the day.
- Streak resets if daily target is missed.
- Mood does not influence streak behavior.

---

## 🔄 Daily Mood System

On first app load each day:
- User selects mood (Focused, Good, Neutral, Frustrated, Low Energy)
- Mood is stored with today's date
- Modal appears once per day only

Mood affects:
- Accent color tone
- Microcopy phrasing
- Animation subtlety

Mood does NOT affect:
- XP
- Streak
- Level progression

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit:
```
http://localhost:3000
```

---

## 📈 Future Roadmap

- AI-based habit suggestions
- Analytics dashboard
- Backend integration (Supabase)
- Authentication layer
- Subscription model
- Real-time sync
- Mobile-first refinement
- SaaS deployment pipeline

---

## 🧑‍💻 Why This Project Exists

Habit Hero was built as a deliberate exercise in:

- Vibecoding with architectural discipline
- Product-first engineering
- Emotional UX design
- SaaS-ready modular structure

It demonstrates how AI-assisted development can produce structured, scalable applications when guided by intentional product design.

---

## 📜 License

This project is for educational and experimental purposes.

---

Built with intentional product thinking.
