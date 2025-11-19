# Marine Layer Advisors Dashboard - v0.dev Review Prompt

## Project Overview
A professional options screening dashboard for financial advisors. The design should be clean, modern, and trustworthy.

## Current Components

### Main Dashboard (`app/page.tsx`)
- Dark navy header (#0f172a) with "Marine Layer Advisors | Opportunity Radar"
- Filter buttons: All Opportunities, Income Generator, Cheap Protection
- Data table with columns: Ticker, Company, Price, IV Rank (progress bar), Strategy (badge)
- Responsive design

### Spotlight Card (`app/components/SpotlightCard.tsx`)
- Slide-over panel (600px wide on desktop, full width on mobile)
- Strategy badge (Green for Income, Blue for Protection)
- Key metrics boxes (99th %ile Crowding, Skew Status, IV Status)
- Additional metrics grid (Price, IV Rank, Skew, Put/Call Ratio)
- Option recommendations section:
  - Covered Calls: Strike, OTM%, Days to Exp, Upside%, Option Yield, Annualized Yield
  - Collars: Put/Call strikes, Net Cost, Downside Protection, Upside Cap
- Marine Layer Take text block
- "Request Term Sheet" button

### Data Table (`app/components/DataTable.tsx`)
- Sortable table with hover effects
- IV Rank progress bars (color-coded: Red >70%, Orange 50-70%, Yellow 30-50%, Green <30%)
- Strategy badges with icons

## Design Requirements
- Professional financial theme
- Dark navy header (#0f172a)
- White backgrounds
- Subtle gray borders
- Clean sans-serif typography (Inter/Geist)
- Mobile responsive

## Request for v0.dev
Please review this design and suggest improvements for:
1. Better visual hierarchy
2. More polished UI components
3. Improved spacing and typography
4. Enhanced data visualization
5. Better mobile experience
6. More professional color scheme
7. Improved accessibility

## Current Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS v4
- TypeScript
- Lucide React icons

