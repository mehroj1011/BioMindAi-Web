import { getLocalStorageString, setLocalStorageString, storageKeys } from './storage'

export type Progress = {
  xp: number
  level: number
  streakDays: number
  lastSeenDay: string
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function nextLevelXp(level: number) {
  return 200 + level * 120
}

export function loadProgress(): Progress {
  const raw = getLocalStorageString(storageKeys.progress)
  if (raw) {
    try {
      return JSON.parse(raw) as Progress
    } catch {
      // ignore
    }
  }
  return { xp: 120, level: 2, streakDays: 3, lastSeenDay: todayKey() }
}

export function saveProgress(p: Progress) {
  setLocalStorageString(storageKeys.progress, JSON.stringify(p))
}

export function applyDailyStreak(p: Progress): Progress {
  const today = todayKey()
  if (p.lastSeenDay !== today) {
    p.streakDays = Math.min(p.streakDays + 1, 999)
    p.lastSeenDay = today
    saveProgress(p)
  }
  return p
}

export function addXp(amount: number): Progress {
  const p = loadProgress()
  applyDailyStreak(p)
  p.xp += Math.max(0, Math.floor(amount))
  while (p.xp >= nextLevelXp(p.level)) {
    p.xp -= nextLevelXp(p.level)
    p.level += 1
  }
  saveProgress(p)
  return p
}

export function resetProgress() {
  const p: Progress = { xp: 0, level: 1, streakDays: 0, lastSeenDay: todayKey() }
  saveProgress(p)
}

