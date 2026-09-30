# Mobile Recipe Presentation

## Scope

The first release follows the six reference screens in `docs/superpowers/prototypes/tomato-egg/`: home, ingredients, prep, overview, cooking, and finished. Device frames and system status bars are outside the web UI. Recipe amounts and timer durations come from `src/recipe.ts`, even when the reference artwork contains different sample values.

## Static Illustration Contract

```tsx
Scene({ step, compact = false }: { step: RecipeStep; compact?: boolean })
```

- Scene artwork is static in every stage. Store watercolor images locally in `src/assets/`, import them through Vite, and render them with descriptive alt text.
- Preserve the full food/utensil subject using `object-fit: contain`; avoid stretching or hiding it behind the footer.
- Overview is a manually selected storyboard. Its selected frame is local presentation state and must not dispatch progress completion or timer actions.
- Scene loops, autoplay, pause/replay controls, and animated food/utensils are outside this release.

## Viewport and Scroll Contract

- `.page` is a flex column with `height: 100dvh` and `overflow: hidden`. Keep headers and the primary footer outside scrollable detail panes.
- Give shrinking flex children `min-height: 0`. Long ingredient lists, cooking details, prep details, and `.photo-section` may scroll internally using `overflow-y: auto` and `overscroll-behavior: contain`.
- The finished page's “我的料理记录” area must retain its own vertical scroll after a photo and feedback message appear.
- Respect safe area insets at the bottom CTA. At 390 × 844 and 375 × 667, the document must not overflow either axis, and the primary action must remain visible.

```css
.stage-body { flex: 1; min-height: 0; overflow: hidden; }
.photo-section { flex: 1; min-height: 0; overflow-y: auto; }
```

## Verification

- Visually compare all six views with the reference content area at both target viewports; also check an inspected step banner, a long quantity list, and a populated photo record.
- Assert document dimensions do not exceed the viewport; verify internal scroll reaches all details without moving the footer.
- Select overview segments and inspect step nodes while a countdown is running: the active step, completion list, and timer end timestamp must remain unchanged.
- Run the frontend index quality gates after product changes.

## Common Mistake

Using `height: auto` on the page or omitting `min-height: 0` on a detail pane makes the whole recipe grow into a long page. Keep the viewport shell fixed and allow only the designated pane to scroll.
