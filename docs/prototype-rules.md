# Prototype Rules for NeoTaste Social Discovery

## What this is

This is a mobile prototype for a social discovery feature inside NeoTaste, a restaurant deals and discovery app. It will be deployed to Vercel and tested by real users on their phones.

This prototype recreates an iOS app experience in the browser. That means it should look, feel, and behave like a native iPhone app, even though it's built with web technologies. Every decision in this file is in service of that goal.


## Design system

Use the exact color tokens, typography, spacing, and border radius values from `neotaste-design-system.md`. Do not substitute or approximate. Here are the key tokens for quick reference:

- Primary accent: `#00E676` (green). Used for CTAs, deal badges, active tab indicators, and progress bars.
- Background: `#FFFFFF` (white). The app is light mode only.
- Text primary: `#1A1A1A` (near black). Headings, restaurant names, body copy.
- Text secondary: `#6B7280` (gray). Timestamps, distances, supporting labels.
- Cards: white background, 12px corner radius, subtle shadow (`0 1px 3px rgba(0,0,0,0.08)`).
- Typography: SF Pro Display / SF Pro Text / system sans-serif. Headings are bold, body is regular weight, captions and metadata are medium weight at 13-14px.
- Spacing: 8px base unit. Use multiples: 8, 16, 24, 32, 48.
- Buttons (primary): full-width, 48px height, 24px corner radius, `#00E676` background, white text, 16px semibold.
- Deal badges: `#00E676` background, 6px corner radius, 12px horizontal padding, white text, 13px font.
- Star ratings: filled stars use dark green (`#1B5E20`), unfilled stars use light gray.

For the full specification and component details, always defer to `neotaste-design-system.md`.


## Visual fidelity

Match my Figma screens exactly. Do not add visual elements, decorations, icons, or styling that isn't in my design. When in doubt, simpler is better.

Food photography carries the visual weight in this app. The UI should be clean and stay out of the way. No gradients, no decorative illustrations, no background patterns unless my Figma design explicitly includes them.


## iOS conventions

This prototype should feel like a native iOS app. Here are the conventions to follow:

**Safe areas.** All screens must respect iOS safe areas. The status bar area at the top is 54pt (accounting for the Dynamic Island on modern iPhones). The home indicator area at the bottom is 34pt. Content should never be hidden behind either. The status bar itself (time, signal, battery) does not need to be rendered in the prototype.

**Navigation.** iOS navigation follows a consistent hierarchy:
- Tab bar sits at the bottom for top-level sections. It should be fixed and always visible on screens that have it.
- Back navigation uses a left-pointing chevron in the top-left corner. Screens that are pushed onto a stack (like a restaurant detail page from the discover list) should include this back affordance.
- Modal sheets slide up from the bottom and include a small grabber handle at the top center (like the review flow in NeoTaste).

**Scrolling.** The primary scroll direction is vertical. Horizontal scrolling is reserved for specific row content like carousels, category filters, and deal badge rows. Do not make entire pages scroll horizontally.

**Transitions.** When navigating between screens:
- Push transitions (drilling into a detail view) should slide in from the right.
- Modal sheets should animate up from the bottom with a slight spring curve.
- Tab switches should be instant, no transition animation.
- Avoid jarring state changes. If an element appears or disappears, give it a brief fade or slide so it feels intentional.

**Touch interactions.** Interactive elements should have visible tap feedback. Buttons should have a subtle scale-down or opacity change on press. Cards and list items should have a light highlight state on tap. This is what makes a prototype feel alive instead of flat.


## Layout and sizing

Mobile only. 393px viewport width (matches iPhone 14/15/16), full height. Do not add desktop breakpoints or responsive layouts. This is a phone app.

Touch targets must be at least 44x44pt (Apple HIG minimum). If a button or tappable element in my design appears smaller than this, extend the invisible hit area to 44pt while keeping the visual size as designed. Maintain at least 8px of space between adjacent touch targets to prevent mis-taps.


## Screen states

Every screen should handle at least two states: the primary state with content, and the zero/empty state. NeoTaste already has a clear pattern for empty states (centered illustration or icon, bold heading, supporting text below, and a green CTA button). Follow this same pattern.

Think about what happens when:
- A user has no bookings yet
- A user has no friends on the platform
- A user has no favourites saved
- A section has no content to show
- A list has been scrolled to the end

These are the moments that define whether a prototype feels considered or thrown together.


## Content and data

Use realistic mock data that matches the market you're designing for.

If your concept is set in Germany: German restaurant names, deal types like "2für1 Coffee & Cake", "Free Drink", "10€ Rabatt", and user names like Tobi, Lena, Max, Anna. Cuisine labels in German where appropriate.

If your concept is set in the UK: British restaurant names, deal types like "2for1 Coffee & Cake", "Free Drink", "£10 Discount", and names like Sarah, James, Emma, Ollie.

Use realistic ratings (4.2 to 4.9 range, not everything is 5 stars), plausible distances (0.3 km to 8 km), and real-sounding review counts (13 to 2,771).

All images must come from the `/public/images/` folder. Reference them as `/images/[filename]`. Do not use placeholder URLs, external image URLs, or made-up file paths. Only reference files that actually exist in the images folder.


## Accessibility baseline

These are not optional polish items. They are part of building something real people will use.

- Text contrast: body text must meet 4.5:1 contrast ratio against its background. Large text (18px+ bold or 24px+ regular) must meet 3:1.
- All interactive elements need a visible focus state for keyboard and assistive tech users.
- Images that convey meaning need descriptive alt text. Decorative images (backgrounds, purely visual flourishes) should have empty alt attributes.
- Text should be readable at the default system font size without needing to zoom.
- Color should never be the only indicator of state. If something is "active" or "selected," it should also have a shape, weight, or position change, not just a color change.


## Tech stack

We're using Next.js with Tailwind CSS (App Router). If those words don't mean much to you yet, that's fine. Next.js is the most common framework for building React web apps. It gives us fast page loads and easy deployment. Tailwind lets us write styles directly in our components instead of maintaining separate CSS files.

- Single-file components where possible. Keep it simple.
- Use CSS variables for design tokens so they're easy to update across the whole project.
- No external UI component libraries (no Material UI, no Chakra, no shadcn). We build components from scratch using Tailwind to match the NeoTaste design system exactly.
- Keep the bundle size small. This prototype needs to load fast on a phone over a cellular connection.


## How to work together

Build exactly what I describe. If you think something is missing or could be improved, ask me before adding it. The goal is to match my design decisions, not to make your own.

When I ask you to fix something, fix that thing. Don't change other parts of the code at the same time, even if you think they could be improved. Unrelated changes introduce risk and make it harder to track what's happening.

If existing code is working, leave it alone unless I specifically ask for a refactor or restructure.

Focus on the core interaction first. We'll layer in polish (transitions, micro-interactions, edge case handling) in passes. Get the bones right before we refine.

Don't add analytics, tracking, or SEO meta tags. This is a prototype, not a production app.
