# Motion Guide for NeoTaste Prototype

## Why this file exists

Motion is one of the biggest factors in whether a prototype feels like a real app or a website pretending to be one. The difference between "this feels right" and "something's off" usually comes down to timing, easing, and knowing when not to animate.

This guide gives Claude (and you) clear rules so that motion stays consistent across the entire prototype without anyone needing to make judgment calls every time something moves on screen.


## Motion personality

NeoTaste is a consumer utility app. People open it to find a deal, pick a restaurant, and book. Motion should feel responsive, confident, and invisible. The closest reference points are apps like Apple Maps, Uber Eats, or the native iOS Settings app. Things move because they need to communicate something, not because movement looks cool.

This is not a portfolio site, a marketing page, or a creative showcase. No dramatic reveals, no parallax, no magnetic cursors, no scroll-triggered animations, no staggered entrance sequences.


## How iOS actually handles motion

This is worth understanding because it shapes every decision below.

Native iOS apps use spring animations for almost everything. Apple's own design team has talked extensively about this: springs maintain continuous velocity, which means motion never starts or stops abruptly. Even when there's no visible bounce, the underlying physics are spring-based. That's what gives iOS its characteristic feel where everything seems to glide to a stop rather than snapping into place.

For this prototype, we're building for the web, not SwiftUI. We can't use true spring physics everywhere without a library like `motion` (Framer Motion). So the rule is:

- For simple state changes (opacity, color, scale on tap), use CSS transitions with `cubic-bezier` curves that approximate iOS feel.
- For gesture-driven interactions (drag, swipe, carousel snap) or shared layout animations (card expanding to detail), use the `motion` package, which gives us real spring physics.

The CSS curve that most closely matches iOS's default non-bouncy spring is:

```
cubic-bezier(0.2, 0.9, 0.3, 1.0)
```

Use this as the default easing for most transitions. It starts quickly and decelerates gradually, which feels natural and responsive. Avoid `ease-in-out` for navigation and content transitions because it starts slowly, which adds perceived latency on mobile.


## Timing reference

Keep these durations consistent across the prototype. Faster is almost always better for a utility app. If something feels sluggish during testing on a phone, shorten it.

**Instant feedback (under 150ms).** Tap feedback on buttons and cards. The user's finger is still on the screen, so the response needs to feel connected to their touch. 100ms, using `cubic-bezier(0.2, 0.9, 0.3, 1.0)`.

**Quick transitions (150-250ms).** Tooltips appearing, popovers opening, badges updating, toggle switches, tab content swapping. These are small UI state changes that should feel crisp. 150-200ms, same easing.

**Standard transitions (250-350ms).** Screen push/pop navigation, bottom sheets sliding up, modals appearing, horizontal carousel snapping to a new card. These involve larger areas of the screen changing, so they need a little more time to read. 250-300ms. For bottom sheets specifically, use `cubic-bezier(0.32, 0.72, 0, 1)` which matches iOS's sheet presentation curve.

**Nothing should ever take longer than 400ms.** If an animation is that slow in a utility app, it's getting in the way.


## Interactions to include

These are the specific micro-interactions that make the prototype feel alive. Each one is small, but together they create the feeling of a polished app.

**Tap feedback on cards and list items.** When a user presses a restaurant card, deal card, or list row, scale it down to `0.97` on press and return to `1.0` on release. 100ms, ease-out. This is the single most impactful thing you can do to make a prototype feel real. Without it, tapping feels like clicking a website.

**Button press states.** Primary buttons (the green CTAs) should have a slight opacity reduction to `0.85` on press. Secondary buttons and icon buttons should have a subtle background highlight. 100ms.

**Screen navigation.** When pushing forward (e.g., tapping a restaurant to see its detail page), the new screen slides in from the right while the current screen slides slightly to the left and dims. 300ms. When going back, reverse the direction. This matches iOS's native push/pop transition.

**Bottom sheets.** Sheets slide up from the bottom with a slight deceleration curve (they arrive fast and settle gently). 300ms, `cubic-bezier(0.32, 0.72, 0, 1)`. Include the grabber handle at the top. If dismissible, the sheet should be draggable downward and dismiss with velocity. This is where the `motion` package is worth using for the drag physics.

**Heart/save toggle.** When favoriting a restaurant, the heart icon fills and scales briefly to `1.15` then settles back to `1.0`. 200ms total. A small thing, but it gives satisfying feedback for an action the user will repeat often.

**Tab bar switching.** Instant. No crossfade, no slide. The content just appears. The active tab indicator (the green bar or icon fill change) can transition over 150ms, but the page content itself should swap immediately. This matches iOS behavior.

**Horizontal carousel snap.** When a user swipes a horizontal row of cards (like "Friends' Picks" or trending restaurants), the carousel should snap to the nearest card with momentum. 200-250ms deceleration. If using the `motion` package, use drag constraints with snap points.

**Toast notifications.** Success messages (like "Successfully updated!" on the profile screen) should slide down from the top, hold for 2-3 seconds, then slide back up. 250ms for the entrance, same for exit.


## What not to animate

**Page load content.** When a screen loads, all content should appear immediately. Do not fade in elements, do not slide them up from below, do not stagger list items one by one. The user navigated here on purpose. Show them what they came for.

**Scroll-driven effects.** No parallax on food images. No headers that shrink with scroll (unless the original Figma design includes a collapsing header). No reveal animations triggered by scroll position. Content is just there.

**Hover states.** This is a mobile prototype. There is no cursor. Do not add hover effects to any element. If Claude adds `:hover` styles, remove them.

**Color transitions on navigation.** The tab bar, status bar, and navigation bar should not animate their colors or backgrounds.

**Decorative motion.** No pulsing indicators, no floating elements, no ambient background animation. The only things that move are things the user caused to move.


## Accessibility: Reduce Motion

iOS has a system setting called "Reduce Motion" that many users enable because animation causes them discomfort (motion sensitivity, vestibular disorders). A thoughtful prototype respects this.

Wrap motion in a `prefers-reduced-motion` media query check. When reduced motion is enabled:

- Replace slide transitions with instant cuts or simple crossfades (150ms opacity only)
- Remove all scale animations on tap
- Keep the heart toggle but remove the scale bounce (just swap filled/unfilled)
- Bottom sheets appear instantly instead of sliding

In CSS:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

In the `motion` package, check `useReducedMotion()` and set animation values to `{ duration: 0 }`.

This takes five minutes to implement and shows the Neotaste team (and your peers) that you understand inclusive design.


## Implementation notes

Prefer CSS transitions for anything that doesn't involve gestures. Tailwind makes this straightforward:

```
transition-transform duration-100    /* tap feedback */
transition-all duration-300          /* page transitions */
transition-opacity duration-200      /* fade in/out */
```

Override Tailwind's default easing with the iOS-approximating curve:

```css
:root {
  --ease-ios: cubic-bezier(0.2, 0.9, 0.3, 1.0);
  --ease-sheet: cubic-bezier(0.32, 0.72, 0, 1);
}
```

Then apply with `style={{ transitionTimingFunction: 'var(--ease-ios)' }}` or define a custom Tailwind utility.

Only reach for the `motion` package when you need drag/swipe gesture detection, spring physics on interactive elements (carousel, dismissible sheet), or shared layout animations (card morphing into detail view). For everything else, CSS transitions are simpler, more performant, and don't add to bundle size.


## The gut check

When you test the prototype on your phone, motion should feel like part of the furniture. If you notice an animation, it's probably too slow or too dramatic. If tapping feels dead and flat, you're missing feedback. The goal is that sweet spot where the prototype feels responsive and considered, but the user's attention stays on the restaurants, the deals, and the social signals. Never on the interface chrome.
