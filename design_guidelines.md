# RAG-Powered AI Platform Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from enterprise productivity tools like Linear, Notion, and modern dashboard applications. This approach emphasizes clean data presentation, sophisticated dark themes, and professional enterprise aesthetics.

## Core Design Elements

### A. Color Palette
**Dark Mode (Primary)**
- Primary: `217 91% 60%` (#1F6FEB)
- Surface: `222 84% 5%` (#0B1020) 
- Card: `222 84% 11%` (#0F172A)
- Text: `220 13% 91%` (#E5E7EB)
- Success: `142 76% 47%` (#22C55E)
- Warning: `38 92% 50%` (#F59E0B)
- Danger: `0 72% 51%` (#EF4444)
- Info: `199 89% 48%` (#38BDF8)

**Light Mode**
- Surface: `0 0% 100%` (white)
- Card: `220 14% 96%` (#F8FAFC)
- Text: `222 84% 5%` (#0F172A)
- Borders: `220 13% 91%` (#E5E7EB)

### B. Typography
**Font Family**: Inter via Google Fonts CDN
**Hierarchy**:
- H1: 32px, weight 600, letter-spacing -0.02em
- H2: 24px, weight 600, letter-spacing -0.01em  
- H3: 20px, weight 500
- Body: 16px, weight 400, line-height 1.5
- Caption: 14px, weight 400, opacity 0.7

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: m-8, m-12
- Card spacing: p-6
- Button padding: px-4 py-2, px-6 py-3

### D. Component Library

**Navigation**
- Sidebar: 280px fixed width, collapsible to 64px icon-only
- Top bar: 64px height with search, user menu, theme toggle
- Breadcrumbs for deep navigation

**Data Display**
- Cards: rounded-lg, subtle shadows, hover elevation
- Tables: zebra striping, sortable headers, pagination
- Charts: Minimal grid lines, branded color palette
- Badges: Small rounded-full status indicators

**Forms & Inputs**
- Input fields: rounded-md borders, focus rings in primary color
- Buttons: Primary (filled), Secondary (outline), Ghost (text)
- Toggles: iOS-style switches for settings
- Multi-select: Tokenized chips with remove buttons

**Overlays**
- Modals: Backdrop blur, centered max-width containers
- Drawers: Slide-in panels for detail views
- Tooltips: Dark background, white text, small arrow
- Toasts: Top-right positioned, auto-dismiss

**Widget Components**
- Floating launcher: 60px circle, bottom-right positioned
- Chat panel: 400px width desktop, full-screen mobile
- Message bubbles: User (right, primary color), AI (left, card color)
- Citation chips: Hover previews, source links

### E. Interaction Patterns

**Loading States**
- Skeleton screens for data-heavy components
- Streaming text animation for AI responses
- Progress indicators for crawl jobs

**Empty States**
- Centered illustrations with helpful CTAs
- Contextual suggestions for next actions
- Clear guidance for first-time users

**Error Handling**
- Inline validation messages
- Retry mechanisms for failed operations
- Graceful degradation for connectivity issues

## Responsive Behavior

**Breakpoints**
- Desktop: ≥1280px (full sidebar, multi-column layouts)
- Tablet: 768-1279px (collapsible sidebar, stacked components)
- Mobile: ≤767px (hidden sidebar, single column, bottom sheets)

**Mobile Adaptations**
- Bottom navigation for primary actions
- Swipe gestures for drawer panels
- Thumb-friendly touch targets (44px minimum)
- Full-screen modals instead of centered overlays

## Accessibility Features

- WCAG 2.1 AA compliance
- 4.5:1 contrast ratios for all text
- Focus rings on all interactive elements
- Keyboard navigation for all workflows
- Screen reader announcements for dynamic content
- Reduced motion preferences respected

## Theme Implementation

- Explicit theme toggle in header
- System preference detection as default
- Consistent theme application across widget embeds
- CSS custom properties for easy theme switching
- Local storage persistence for user preference