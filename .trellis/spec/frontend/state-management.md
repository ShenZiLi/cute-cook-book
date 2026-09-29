# Frontend State and Local Data Contracts

## 1. Scope / Trigger

This app has no server state. Use this contract when changing recipe quantities, step navigation, countdowns, or the finished dish photo. The source modules are `src/recipe.ts`, `src/progress.ts`, and `src/photo.ts`.

## 2. Signatures

```ts
progressReducer(state: ProgressState, action: ProgressAction): ProgressState
remainingSeconds(timer: TimerState | null, now: number): number | null
loadProgress(): ProgressState
saveProgress(state: ProgressState): boolean
checkQuantities(): string[]
getPhoto(): Promise<Blob | null>
savePhoto(blob: Blob): Promise<void>
deletePhoto(): Promise<void>
```

## 3. Contracts

- `ProgressState` stores `stage`, `inspectedStepId`, `activeStepId`, `completedIds`, `autoTimer`, and `timer`. `inspectedStepId` is the card being viewed; `activeStepId` is the step being followed.
- `inspect` changes the viewed card only. `complete` works only when inspected and active IDs match, marks the active step complete, and advances. `continue-from-inspected` explicitly changes the active step without marking earlier steps complete.
- `TimerState` holds `stepId`, absolute epoch-millisecond `endsAt`, and `durationSeconds`. Remaining time is derived from `endsAt - now`, not from accumulated interval ticks. `autoTimer` defaults to false and must be available before the first timed step. Toggling it does not start or reset an existing timer. A timer ends without completing or advancing a step.
- `RecipeStep.handled` represents prep work, `additions` represents first actual inclusion in the dish, and `reused` represents already prepared food returning to the pan. All three may appear on the step card, but only `additions` contributes to `checkQuantities()`. Every `StepMaterial` has ingredient `id`, numeric `amount`, and user-facing `display` with calibrated unit text.
- Small progress/settings data goes to localStorage. The finished photo Blob goes to IndexedDB through `src/photo.ts`. No photo is sent to a server.

## 4. Validation & Error Matrix

| Condition | Behavior |
| --- | --- |
| No saved progress, malformed JSON, or unavailable localStorage read | `loadProgress()` returns `initialProgress`. |
| Saved step ID is not part of the recipe | Restore a valid default ID; do not render an unknown step. |
| localStorage write fails | `saveProgress()` returns false; UI must not claim the progress was saved. |
| User inspects another step | Keep completion and timer unchanged; disable starting that step's timer until explicitly following it. |
| Timer target is in the past | Render zero remaining and a foreground “check food” cue; never auto-advance or issue background notification. |
| IndexedDB photo transaction fails or storage is unavailable | Reject the operation and show a failure message; do not show “saved”. |
| Photo type/size is unacceptable | Reject before saving and explain the constraint in the UI. |
| `checkQuantities()` returns any item | Recipe data is inconsistent; fix the model before release. |

## 5. Good / Base / Bad Cases

- Good: At step 03, enable auto timer; completing the step enters timed step 04 and sets an end timestamp. On return from a hidden page, remaining time is recalculated.
- Base: With auto timer off, enter step 04 and display its reference duration with a manual Start control.
- Bad: Count tomato 2 at cutting and tomato 2 at pan addition as 4 total; cutting belongs in `handled`, pan addition in `additions`.
- Bad: Treat `setInterval` ticks as elapsed cooking time while the app is hidden; browsers throttle background timers.

## 6. Tests Required

- `src/progress.test.ts`: inspecting a step does not complete, advance, or start its timer; completing a step does.
- Enter the first timed step with auto timer on/off and assert end timestamp vs ready state. Toggling auto timer must preserve an existing timer.
- Simulate a later `now` and assert `remainingSeconds` reaches zero without advancing.
- Assert `checkQuantities()` is empty for the recipe and that prep handling/reuse do not contribute to actual-addition totals.
- Manually verify photo save, reload, replace, delete, and storage failure feedback in a mobile browser.

## 7. Wrong vs Correct

```ts
// Wrong: viewing a node is not evidence that the user finished it.
case 'inspect': return { ...state, activeStepId: action.stepId, completedIds: [...state.completedIds, action.stepId] }

// Correct: viewing changes only the inspected card and its stage.
case 'inspect': {
  const step = steps.find(item => item.id === action.stepId)
  return step ? { ...state, inspectedStepId: step.id, stage: step.stage } : state
}
```

This convention prevents accidental timer starts and false completion when a user jumps around to see the full cooking process.
