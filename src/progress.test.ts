import { describe, expect, it } from 'vitest'
import { checkQuantities, steps } from './recipe'
import { initialProgress, progressReducer, remainingSeconds } from './progress'

describe('recipe and progress', () => {
  it('starts with auto timing off and no expired countdown', () => {
    expect(initialProgress.autoTimer).toBe(false)
    expect(remainingSeconds(initialProgress.timer, Date.now())).toBeNull()
    expect(progressReducer(initialProgress, { type: 'inspect', stepId: 4 }).timer).toBeNull()
  })
  it('reconciles every full recipe quantity with step additions', () => {
    expect(checkQuantities()).toEqual([])
  })
  it('shows prep amounts and pan additions without double counting reused ingredients', () => {
    expect(steps[1].handled).toEqual([{ id: 'tomato', amount: 2, display: '2 个 · 约 300 g' }])
    expect(steps[2].handled).toEqual([{ id: 'egg', amount: 3, display: '3 个' }])
    expect(steps[1].additions).toEqual([])
    expect(steps[2].additions).toEqual([])
    expect(steps[4].additions).toContainEqual({ id: 'egg', amount: 3, display: '3 个 · 已打散' })
    expect(steps[5].additions).toContainEqual({ id: 'tomato', amount: 2, display: '2 个 · 约 300 g' })
    expect(steps[6].reused).toContainEqual({ id: 'egg', amount: 3, display: '3 个 · 已炒好，回锅' })
    expect(checkQuantities()).toEqual([])
  })
  it('inspecting a node does not complete it or start a timer', () => {
    const viewed = progressReducer(initialProgress, { type: 'inspect', stepId: 5 })
    expect(viewed.activeStepId).toBe(1)
    expect(viewed.completedIds).toEqual([])
    expect(viewed.timer).toBeNull()
    expect(progressReducer(viewed, { type: 'complete', now: 1000 })).toEqual(viewed)
    expect(progressReducer(viewed, { type: 'start-timer', now: 1000 })).toEqual(viewed)
  })
  it('auto starts only when advancing into a timed step', () => {
    let state = progressReducer(initialProgress, { type: 'auto-timer', enabled: true })
    state = progressReducer(state, { type: 'inspect', stepId: 3 })
    expect(state.timer).toBeNull()
    state = progressReducer(state, { type: 'continue-from-inspected' })
    state = progressReducer(state, { type: 'complete', now: 1000 })
    expect(state.activeStepId).toBe(4)
    expect(state.timer).toEqual({ stepId: 4, endsAt: 31000, durationSeconds: 30 })
    expect(remainingSeconds(state.timer, 16000)).toBe(15)
    expect(remainingSeconds(state.timer, 40000)).toBe(0)
    expect(progressReducer(state, { type: 'auto-timer', enabled: false }).timer).toEqual(state.timer)
  })
  it('can enable auto timing before advancing from prep to the first timed step', () => {
    let state = progressReducer(initialProgress, { type: 'complete', now: 1000 })
    state = progressReducer(state, { type: 'complete', now: 2000 })
    expect(state.activeStepId).toBe(3)
    state = progressReducer(state, { type: 'auto-timer', enabled: true })
    expect(state.timer).toBeNull()
    state = progressReducer(state, { type: 'complete', now: 3000 })
    expect(state.activeStepId).toBe(4)
    expect(state.timer).toEqual({ stepId: 4, endsAt: 33000, durationSeconds: 30 })
  })
})
