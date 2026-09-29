import { steps, type Stage } from './recipe'

export interface TimerState { stepId: number; endsAt: number; durationSeconds: number }
export interface ProgressState {
  stage: Stage
  inspectedStepId: number
  activeStepId: number
  completedIds: number[]
  autoTimer: boolean
  timer: TimerState | null
}

export type ProgressAction =
  | { type: 'stage'; stage: Stage }
  | { type: 'inspect'; stepId: number }
  | { type: 'return-active' }
  | { type: 'continue-from-inspected' }
  | { type: 'complete'; now: number }
  | { type: 'auto-timer'; enabled: boolean }
  | { type: 'start-timer'; now: number }
  | { type: 'reset-timer' }

export const initialProgress: ProgressState = {
  stage: 'ingredients', inspectedStepId: 1, activeStepId: 1, completedIds: [], autoTimer: false, timer: null,
}

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'stage': return { ...state, stage: action.stage }
    case 'inspect': {
      const step = steps.find(item => item.id === action.stepId)
      return step ? { ...state, inspectedStepId: step.id, stage: step.stage } : state
    }
    case 'return-active': {
      const step = steps[state.activeStepId - 1]
      return { ...state, inspectedStepId: step.id, stage: step.stage }
    }
    case 'continue-from-inspected': return { ...state, activeStepId: state.inspectedStepId }
    case 'complete': {
      if (state.inspectedStepId !== state.activeStepId) return state
      const current = steps.find(item => item.id === state.activeStepId)
      if (!current) return state
      const next = steps.find(item => item.id === current.id + 1)
      const completedIds = state.completedIds.includes(current.id) ? state.completedIds : [...state.completedIds, current.id]
      if (!next) return { ...state, completedIds, activeStepId: current.id, timer: null }
      const timer = state.autoTimer && next.durationSeconds
        ? { stepId: next.id, endsAt: action.now + next.durationSeconds * 1000, durationSeconds: next.durationSeconds }
        : null
      return { ...state, completedIds, activeStepId: next.id, inspectedStepId: next.id, stage: next.stage, timer }
    }
    case 'auto-timer': return { ...state, autoTimer: action.enabled }
    case 'start-timer': {
      if (state.inspectedStepId !== state.activeStepId) return state
      const step = steps.find(item => item.id === state.inspectedStepId)
      return step?.durationSeconds
        ? { ...state, timer: { stepId: step.id, endsAt: action.now + step.durationSeconds * 1000, durationSeconds: step.durationSeconds } }
        : state
    }
    case 'reset-timer': return { ...state, timer: null }
  }
}

export function remainingSeconds(timer: TimerState | null, now: number): number | null {
  return timer ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : null
}

const storageKey = 'cute-cook-book:progress:v1'

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return initialProgress
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return initialProgress
    const saved = value as Partial<ProgressState>
    const validIds = new Set(steps.map(step => step.id))
    return {
      stage: ['ingredients', 'prep', 'cook', 'finished'].includes(saved.stage ?? '') ? saved.stage! : initialProgress.stage,
      inspectedStepId: validIds.has(saved.inspectedStepId ?? -1) ? saved.inspectedStepId! : 1,
      activeStepId: validIds.has(saved.activeStepId ?? -1) ? saved.activeStepId! : 1,
      completedIds: Array.isArray(saved.completedIds) ? saved.completedIds.filter(id => validIds.has(id)) : [],
      autoTimer: saved.autoTimer === true,
      timer: saved.timer && validIds.has(saved.timer.stepId) && Number.isFinite(saved.timer.endsAt) && Number.isFinite(saved.timer.durationSeconds) ? saved.timer : null,
    }
  } catch { return initialProgress }
}

export function saveProgress(state: ProgressState): boolean {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); return true } catch { return false }
}
