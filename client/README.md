# CLARIQ Landing Page

A modern, professional landing page for CLARIQ - AI-Powered Sales Intelligence platform, built with Next.js 15, TypeScript, and Framer Motion.

## 🎯 Overview

This landing page showcases CLARIQ's capabilities in revolutionizing sales preparation and execution through:

- Deep Research Engine
- Intelligent Report Generation
- Voice Agent Integration
- Human Sales Enablement

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Custom CSS with Tailwind-inspired utilities
- **Animations:** Framer Motion
- **Fonts:** Google Fonts (Karla, Inconsolata, Unica One)

## 📄 Page Structure

### ✅ Implemented Sections

1. **Hero Section** - Main value proposition with CTAs
2. **Features Section** - Key product capabilities with hover animations
3. **Use Cases Section** - Interactive tabs showing practical applications
4. **How It Works** - 4-step process timeline
5. **Social Proof** - Stats, testimonials, and trust indicators
6. **Call to Action** - Final conversion push with contact options
7. **Footer** - Navigation, links, and company information

## 🎨 Design System

### Color Palette

- **Primary:** Black (#000000)
- **Secondary:** White (#ffffff)
- **Grays:** 50-900 scale for various UI elements
- **Visual Effects:** Subtle gradients and blur effects

### Typography

- **Headings:** Karla (400, 600, 700)
- **Body:** Inconsolata (400, 500, 600)
- **Brand:** Unica One

### Animation Strategy

- **Entrance:** Fade + slide up on scroll
- **Interactions:** Scale and translate on hover
- **Timing:** 300-600ms transitions
- **Performance:** GPU-accelerated transforms

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Navigate to client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
client/
├── app/
│   ├── globals.css          # Design tokens, utilities, components
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx            # Main landing page
├── components/
│   └── home/
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       ├── UseCasesSection.tsx
│       ├── HowItWorks.tsx
│       ├── SocialProof.tsx
│       ├── CallToAction.tsx
│       ├── Footer.tsx
│       └── index.ts
├── lib/
│   └── animation-variants.ts # Framer Motion variants
└── package.json
```

## 🎬 Animation Features

The project uses consistent Framer Motion animation patterns:

- **Scroll-triggered animations** with viewport detection
- **Interactive hover states** for cards and buttons
- **Staggered animations** for lists and grids
- **Smooth transitions** with professional easing

## 📱 Responsive Design

- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

Key responsive features:

- Flexible grid layouts
- Typography scaling
- Touch-friendly interactions
- Optimized spacing

## ♿ Accessibility Features

- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader optimization

## 🔧 Customization

### Design Tokens (CSS Variables)

All design tokens are centralized in `globals.css`:

```css
:root {
  /* Colors */
  --color-primary: #000000;
  --color-secondary: #ffffff;

  /* Spacing (8px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  /* ... */

  /* Typography */
  --font-size-base: 1rem;
  /* ... */
}
```

## 📞 Contact & CTA Integration

Current CTAs point to:

- **Demo Request:** `mailto:demo@clariq.ai`
- **General Contact:** `mailto:hello@clariq.ai`
- **Sales:** `mailto:info@clariq.ai`

Update these in the component files to match your contact preferences.

## 🎯 Key Features

### Interactive Elements

- **Hover Effects:** Cards scale and lift on hover
- **Smooth Scrolling:** Anchor link navigation
- **Scroll Animations:** Elements reveal on view
- **Interactive Tabs:** Use cases section with state management

### Performance Optimizations

- **Lazy Loading:** Off-screen content
- **Code Splitting:** Route-based bundles
- **Font Optimization:** Preloaded Google Fonts
- **Core Web Vitals:** Optimized for performance metrics

### SEO & Meta

- Optimized page titles and descriptions
- Open Graph tags for social sharing
- Twitter Card integration
- Structured semantic markup

## 🚀 Deployment

The site is ready for deployment on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

**Built with ❤️ for modern sales teams**
